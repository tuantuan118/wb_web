# 构建阶段
FROM node:26.7.0 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 强制同源（由 Nginx 反代 /v1/），避免打到 :8080 触发跨域 OPTIONS → 405
ARG VITE_API_BASE_URL=
RUN printf 'VITE_API_BASE_URL=%s\n' "$VITE_API_BASE_URL" > .env.production \
  && npm run build

# 运行阶段：Nginx 托管静态资源
FROM nginx:1.30.4
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
