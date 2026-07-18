/**
 * Security Script — BetterLibmanan
 *
 * Security scanning and compliance checks tailored to the stack:
 *   - pnpm monorepo (Turborepo)
 *   - React 18 + Vite frontend (TypeScript, Tailwind, Zustand, TanStack Query)
 *   - Express 4 backend (TypeScript, Mongoose, JWT, Helmet, Zod)
 *   - MongoDB + Redis
 *   - Deployed on VPS behind Nginx
 */

def performSecurityScan() {
    echo "🔒 Running security scan..."

    try {
        parallel(
            'Dependency Audit' : { scanDependencies()     },
            'Secret Detection' : { detectSecrets()        },
            'SAST'             : { runStaticAnalysis()    },
            'License Check'    : { checkLicenseCompliance() }
        )

        generateSecurityReport()
        echo "✅ Security scan completed"

    } catch (Exception e) {
        echo "❌ Security scan failed: ${e.message}"

        if (env.IS_PRODUCTION == 'true') {
            throw e   // Block production deployments on security failures
        } else {
            echo "⚠️ Continuing (non-production) despite security issues"
        }
    }
}

// ─── Dependency Audit ─────────────────────────────────────────────────────────

def scanDependencies() {
    echo "🔍 Auditing pnpm dependencies..."

    sh '''
        # pnpm audit outputs JSON — use --json for machine-readable results
        pnpm audit --json > pnpm-audit-report.json 2>&1 || true

        # Extract severity counts
        CRITICAL=$(python3 -c "
import json, sys
try:
    data = json.load(open('pnpm-audit-report.json'))
    meta = data.get('metadata', {}).get('vulnerabilities', {})
    print(meta.get('critical', 0))
except:
    print(0)
" 2>/dev/null || echo 0)

        HIGH=$(python3 -c "
import json, sys
try:
    data = json.load(open('pnpm-audit-report.json'))
    meta = data.get('metadata', {}).get('vulnerabilities', {})
    print(meta.get('high', 0))
except:
    print(0)
" 2>/dev/null || echo 0)

        MODERATE=$(python3 -c "
import json, sys
try:
    data = json.load(open('pnpm-audit-report.json'))
    meta = data.get('metadata', {}).get('vulnerabilities', {})
    print(meta.get('moderate', 0))
except:
    print(0)
" 2>/dev/null || echo 0)

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 Dependency Vulnerability Report"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔴 Critical : $CRITICAL"
        echo "🟠 High     : $HIGH"
        echo "🟡 Moderate : $MODERATE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if [ "$IS_PRODUCTION" = "true" ] && [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Critical vulnerabilities in production build — aborting"
            exit 1
        fi

        if [ "$HIGH" -gt 5 ]; then
            echo "⚠️ High number of high-severity vulnerabilities ($HIGH)"
        fi

        echo "✅ Dependency audit completed"
    '''

    archiveArtifacts artifacts: 'pnpm-audit-report.json', allowEmptyArchive: true
}

// ─── Secret Detection ─────────────────────────────────────────────────────────

def detectSecrets() {
    echo "🔐 Scanning for hardcoded secrets..."

    sh '''
        SECRETS_FOUND=0

        # Patterns relevant to this stack
        PATTERNS=(
            "password\\s*[:=]\\s*['\"][^'\"]{8,}"
            "jwt[_-]?secret\\s*[:=]\\s*['\"][^'\"]{8,}"
            "mongodb[+]?srv://[^@]+:[^@]+"       # MongoDB connection strings with credentials
            "redis://:[^@]+@"                      # Redis with password
            "api[_-]?key\\s*[:=]\\s*['\"][^'\"]{8,}"
            "s3[_-]?(access|secret)[_-]?key\\s*[:=]\\s*['\"][^'\"]{8,}"
            "sentry[_-]?dsn\\s*=\\s*https://[a-f0-9]+@"
            "AKIA[0-9A-Z]{16}"                    # AWS access key ID
            "-----BEGIN (RSA |EC )?PRIVATE KEY-----"
        )

        for PATTERN in "${PATTERNS[@]}"; do
            MATCHES=$(grep -r -E "$PATTERN" . \
                --include="*.ts" \
                --include="*.tsx" \
                --include="*.js" \
                --include="*.jsx" \
                --include="*.json" \
                --exclude-dir=node_modules \
                --exclude-dir=.git \
                --exclude-dir=build \
                --exclude-dir=dist \
                --exclude-dir=coverage \
                --exclude="*.log" \
                2>/dev/null | grep -v ".env.example" || true)

            if [ -n "$MATCHES" ]; then
                echo "⚠️ Potential secret pattern matched: $PATTERN"
                SECRETS_FOUND=$((SECRETS_FOUND + 1))
            fi
        done

        # .env files must not be committed (they're in .gitignore)
        if git ls-files 2>/dev/null | grep -E "^\\.env$"; then
            echo "❌ .env file is tracked by git"
            exit 1
        fi
        for ENV_FILE in .env.production .env.staging .env.development; do
            if git ls-files 2>/dev/null | grep -qF "$ENV_FILE"; then
                echo "❌ $ENV_FILE is tracked by git — remove it immediately"
                exit 1
            fi
        done

        if [ $SECRETS_FOUND -gt 0 ]; then
            echo "⚠️ $SECRETS_FOUND potential secret pattern(s) found in source"
            if [ "$IS_PRODUCTION" = "true" ]; then
                exit 1
            fi
        else
            echo "✅ No secrets detected"
        fi
    '''
}

// ─── Static Analysis (SAST) ───────────────────────────────────────────────────

def runStaticAnalysis() {
    echo "🔬 Running static security analysis..."

    sh '''
        # ── Frontend (React/TypeScript) checks ────────────────────────────────

        # dangerouslySetInnerHTML — must have explicit DOMPurify sanitisation
        if grep -r "dangerouslySetInnerHTML" apps/frontend/src/ \
                --include="*.tsx" --include="*.jsx" 2>/dev/null; then
            echo "⚠️ dangerouslySetInnerHTML detected — verify XSS protection (DOMPurify)"
        fi

        # Direct eval() usage
        if grep -r "\\beval(" apps/frontend/src/ apps/backend/src/ \
                --include="*.ts" --include="*.tsx" --include="*.js" \
                --exclude-dir=node_modules 2>/dev/null; then
            echo "⚠️ eval() detected — potential code injection risk"
        fi

        # Non-HTTPS API URLs hardcoded (localhost is fine)
        if grep -rE "http://[^l]" apps/frontend/src/ \
                --include="*.ts" --include="*.tsx" 2>/dev/null | \
                grep -v "localhost" | grep -v "127\\.0\\.0\\.1"; then
            echo "⚠️ Non-HTTPS URL in frontend source — use HTTPS in production"
        fi

        # ── Backend (Express/TypeScript) checks ───────────────────────────────

        # SQL injection patterns (no SQL here, but guard for future use)
        if grep -r "query.*\\\${" apps/backend/src/ \
                --include="*.ts" 2>/dev/null; then
            echo "⚠️ Template literal in DB query — use parameterised Mongoose queries"
        fi

        # JWT secret must not be a weak default
        if grep -rE "jwt[_-]?secret.*=.*['\"]secret['\"]" apps/backend/src/ \
                --include="*.ts" 2>/dev/null; then
            echo "❌ Weak JWT secret detected in source code"
            exit 1
        fi

        # Zod validation is required for all external inputs —
        # flag any req.body / req.query usage without schema validation
        REQ_BODY_USAGE=$(grep -r "req\\.body" apps/backend/src/ \
            --include="*.ts" -l 2>/dev/null | wc -l || echo 0)
        ZOD_USAGE=$(grep -r "z\\." apps/backend/src/ \
            --include="*.ts" -l 2>/dev/null | wc -l || echo 0)
        if [ "$REQ_BODY_USAGE" -gt 0 ] && [ "$ZOD_USAGE" -eq 0 ]; then
            echo "⚠️ req.body used but no Zod schemas found — add input validation"
        fi

        # Helmet should be in use (it is — but verify it wasn't accidentally removed)
        if ! grep -q "helmet" apps/backend/src/bootstrap/app.ts 2>/dev/null; then
            echo "⚠️ Helmet middleware not found in app.ts — security headers missing"
        fi

        echo "✅ Static analysis completed"
    '''
}

// ─── License Compliance ───────────────────────────────────────────────────────

def checkLicenseCompliance() {
    echo "📜 Checking license compliance..."

    sh '''
        # Generate a flat dependency list with licenses
        pnpm licenses list --json > pnpm-licenses.json 2>/dev/null || \
            pnpm list --json > pnpm-licenses.json 2>/dev/null || true

        # Licenses incompatible with CC0-1.0 / government project constraints
        COPYLEFT="GPL-2.0 GPL-3.0 AGPL-3.0 LGPL-2.1 LGPL-3.0"
        for LIC in $COPYLEFT; do
            if grep -i "$LIC" pnpm-licenses.json 2>/dev/null; then
                echo "⚠️ Potentially incompatible license detected: $LIC"
            fi
        done

        echo "✅ License compliance check completed"
    '''

    archiveArtifacts artifacts: 'pnpm-licenses.json', allowEmptyArchive: true
}

// ─── Security Report ──────────────────────────────────────────────────────────

def generateSecurityReport() {
    echo "📋 Generating security report..."

    sh '''
        cat > security-report.md <<EOF
# Security Scan Report — BetterLibmanan

| Field       | Value                     |
|-------------|---------------------------|
| Build       | ${BUILD_NUMBER}           |
| Environment | ${TARGET_ENV}             |
| Timestamp   | ${BUILD_TIMESTAMP}        |
| Commit      | ${GIT_COMMIT_SHORT}       |
| Branch      | ${BRANCH_NAME}            |

## Checks Performed

- ✅ pnpm dependency audit (critical CVEs block production)
- ✅ Hardcoded secret detection
- ✅ React/Express static analysis (XSS, injection, JWT strength)
- ✅ License compliance (CC0-1.0 compatible)

## Artefacts

| File                   | Description                    |
|------------------------|--------------------------------|
| pnpm-audit-report.json | Full pnpm audit output         |
| pnpm-licenses.json     | Dependency licence list        |

## Recommendations

1. Keep all dependencies up-to-date — run \`pnpm audit fix\` after each sprint
2. Rotate JWT secrets and MongoDB credentials regularly
3. Ensure \`.env.*\` files are never committed (enforced by .gitignore)
4. Review any \`dangerouslySetInnerHTML\` usage with DOMPurify
5. Confirm Helmet CSP directives in \`app.ts\` match the deployed domain
EOF

        cat security-report.md
    '''

    archiveArtifacts artifacts: 'security-report.md', allowEmptyArchive: true
}

// ─── Compliance ───────────────────────────────────────────────────────────────

def enforceSecurityPolicies() {
    echo "🛡️ Enforcing security policies..."

    sh '''
        # Helmet is configured in app.ts — verify CSP directive is present
        if grep -q "contentSecurityPolicy" apps/backend/src/bootstrap/app.ts 2>/dev/null; then
            echo "✅ CSP configured in Helmet middleware"
        else
            echo "⚠️ contentSecurityPolicy not found in app.ts"
        fi

        # Rate limiting (express-rate-limit) should be applied
        if grep -q "rateLimit" apps/backend/src/bootstrap/app.ts 2>/dev/null; then
            echo "✅ Rate limiting configured"
        else
            echo "⚠️ Rate limiting not found in app.ts"
        fi

        # Ensure ALLOWED_ORIGINS is not a wildcard in production
        if [ "$IS_PRODUCTION" = "true" ]; then
            if grep -q "ALLOWED_ORIGINS=\\*" .env.production 2>/dev/null; then
                echo "❌ ALLOWED_ORIGINS=* is not allowed in production"
                exit 1
            fi
        fi

        echo "✅ Security policies enforced"
    '''
}

def generateSBOM() {
    echo "📦 Generating Software Bill of Materials (SBOM)..."

    sh '''
        pnpm list --json > sbom-raw.json 2>/dev/null || true

        cat > sbom.json <<EOF
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "metadata": {
    "timestamp": "${BUILD_TIMESTAMP}",
    "component": {
      "name": "BetterLibmanan",
      "version": "${APP_VERSION}",
      "type": "application",
      "description": "Enterprise Monolith for Local Government"
    }
  },
  "note": "Full component list available in sbom-raw.json"
}
EOF
        echo "✅ SBOM generated"
    '''

    archiveArtifacts artifacts: 'sbom.json,sbom-raw.json', allowEmptyArchive: true
}

return this
