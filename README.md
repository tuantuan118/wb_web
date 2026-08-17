# wb_web

微博类社交应用前端（Vue 3 + Vite），对接远程 API 网关。

## 功能

- 用户注册 / 登录（JWT）
- 好友：搜索、关注、取消关注、好友列表
- 时间线：好友推文、我的推文
- 发推、点赞、评论、删除

## 开发

```bash
npm install
npm run dev
```

开发环境接口地址见 `.env.development` 中的 `VITE_API_BASE_URL`。

## Docker 部署

```bash
# 服务器上准备 .env.production（含 VITE_API_BASE_URL）
docker compose up -d --build
```

## 本地构建

```bash
npm run build
npm run preview
```
