/**
 * Environment Injection Script — BetterLibmanan
 *
 * Injects the appropriate .env file from Jenkins credentials into the
 * workspace before the Build stage runs.
 *
 * Credential mapping (configure these in Jenkins → Credentials):
 *   BETTERLIBMANAN_ENV_PRODUCTION  → .env.production
 *   BETTERLIBMANAN_ENV_STAGING     → .env.staging
 *   BETTERLIBMANAN_ENV_DEVELOPMENT → .env.development
 *
 * Required variables validated (derived from .env.example):
 *   MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, PORT, APP_URL
 */

def injectEnvFiles() {
    def targetEnv = env.TARGET_ENV

    echo "🔐 Injecting environment file for ${targetEnv}..."

    try {
        def credentialId = resolveCredentialId(targetEnv)
        def fileName     = resolveEnvFileName(targetEnv)

        injectEnvironmentFile(credentialId, fileName)
        validateEnvironmentFile(fileName)
        logEnvironmentMetadata(fileName, targetEnv)

        echo "✅ Environment file ${fileName} ready"

        return [success: true, fileName: fileName, environment: targetEnv]

    } catch (Exception e) {
        echo "❌ Environment injection failed: ${e.message}"
        throw e
    }
}

def resolveCredentialId(String targetEnv) {
    def map = [
        'production' : 'BETTERLIBMANAN_ENV_PRODUCTION',
        'staging'    : 'BETTERLIBMANAN_ENV_STAGING',
        'development': 'BETTERLIBMANAN_ENV_DEVELOPMENT'
    ]

    def id = map[targetEnv]
    if (!id) {
        throw new Exception("No credential mapped for environment: ${targetEnv}. " +
            "Add it to the credentialId map in EnvironmentInjection.groovy.")
    }

    echo "🗝️  Credential ID: ${id}"
    return id
}

def resolveEnvFileName(String targetEnv) {
    def map = [
        'production' : '.env.production',
        'staging'    : '.env.staging',
        'development': '.env.development'
    ]

    def name = map[targetEnv]
    if (!name) {
        throw new Exception("No env filename mapped for environment: ${targetEnv}")
    }

    echo "📄 Target file: ${name}"
    return name
}

def injectEnvironmentFile(String credentialId, String fileName) {
    echo "💉 Writing ${fileName} from Jenkins credentials..."

    withCredentials([file(credentialsId: credentialId, variable: 'SECRET_ENV_FILE')]) {
        sh """
            cp "\$SECRET_ENV_FILE" "${fileName}"

            if [ ! -f "${fileName}" ]; then
                echo "❌ Failed to write ${fileName}"
                exit 1
            fi

            # Restrict permissions — only the build user should read it
            chmod 600 "${fileName}"

            SIZE=\$(wc -c < "${fileName}")
            echo "📦 File size: \${SIZE} bytes"
            echo "✅ ${fileName} injected"
        """
    }
}

def validateEnvironmentFile(String fileName) {
    echo "🔍 Validating ${fileName}..."

    sh """
        # File must exist and be non-empty
        if [ ! -s "${fileName}" ]; then
            echo "❌ ${fileName} is missing or empty"
            exit 1
        fi

        # Basic format check: at least one KEY=VALUE line
        if ! grep -qE "^[A-Z_]+=.+" "${fileName}"; then
            echo "❌ ${fileName} contains no valid KEY=VALUE pairs"
            exit 1
        fi

        # ── Required variables (from .env.example) ────────────────────────────
        REQUIRED="MONGODB_URI JWT_SECRET JWT_REFRESH_SECRET PORT APP_URL"
        MISSING=""
        for VAR in \$REQUIRED; do
            if ! grep -qE "^\${VAR}=.+" "${fileName}"; then
                MISSING="\$MISSING \$VAR"
            fi
        done
        if [ -n "\$MISSING" ]; then
            echo "❌ Missing required variables:\$MISSING"
            exit 1
        fi

        # ── Warn about duplicate keys ──────────────────────────────────────────
        DUPES=\$(grep -E "^[^#]" "${fileName}" | cut -d= -f1 | sort | uniq -d || true)
        if [ -n "\$DUPES" ]; then
            echo "⚠️  Duplicate keys detected: \$DUPES"
        fi

        # ── Count variables ────────────────────────────────────────────────────
        VAR_COUNT=\$(grep -cE "^[^#].*=." "${fileName}" || echo 0)
        echo "📊 Variables defined: \$VAR_COUNT"

        echo "✅ ${fileName} validated"
    """
}

def logEnvironmentMetadata(String fileName, String targetEnv) {
    echo "📋 Logging environment metadata (no values exposed)..."

    sh """
        # Write a sanitised list of variable *names only* — safe to archive
        grep -E "^[^#]" "${fileName}" | cut -d= -f1 | sort > env-vars-list.txt

        echo "Available environment variables for ${targetEnv}:"
        cat env-vars-list.txt

        cat > env-metadata.json <<EOF
{
  "fileName": "${fileName}",
  "environment": "${targetEnv}",
  "injectedAt": "${env.BUILD_TIMESTAMP}",
  "buildNumber": "${env.BUILD_NUMBER}",
  "variableCount": \$(wc -l < env-vars-list.txt)
}
EOF

        echo "✅ Metadata logged"
    """

    // Archive metadata only — never the actual env file
    archiveArtifacts artifacts: 'env-metadata.json,env-vars-list.txt', allowEmptyArchive: true
}

def cleanupEnvFiles() {
    echo "🧹 Cleaning up injected env files..."

    sh '''
        # Remove all injected env files so they don't linger in the workspace
        find . -maxdepth 1 -name ".env.*" -type f -delete 2>/dev/null || true
        rm -f env-vars-list.txt env-metadata.json || true
        echo "✅ Env files cleaned up"
    '''
}

def auditAccess() {
    echo "📝 Auditing environment access..."

    sh """
        cat >> env-access-audit.log <<EOF
{
  "timestamp": "${env.BUILD_TIMESTAMP}",
  "buildNumber": "${env.BUILD_NUMBER}",
  "environment": "${env.TARGET_ENV}",
  "user": "${env.BUILD_USER_ID ?: 'system'}",
  "branch": "${env.BRANCH_NAME}",
  "commit": "${env.GIT_COMMIT_SHORT}"
}
EOF
        echo "✅ Access audited"
    """
}

return this
