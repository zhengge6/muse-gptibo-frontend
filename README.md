# Muse · GPTibo 前端（React + Vite）

私有仓库：[zhengge6/muse-gptibo-frontend](https://github.com/zhengge6/muse-gptibo-frontend)

视觉复刻 [muse.gptibo.com](https://muse.gptibo.com/) 商店（Muse AI / Gemini 切换、结账卡、订单页），并预留与 [CoolkHz/gptibo](https://github.com/CoolkHz/gptibo) 兼容的 `API_BASE` 调用。

## 本地开发

需要 Node.js 20+。

```bash
cd muse-clone-react   # 或克隆本仓库后进入根目录
npm install
npm run dev
```

浏览器打开 http://127.0.0.1:5173/

开发时 `/api` 默认代理到 `http://127.0.0.1:8090`（见 `.env.example`）。可先启动仓库内 Python shim：

```bash
python3 server/api_shim.py
```

## 构建

```bash
npm run build
npm run preview   # 可选：预览 dist
```

产物在 `dist/`，可静态托管。SPA 路由需将未知路径回退到 `index.html`。

## 环境变量

| 变量 | 说明 |
|---|---|
| `VITE_API_BASE` | API 根 URL；留空则使用同源 `/api` |
| `VITE_API_PROXY_TARGET` | 仅 dev/preview 代理目标，默认 `http://127.0.0.1:8090` |

## API 约定（gptibo 兼容子集）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/catalog` | 商品目录 `plans[]` |
| POST | `/api/orders` | 创建订单 `{ plan, email, key, expectedPrice }` |
| GET | `/api/orders` | 当前会话订单列表 |

支付宝走官方 OSS 的支付适配器；本前端在收到 `payment.payUrl` 时跳转，否则 Toast 提示（mock 可用）。

## 目录

```text
src/pages/          商店首页、订单页
src/components/     顶栏、舞台、结账卡、须知弹窗
src/lib/api.ts      API_BASE 与 catalog/orders
src/styles/         对齐原站 token 的 CSS
server/api_shim.py  轻量 Python 兼容 API（供华为机或本地）
public/assets/      favicon、muse-logo、Geist 字体
```

## 说明

本仓库为学习与自用适配；真实支付需自行配置 Alipay / Cloudflare Workers 或 Go 后端密钥。详见上游 `ADAPT.md`（若同机有 `/workspace/gptibo`）或本仓库 `docs/ADAPT.md`。
