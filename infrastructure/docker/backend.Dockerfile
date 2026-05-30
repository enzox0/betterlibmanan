FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

RUN npm install -g pnpm@8.15.0
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build --filter=@betterlibmanan/backend

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/ ./packages/
COPY package.json ./

EXPOSE 5000

CMD ["node", "apps/backend/dist/main.js"]
