# ==========================================
# Unified Dockerfile for BetterLibmanan (Frontend + Backend + Worker in one service)
# ==========================================

# Stage 1: Build everything
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for node-gyp etc.
RUN apk add --no-cache python3 make g++

# Copy monorepo config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
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

# Install pnpm (needed for installing production dependencies)
RUN npm install -g pnpm@9.15.9

# Copy package files and workspace configuration
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/packages/ ./packages/

# Install production dependencies only (this will set up proper node_modules structure)
RUN pnpm install --prod --frozen-lockfile

# Copy built node_modules from builder to ensure all dependencies are available
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules

# Copy build output
COPY --from=builder /app/build ./build

# CRITICAL FIX: Create the directory structure that Express expects in Docker
RUN mkdir -p /app/apps/frontend/dist
COPY --from=builder /app/build/frontend /app/apps/frontend/dist

# Install concurrently globally (use version 9.x for Node 20 compatibility)
RUN npm install -g concurrently@9.0.1

EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start both backend and worker
CMD ["concurrently", "-n", "backend,worker", "-k", "-c", "blue,green", "node build/backend/main.js", "node build/worker/main.js"]
