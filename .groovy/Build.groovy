/**
 * Build Script — BetterLibmanan
 *
 * Monorepo: Turborepo + pnpm
 * Frontend: Vite (React 18 + TypeScript)
 * Backend:  Express + TypeScript (tsc + tsc-alias)
 * Output:   build/frontend/  +  build/backend/
 */

def build() {
    def startTime = System.currentTimeMillis()

    try {
        echo "🏗️ Starting build for ${env.TARGET_ENV}"

        validateBuildEnvironment()
        installDependencies()
        executeBuild()
        optimizeBuild()
        generateBuildMetadata()
        validateBuildOutput()

        def duration = (System.currentTimeMillis() - startTime) / 1000
        echo "✅ Build completed in ${duration}s"

        return [
            success     : true,
            duration    : duration,
            artifactPath: env.ARTIFACT_PATH
        ]

    } catch (Exception e) {
        def duration = (System.currentTimeMillis() - startTime) / 1000
        echo "❌ Build failed after ${duration}s: ${e.message}"
        throw e
    }
}

def validateBuildEnvironment() {
    echo "🔍 Validating build environment..."

    sh '''
        # Node version (monorepo requires >=18)
        NODE_VERSION=$(node --version)
        echo "Node.js: $NODE_VERSION"

        MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR" -lt 18 ]; then
            echo "❌ Node.js >=18 required (got $NODE_VERSION)"
            exit 1
        fi

        # pnpm is the package manager for this project
        if ! command -v pnpm &>/dev/null; then
            echo "❌ pnpm not found — install via: npm install -g pnpm"
            exit 1
        fi
        PNPM_VERSION=$(pnpm --version)
        echo "pnpm: $PNPM_VERSION"

        # turbo must be available (installed as devDependency)
        if ! command -v turbo &>/dev/null && ! npx turbo --version &>/dev/null; then
            echo "❌ turbo CLI not found"
            exit 1
        fi

        # Environment file
        ENV_FILE=".env.${TARGET_ENV}"
        if [ ! -f "$ENV_FILE" ]; then
            echo "❌ $ENV_FILE not found — create it from .env.example"
            exit 1
        fi

        # Disk space (at least 2 GB free for node_modules + build)
        AVAILABLE_KB=$(df -k . | awk 'NR==2 {print $4}')
        if [ "$AVAILABLE_KB" -lt 2097152 ]; then
            echo "⚠️ Less than 2 GB disk space available — build may fail"
        fi

        echo "✅ Build environment validated"
    '''
}

def installDependencies() {
    echo "� Installing dependencies with pnpm..."

    sh '''
        # Frozen lockfile in CI to catch accidental lockfile drift
        pnpm install --frozen-lockfile

        echo "✅ Dependencies installed"
    '''
}

def executeBuild() {
    echo "🔨 Running Turborepo build for ${env.TARGET_ENV}..."

    sh '''
        export NODE_ENV=${TARGET_ENV}

        # turbo run build covers all workspace packages in the correct
        # dependency order: @betterlibmanan/types → utils → backend/frontend
        pnpm run build

        # Verify expected output directories exist
        if [ ! -d "build/backend" ]; then
            echo "❌ build/backend not found after build"
            exit 1
        fi
        if [ ! -f "build/backend/main.js" ]; then
            echo "❌ build/backend/main.js missing"
            exit 1
        fi
        if [ ! -d "build/frontend" ]; then
            echo "❌ build/frontend not found after build"
            exit 1
        fi
        if [ ! -f "build/frontend/index.html" ]; then
            echo "❌ build/frontend/index.html missing"
            exit 1
        fi

        echo "✅ Build executed successfully"
    '''
}

def optimizeBuild() {
    echo "⚡ Optimizing build artifacts..."

    sh '''
        # Strip source maps from production frontend bundle
        if [ "${IS_PRODUCTION}" = "true" ]; then
            find build/frontend -name "*.map" -type f -delete
            echo "🗑️  Source maps removed (production)"
        fi

        # Remove any stray test/spec files that slipped into the build
        find build/ -name "*.test.*" -type f -delete || true
        find build/ -name "*.spec.*" -type f -delete || true

        # SHA-256 checksums for deployment integrity verification
        find build/ -type f -exec sha256sum {} \\; > checksums.txt
        echo "📋 Checksums written to checksums.txt"

        echo "✅ Optimization completed"
    '''
}

def generateBuildMetadata() {
    echo "📝 Generating build metadata..."

    sh '''
        TOTAL_SIZE=$(du -sh build/ | cut -f1)
        FILE_COUNT=$(find build/ -type f | wc -l)
        JS_SIZE=$(find build/frontend -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "N/A")
        CSS_SIZE=$(find build/frontend -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "N/A")

        cat > build/frontend/build-info.json <<EOF
{
  "app": {
    "name": "BetterLibmanan",
    "version": "${APP_VERSION}",
    "buildNumber": "${BUILD_NUMBER}",
    "buildTag": "${BUILD_TAG}",
    "timestamp": "${BUILD_TIMESTAMP}"
  },
  "environment": {
    "target": "${TARGET_ENV}",
    "nodeVersion": "$(node --version)",
    "pnpmVersion": "$(pnpm --version)"
  },
  "git": {
    "commit": "${GIT_COMMIT_SHORT}",
    "branch": "${BRANCH_NAME}",
    "author": "${GIT_AUTHOR}",
    "message": "${GIT_COMMIT_MSG}"
  },
  "artifacts": {
    "totalSize": "$TOTAL_SIZE",
    "fileCount": "$FILE_COUNT",
    "jsBundleSize": "$JS_SIZE",
    "cssBundleSize": "$CSS_SIZE"
  }
}
EOF

        # Lightweight version file accessible at runtime via /version.json
        cat > build/frontend/version.json <<EOF
{
  "version": "${APP_VERSION}",
  "buildTag": "${BUILD_TAG}",
  "commit": "${GIT_COMMIT_SHORT}",
  "timestamp": "${BUILD_TIMESTAMP}"
}
EOF

        echo "✅ Build metadata generated"
    '''
}

def validateBuildOutput() {
    echo "✅ Validating build output..."

    sh '''
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 Frontend Bundle Analysis"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        find build/frontend -name "*.js" -o -name "*.css" | sort | xargs ls -lh 2>/dev/null | awk '{print $9, $5}'

        # Warn on large chunks (>1 MB uncompressed — Vite splits aggressively
        # but a lazy-loaded module could still be large)
        find build/frontend -type f -size +1M | while IFS= read -r f; do
            echo "⚠️  Large file: $f ($(du -sh "$f" | cut -f1))"
        done

        # Validate JSON metadata files
        for f in build/frontend/build-info.json build/frontend/version.json; do
            if command -v python3 &>/dev/null; then
                python3 -m json.tool "$f" > /dev/null 2>&1 || echo "⚠️  Invalid JSON: $f"
            fi
        done

        # Backend entry point exists and is non-empty
        if [ ! -s build/backend/main.js ]; then
            echo "❌ build/backend/main.js is missing or empty"
            exit 1
        fi

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Build output validation passed"
    '''
}

return this
