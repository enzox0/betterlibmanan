FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ ./packages/

RUN npm install -g pnpm@8.15.0
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build --filter=@betterlibmanan/frontend

FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY infrastructure/docker/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
