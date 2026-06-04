# ==========================================
# Unified Dockerfile for BetterLibmanan (Frontend + Backend + Worker in one service)
# ==========================================

# Stage 1: Build everything
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for node-gyp etc.
RUN apk add --no-cache python3 make g++

# Copy monorepo config files
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/worker/package.json ./apps/worker/
# Copy packages directory
COPY packages/ ./packages/

# Install pnpm and dependencies
RUN npm install -g pnpm@9.15.9
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build everything
RUN pnpm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy node_modules, build, and necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/package.json ./

# Install process manager (concurrently) globally
RUN npm install -g concurrently@10.0.3

EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start both backend and worker
CMD ["concurrently", "-n", "backend,worker", "node build/backend/main.js", "node build/worker/main.js"]
