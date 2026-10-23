# GPTibo / Muse 适配说明（华为云轻量机）

更新时间：2026-10-23（Asia/Shanghai）

## 1. 官方产品路径 vs Muse 单品路径

| 维度 | CoolkHz/gptibo 全站 | Muse 克隆（本用户） |
|---|---|---|
| 前端 | React + Vite 多商品商城（ChatGPT 充值、Gemini、多邻国、X Premium、Gmail 等） | Muse AI / Gemini 双 Tab 结账卡（视觉对齐 muse.gptibo.com） |
| 目录 API | `GET /api/catalog` → `catalog_plans` | 同路径；shim 仅返回 `muse-account`、`gemini-pro-18m` |
| 下单 | `POST /api/orders`（plan / email / key / expectedPrice，buyer cookie） | 同契约；支付可 mock |
| 支付 | Workers/Go 内 Alipay 等匿名适配器（需自备密钥） | 前端收到 `payment.payUrl` 则跳转；否则 Toast |
| 后端 | Go+Postgres **或** Cloudflare Workers+D1 | 见下文选型 |

官方源码在 `/workspace/gptibo`（MIT）。Muse 视觉前端已重建为 React+Vite，仓库：`zhengge6/muse-gptibo-frontend`。

## 2. 华为机实测与选型

主机 `huawei-119`（119.3.127.104）：

- 内存：**1.7 GiB**，可用约 **1.3 GiB**，**无 Swap**
- CPU：2 vCPU
- **未安装 Docker / Node / Go / Postgres**；仅有 Python 3.12
- 现网：`muse-http.service` → `python3 -m http.server :80` 托管静态站

结论：

1. **不可行（当前）**：Docker Compose 跑 Go API + Postgres + Worker —— 无 Docker，且 Postgres+Go 常驻易压垮 1.7G。
2. **推荐生产（完整能力）**：在 **Cloudflare Workers + D1** 部署官方 `worker/`，前端 `VITE_API_BASE` 指向 Worker 域名（或自定义域）。机器本身只托管静态 `dist/`。
3. **当前已落地（实用）**：同机 **Python 轻量 shim**（`muse-gptibo-frontend/server/api_shim.py`）实现 catalog + create/list orders + 模拟支付；静态 SPA 用 `static_spa.py` 回退路由并反代 `/api`。内存开销极低，适合 1.7G。

**本次选择：路径 (b) 薄 API shim（Python）+ React 静态构建部署华为；完整栈走 Workers 文档待用户 Cloudflare 账号配置。**

## 3. 前端仓库

- 私有：https://github.com/zhengge6/muse-gptibo-frontend
- 本地源：`/workspace/muse-clone-react`
- 开发：`npm install && npm run dev`（默认 http://127.0.0.1:5173 ，`/api` 代理到 :8090）
- 构建：`npm run build` → `dist/`

## 4. 华为部署要点（无密钥）

```bash
# 本机构建后 rsync dist + server 到 /var/www/muse-clone
# API：systemd 跑 api_shim.py :8090
# HTTP：static_spa.py :80 反代 /api → 8090
```

支付宝真实收款：复制官方 `.dev.vars.example` / `services/storefront/.env.integrations.example` 中的支付项到自有密钥存储，**不要**提交仓库；shim 仅 mock。

## 5. 下一步

1. 配置 Cloudflare 账号与 D1，按官方 README「方式二」部署 Worker，将前端 `VITE_API_BASE` 改为 Worker URL。
2. 填入 Alipay / 邮件 / Turnstile 等密钥后关闭 `ORDER_TESTING` / demo 模式。
3. 若升级华为机（≥4G + Docker），再评估 `services/storefront` Compose。
4. Tailscale：主机已监听 tailscale0；公网 `http://119.3.127.104/`，内网可用 Tailscale IP（以 `tailscale ip -4` 为准）。

## 6. 公开 / 内网 URL（部署后填写）

| 用途 | URL |
|---|---|
| 公网商店 | http://119.3.127.104/ |
| API 健康检查 | http://119.3.127.104/api/health |
| Tailscale | http://100.90.231.14/ |
