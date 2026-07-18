#!/bin/sh
set -e

echo "=== Build Verification Script ==="
echo ""

# Function to check if a file exists
check_file() {
  if [ -f "$1" ]; then
    echo "✓ $1 exists"
    return 0
  else
    echo "✗ $1 NOT FOUND"
    return 1
  fi
}

# Function to check if a directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo "✓ $1 exists"
    return 0
  else
    echo "✗ $1 NOT FOUND"
    return 1
  fi
}

echo "=== Checking Frontend Build ==="
check_dir "/app/apps/frontend/dist" || exit 1
check_file "/app/apps/frontend/dist/index.html" || exit 1
check_dir "/app/apps/frontend/dist/assets" || exit 1

echo ""
echo "=== Checking Backend Build ==="
check_dir "/app/apps/backend/dist" || exit 1
check_file "/app/apps/backend/dist/main.js" || exit 1

echo ""
echo "=== Checking Worker Build ==="
check_dir "/app/apps/worker/dist" || exit 1
check_file "/app/apps/worker/dist/main.js" || exit 1

echo ""
echo "=== Listing Frontend Assets ==="
ls -lh /app/apps/frontend/dist/assets/ | head -20

echo ""
echo "=== Checking Asset References in index.html ==="
grep -E "script.*src=|link.*stylesheet" /app/apps/frontend/dist/index.html || echo "No script/stylesheet tags found"

echo ""
echo "=== Build Verification Complete ✓ ==="
