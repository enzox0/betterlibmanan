FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/worker/package.json ./apps/worker/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build frontend, backend, and worker
RUN pnpm run build --filter=@betterlibmanan/backend
RUN pnpm run build --filter=@betterlibmanan/frontend
RUN pnpm run build --filter=@betterlibmanan/worker

FROM node:20-alpine AS runner

WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages/ ./packages/
COPY package.json ./

# Copy PM2 ecosystem file
COPY infrastructure/docker/ecosystem.config.js ./

# Expose port (Render expects you to use $PORT env var)
EXPOSE 5000

# Start all services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
