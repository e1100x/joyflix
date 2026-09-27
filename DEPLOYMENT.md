# JoyFlix Vercel 部署

Fork：https://github.com/e1100x/joyflix 。
上游：https://github.com/jeffernn/joyflix ，基线提交 `4848950`。
教程：https://www.freedidi.com/24771.html 。

## 当前方案

- 基础版 localstorage：历史记录和收藏保存在当前浏览器，不需要数据库。
- Node.js 22，pnpm 10.14.0，Next.js 14.2.35。
- 修复上游 middleware 匹配规则多余右括号导致登录拦截失效的问题。
- 默认图片直连，避免上游 README 已说明的默认图片代理失效。
- 取消基础版不需要的数据库定时刷新任务。
- `.env`、构建产物和依赖目录不纳入 Git / Vercel 上传。

## 发布

日常更新推送到 Fork 的 `main` 分支，由已连接的 Vercel 项目自动构建和部署。上游更新需先合并到 Fork，不会自动覆盖本仓库的修复。

首次为其他项目部署时，在此目录运行 `./deploy-vercel.command`，也可以在访达双击该文件。
它会检查 Vercel 登录、关联或新建项目、交互式设置生产环境 PASSWORD，然后发布。
脚本固定使用 Vercel CLI 60.1.3，支持新的设备登录流程；项目间接安装的 44.x CLI 的旧登录流程已停用。
密码不要使用其他服务的登录密码。重复部署时直接运行 `npx --yes vercel@60.1.3 --prod`。
如果 PASSWORD 已存在，可在 Vercel 项目 Settings → Environment Variables 更新后重新部署。

上传目录必须是本文件所在的 joyflix 目录，不能上传上层 dicomResearch 工作区。

## 本地验证

```sh
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
# 编辑 .env.local 中的 PASSWORD
corepack pnpm build
corepack pnpm start
```

上线后检查：未登录访问首页跳转 `/login`；错误密码返回 401；正确密码能够进入首页。
影视搜索和播放依赖第三方接口，必须上线后实际检查，构建通过不代表所有资源可用。

## 跨设备同步（可选）

需要 Upstash Redis，配置 `NEXT_PUBLIC_STORAGE_TYPE=upstash`、`UPSTASH_URL`、
`UPSTASH_TOKEN`、`USERNAME` 和 `PASSWORD` 后重新部署。

## 已完成的本地验证

生产构建通过（包含 TypeScript 检查）；登录冒烟测试 5 项通过。
测试脚本为 `scripts/smoke-auth.py`，通过环境变量 PASSWORD 提供测试密码，
SMOKE_BASE_URL 可指定待测网址。

## 生产部署（2026-09-26）

- 访问地址：https://joyflix-pied-gamma.vercel.app
- Vercel 项目：https://vercel.com/e1100xs-projects/joyflix
- 部署 ID：`dpl_DD2brcnWShhEX716wYmacRkHJ3yr`，状态 `READY`。
- 生产密码沿用本目录 `.env.local` 的 `PASSWORD`，已写入 Vercel Production Secret。
- 云端生产构建通过；线上登录冒烟测试 5 项全部通过。
- 已认证搜索接口返回 HTTP 200，测试查询返回 95 条结果；视频实际播放尚未验证。
- 首次从本地 CLI 发布；2026-09-28 已连接个人 Fork `e1100x/joyflix`，后续推送自动部署。
- 本机 Python 验证 HTTPS 时使用 `SSL_CERT_FILE=/etc/ssl/cert.pem` 加载系统证书。
