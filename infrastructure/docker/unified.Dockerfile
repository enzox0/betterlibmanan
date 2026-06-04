# ==========================================
# Unified Dockerfile for BetterLibmanan (Frontend + Backend in one service)
# ==========================================

# Stage 1: Build both frontend and backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo config files
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
# Copy packages directory if it exists
COPY packages/ ./packages/ 2>/dev/null || true

# Install pnpm and dependencies
RUN npm install -g pnpm@8.15.0
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build both frontend and backend
RUN pnpm run build --filter=@betterlibmanan/backend
RUN pnpm run build --filter=@betterlibmanan/frontend

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy node_modules and built code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/packages/ ./packages/ 2>/dev/null || true
COPY package.json ./

EXPOSE 5000

# Start backend
CMD ["node", "apps/backend/dist/main.js"]
