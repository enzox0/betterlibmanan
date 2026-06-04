#!/bin/sh
set -e

echo "=== BetterLibmanan Startup ==="
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "PM2 version: $(pm2 --version)"
echo ""

echo "=== Checking Directory Structure ==="
ls -lah /app/
echo ""

echo "=== Checking Apps Directory ==="
ls -lah /app/apps/
echo ""

echo "=== Checking Backend ==="
if [ -d "/app/apps/backend/dist" ]; then
  echo "✓ Backend dist exists"
  ls -lah /app/apps/backend/dist/ | head -10
else
  echo "✗ Backend dist NOT FOUND"
fi
echo ""

echo "=== Checking Frontend ==="
if [ -d "/app/apps/frontend/dist" ]; then
  echo "✓ Frontend dist exists"
  ls -lah /app/apps/frontend/dist/
  echo ""
  if [ -f "/app/apps/frontend/dist/index.html" ]; then
    echo "✓ index.html found"
  else
    echo "✗ index.html NOT FOUND"
  fi
  echo ""
  if [ -d "/app/apps/frontend/dist/assets" ]; then
    echo "✓ assets/ directory found"
    echo "Assets contents:"
    ls -lah /app/apps/frontend/dist/assets/ | head -20
  else
    echo "✗ assets/ directory NOT FOUND"
  fi
else
  echo "✗ Frontend dist NOT FOUND - THIS WILL CAUSE ERRORS!"
  exit 1
fi
echo ""

echo "=== Checking Worker ==="
if [ -d "/app/apps/worker/dist" ]; then
  echo "✓ Worker dist exists"
  ls -lah /app/apps/worker/dist/ | head -10
else
  echo "✗ Worker dist NOT FOUND"
fi
echo ""

echo "=== Environment Variables ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo ""

echo "=== Starting PM2 ==="
exec pm2-runtime start ecosystem.config.js
