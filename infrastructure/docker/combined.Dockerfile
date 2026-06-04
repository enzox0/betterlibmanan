FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ ./packages/ 2>/dev/null || true

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build both frontend and backend
RUN pnpm run build --filter=@betterlibmanan/backend
RUN pnpm run build --filter=@betterlibmanan/frontend

FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/packages/ ./packages/ 2>/dev/null || true
COPY package.json ./

# Expose port (Render expects you to use $PORT env var)
EXPOSE 5000

# Start the app
CMD ["node", "apps/backend/dist/main.js"]
