#!/usr/bin/env python3
"""静态托管 dist/ 并对 SPA 路由回退到 index.html；/api 可反代到 shim。"""
from __future__ import annotations

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(os.environ.get("STATIC_ROOT", Path(__file__).resolve().parents[1] / "dist")).resolve()
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "80"))
API_UPSTREAM = os.environ.get("API_UPSTREAM", "http://127.0.0.1:8090")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):  # noqa: N802
        if self.path.startswith("/api/"):
            return self._proxy()
        path = self.path.split("?", 1)[0]
        candidate = ROOT / path.lstrip("/")
        if path != "/" and not candidate.exists() and not path.startswith("/assets/"):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):  # noqa: N802
        if self.path.startswith("/api/"):
            return self._proxy()
        self.send_error(404)

    def do_OPTIONS(self):  # noqa: N802
        if self.path.startswith("/api/"):
            return self._proxy()
        self.send_error(404)

    def _proxy(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        url = API_UPSTREAM.rstrip("/") + self.path
        req = Request(url, data=body, method=self.command)
        for key in ("Content-Type", "Cookie", "Origin"):
            if key in self.headers:
                req.add_header(key, self.headers[key])
        try:
            with urlopen(req, timeout=30) as resp:  # noqa: S310 — local upstream
                data = resp.read()
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() in {"content-type", "set-cookie", "access-control-allow-origin", "access-control-allow-credentials"}:
                        self.send_header(k, v)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except Exception as exc:  # noqa: BLE001
            msg = json_bytes({"error": f"API 不可用: {exc}"})
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)


def json_bytes(obj: dict) -> bytes:
    import json

    return json.dumps(obj, ensure_ascii=False).encode("utf-8")


def main() -> None:
    if not ROOT.exists():
        raise SystemExit(f"STATIC_ROOT not found: {ROOT}")
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"spa host {ROOT} on http://{HOST}:{PORT} api→{API_UPSTREAM}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
