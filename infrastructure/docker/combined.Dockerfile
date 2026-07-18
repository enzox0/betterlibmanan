FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.9

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

# Build frontend first, then backend and worker
RUN pnpm run build --filter=@betterlibmanan/frontend

# Verify frontend build output
RUN echo "=== Frontend Build Verification ===" && \
    if [ -d "apps/frontend/dist" ]; then \
      echo "✓ Frontend dist directory exists"; \
      ls -lah apps/frontend/dist/; \
      echo ""; \
      echo "Checking for index.html..."; \
      if [ -f "apps/frontend/dist/index.html" ]; then \
        echo "✓ index.html exists"; \
        echo "Contents:"; \
        head -50 apps/frontend/dist/index.html | grep -E "script|link.*stylesheet"; \
      else \
        echo "✗ ERROR: index.html NOT found"; \
        exit 1; \
      fi; \
      echo ""; \
      echo "Checking for assets directory..."; \
      if [ -d "apps/frontend/dist/assets" ]; then \
        echo "✓ assets/ directory exists"; \
        echo "Asset files:"; \
        ls -lah apps/frontend/dist/assets/ | head -30; \
      else \
        echo "✗ ERROR: assets/ directory NOT found"; \
        exit 1; \
      fi; \
    else \
      echo "✗ ERROR: Frontend dist NOT found"; \
      exit 1; \
    fi

RUN pnpm run build --filter=@betterlibmanan/backend
RUN pnpm run build --filter=@betterlibmanan/worker

FROM node:20-alpine AS runner

WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Create logs directory
RUN mkdir -p ./logs

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages/ ./packages/
COPY package.json ./

# Copy PM2 ecosystem file and startup script
COPY infrastructure/docker/ecosystem.config.js ./
COPY infrastructure/docker/startup.sh ./
COPY infrastructure/docker/verify-build.sh ./
RUN chmod +x startup.sh verify-build.sh

# Run build verification
RUN ./verify-build.sh

# Expose port (Render expects you to use $PORT env var)
EXPOSE 5000

# Start all services with PM2 via startup script
CMD ["./startup.sh"]
