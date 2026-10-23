#!/usr/bin/env python3
"""轻量 gptibo 兼容 API：catalog + create/list orders（模拟支付）。

华为 1.7GiB / 无 Docker 场景下，与静态前端同机运行即可。
默认监听 127.0.0.1:8090；可用环境变量 HOST/PORT/DATA_DIR 覆盖。
绝不打印或要求真实支付密钥。
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8090"))
DATA_DIR = Path(os.environ.get("DATA_DIR", str(Path(__file__).resolve().parent / "data")))
DB_PATH = DATA_DIR / "orders.sqlite3"

PLANS = [
    {
        "id": "muse-account",
        "product_id": "muse",
        "name": "Muse AI",
        "price_cents": 1200,
        "fee_cents": 17,
        "enabled": 1,
        "version": 1,
        "renewal_only": 0,
        "delivery_instructions": "账号资料发送至邮箱",
        "purchase_note": "仅质保首次登录",
    },
    {
        "id": "gemini-pro-18m",
        "product_id": "gemini",
        "name": "Gemini Ai Pro",
        "price_cents": 1990,
        "fee_cents": 0,
        "enabled": 0,
        "version": 1,
        "renewal_only": 0,
        "delivery_instructions": "领取链接发送至邮箱",
        "purchase_note": "需自行领取",
    },
]


def db() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          owner TEXT NOT NULL,
          idempotency_key TEXT NOT NULL,
          plan TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          price_cents INTEGER NOT NULL,
          fee_cents INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL,
          payment_status TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          UNIQUE(owner, idempotency_key)
        )
        """
    )
    conn.commit()
    return conn


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", handler.headers.get("Origin", "*"))
    handler.send_header("Access-Control-Allow-Credentials", "true")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    # 简易买家 cookie，便于 GET /api/orders 按会话列出
    if "buyer=" not in (handler.headers.get("Cookie") or ""):
        token = uuid.uuid4().hex
        handler.send_header("Set-Cookie", f"buyer={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000")
        handler._buyer = token  # type: ignore[attr-defined]
    handler.end_headers()
    handler.wfile.write(body)


def buyer_id(handler: BaseHTTPRequestHandler) -> str:
    cookie = handler.headers.get("Cookie") or ""
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("buyer="):
            return part.split("=", 1)[1].strip() or "anonymous"
    return getattr(handler, "_buyer", "anonymous")


def read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length") or 0)
    raw = handler.rfile.read(length) if length else b"{}"
    try:
        data = json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("无效的 JSON") from exc
    if not isinstance(data, dict):
        raise ValueError("请求体必须是对象")
    return data


class Handler(BaseHTTPRequestHandler):
    server_version = "muse-api-shim/0.1"

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        # 不记录可能含邮箱的 query；仅状态行
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_OPTIONS(self) -> None:  # noqa: N802
        json_response(self, 204, {})

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/health":
            return json_response(self, 200, {"ok": True, "mode": "demo"})
        if path == "/api/catalog":
            return json_response(
                self,
                200,
                {
                    "plans": PLANS,
                    "mode": "demo",
                    "checkoutEnabled": True,
                    "testingEnabled": True,
                },
            )
        if path == "/api/orders":
            owner = buyer_id(self)
            conn = db()
            rows = conn.execute(
                "SELECT * FROM orders WHERE owner=? ORDER BY created_at DESC LIMIT 100",
                (owner,),
            ).fetchall()
            conn.close()
            orders = [dict(r) for r in rows]
            for o in orders:
                o["payment"] = {"method": "alipay", "mock": True, "payUrl": None}
            return json_response(self, 200, {"orders": orders, "recoveryEmail": None})
        return json_response(self, 404, {"error": "未找到接口。"})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/orders/client":
            return json_response(self, 200, {"ok": True})
        if path != "/api/orders":
            return json_response(self, 404, {"error": "未找到接口。"})
        try:
            data = read_json(self)
        except ValueError as e:
            return json_response(self, 400, {"error": str(e)})

        plan_id = data.get("plan")
        email = str(data.get("email") or "").strip().lower()
        key = str(data.get("key") or "")
        expected = data.get("expectedPrice")
        if not isinstance(plan_id, str) or not email or "@" not in email:
            return json_response(self, 400, {"error": "邮箱或商品无效。"})
        if not isinstance(key, str) or len(key) < 8:
            return json_response(self, 400, {"error": "商品或请求编号无效。"})

        plan = next((p for p in PLANS if p["id"] == plan_id), None)
        if not plan or not plan["enabled"]:
            return json_response(self, 409, {"error": "该套餐已暂停销售，请选择其他套餐。"})
        if expected is not None and int(expected) != int(plan["price_cents"]):
            return json_response(self, 409, {"error": "套餐价格已更新，请刷新后重新确认。"})

        owner = buyer_id(self)
        conn = db()
        existing = conn.execute(
            "SELECT * FROM orders WHERE owner=? AND idempotency_key=?",
            (owner, key),
        ).fetchone()
        if existing:
            conn.close()
            order = dict(existing)
            order["payment"] = {"method": "alipay", "mock": True, "payUrl": None}
            return json_response(self, 200, {"order": order})

        order_id = "YMX-" + uuid.uuid4().hex.upper()
        now = int(time.time() * 1000)
        conn.execute(
            """
            INSERT INTO orders(
              id, owner, idempotency_key, plan, plan_name, price_cents, fee_cents,
              status, payment_status, customer_email, created_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                order_id,
                owner,
                key,
                plan["id"],
                plan["name"],
                plan["price_cents"],
                plan.get("fee_cents", 0),
                "pending",
                "unpaid",
                email,
                now,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()
        conn.close()
        order = dict(row)
        # 占位：真实 Alipay 由 CoolkHz/gptibo payments 适配器提供
        order["payment"] = {
            "method": "alipay",
            "mock": True,
            "payUrl": None,
            "qrContent": None,
        }
        return json_response(self, 201, {"order": order})


def main() -> None:
    db().close()
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"muse api shim listening on http://{HOST}:{PORT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
