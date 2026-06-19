/**
 * Monitoring Script — BetterLibmanan
 *
 * Health checks, deployment metrics, and alerting for the
 * BetterLibmanan monolith (Express + Vite SPA, deployed on VPS).
 *
 * The backend exposes:
 *   GET  /health              → JSON with frontend/service/memory status
 *   POST /api/health/report   → accepts error reports from the frontend
 */

def recordDeploymentMetrics(Map info) {
    echo "📊 Recording deployment metrics..."

    try {
        recordTimeSeries(info)
        sendSlackNotification(info)
        echo "✅ Metrics recorded"
    } catch (Exception e) {
        // Monitoring should never fail the pipeline
        echo "⚠️ Failed to record metrics: ${e.message}"
    }
}

def recordTimeSeries(Map info) {
    sh """
        cat >> deployment-metrics.log <<EOF
timestamp=${info.timestamp ?: env.BUILD_TIMESTAMP}
environment=${info.environment ?: env.TARGET_ENV}
version=${info.version ?: env.APP_VERSION}
buildNumber=${info.buildNumber ?: env.BUILD_NUMBER}
duration=${info.duration ?: 'unknown'}
success=${info.success ?: 'true'}
commit=${info.commit ?: env.GIT_COMMIT_SHORT}
EOF
        echo "✅ Time-series entry written"
    """

    archiveArtifacts artifacts: 'deployment-metrics.log', allowEmptyArchive: true
}

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * Hit the /health endpoint that app.ts exposes.
 * In production the endpoint returns 503 when the frontend dist is missing,
 * so we treat anything other than 200 as a failure.
 */
def checkApplicationHealth(String host, int maxRetries = 5) {
    echo "🏥 Checking application health at ${host}..."

    def healthy  = false
    def attempts = 0

    while (!healthy && attempts < maxRetries) {
        try {
            sh """
                HTTP_CODE=\$(curl -sf -o /tmp/health-response.json \
                    -w "%{http_code}" \
                    --max-time 15 \
                    "http://${host}/health" || echo "000")

                echo "HTTP status: \$HTTP_CODE"

                if [ "\$HTTP_CODE" = "200" ]; then
                    echo "✅ Health check passed"
                    # Show frontend readiness from the response
                    if command -v python3 &>/dev/null; then
                        python3 -c "
import json, sys
try:
    d = json.load(open('/tmp/health-response.json'))
    fe = d.get('frontend', {})
    print(f'  Frontend ready: {fe.get(\\\"ready\\\", \\\"unknown\\\")}')
    print(f'  Uptime: {d.get(\\\"server\\\", {}).get(\\\"uptime\\\", \\\"unknown\\\")}s')
except Exception as e:
    print(f'  (could not parse response: {e})')
" || true
                    fi
                else
                    echo "❌ Health check failed with HTTP \$HTTP_CODE"
                    exit 1
                fi
            """
            healthy = true
        } catch (Exception e) {
            attempts++
            echo "⚠️ Attempt ${attempts}/${maxRetries} failed — retrying in 10s"
            sleep 10
        }
    }

    if (!healthy) {
        throw new Exception("Health check failed after ${maxRetries} attempts at ${host}")
    }
}

def collectPerformanceMetrics(String host) {
    echo "⚡ Collecting performance metrics..."

    sh """
        RESPONSE_TIME=\$(curl -o /dev/null -s -w '%{time_total}' \
            --max-time 10 "http://${host}/health" || echo "timeout")
        PAGE_SIZE=\$(curl -s --max-time 10 "http://${host}/" | wc -c || echo "0")

        echo "Response time : \${RESPONSE_TIME}s"
        echo "SPA page size : \${PAGE_SIZE} bytes"

        cat >> performance-metrics.log <<EOF
timestamp=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
host=${host}
response_time_s=\${RESPONSE_TIME}
spa_page_size_bytes=\${PAGE_SIZE}
build_number=${env.BUILD_NUMBER}
EOF
    """
}

// ─── Notifications ────────────────────────────────────────────────────────────

def sendSlackNotification(Map info) {
    def success = (info.success?.toString() != 'false')
    def color   = success ? 'good' : 'danger'
    def icon    = success ? ':white_check_mark:' : ':rotating_light:'
    def status  = success ? 'SUCCESS' : 'FAILED'

    sh """
        curl -s -X POST "\${SLACK_WEBHOOK_URL}" \
            -H 'Content-Type: application/json' \
            -d '{
                "channel": "${env.SLACK_CHANNEL ?: '#deployments'}",
                "username": "BetterLibmanan CI/CD",
                "icon_emoji": "${icon}",
                "attachments": [{
                    "color": "${color}",
                    "title": "Deployment ${status} — ${env.TARGET_ENV}",
                    "fields": [
                        {"title": "App",         "value": "BetterLibmanan",           "short": true},
                        {"title": "Environment", "value": "${env.TARGET_ENV}",        "short": true},
                        {"title": "Branch",      "value": "${env.BRANCH_NAME}",       "short": true},
                        {"title": "Commit",      "value": "${env.GIT_COMMIT_SHORT}",  "short": true},
                        {"title": "Build #",     "value": "${env.BUILD_NUMBER}",      "short": true},
                        {"title": "Duration",    "value": "${info.duration ?: 'N/A'}s", "short": true}
                    ],
                    "footer": "Jenkins · BetterLibmanan",
                    "ts": \$(date +%s)
                }]
            }' || echo "⚠️ Slack notification failed (non-fatal)"
    """
}

def sendAlert(String severity, String message, Map details = [:]) {
    echo "🚨 [${severity.toUpperCase()}] ${message}"

    sendSlackAlert(severity, message, details)

    if (severity == 'critical') {
        sendEmailAlert(severity, message, details)
    }
}

def sendSlackAlert(String severity, String message, Map details) {
    def colorMap = [info: 'good', warning: 'warning', critical: 'danger']
    def emojiMap = [info: ':information_source:', warning: ':warning:', critical: ':rotating_light:']
    def color    = colorMap[severity] ?: 'warning'
    def emoji    = emojiMap[severity] ?: ':bell:'

    sh """
        curl -s -X POST "\${SLACK_WEBHOOK_URL}" \
            -H 'Content-Type: application/json' \
            -d '{
                "channel": "${env.SLACK_CHANNEL ?: '#deployments'}",
                "username": "BetterLibmanan CI/CD",
                "icon_emoji": "${emoji}",
                "attachments": [{
                    "color": "${color}",
                    "title": "${message}",
                    "fields": [
                        {"title": "Severity",    "value": "${severity}",             "short": true},
                        {"title": "Environment", "value": "${env.TARGET_ENV}",       "short": true},
                        {"title": "Build #",     "value": "${env.BUILD_NUMBER}",     "short": true},
                        {"title": "Commit",      "value": "${env.GIT_COMMIT_SHORT}", "short": true}
                    ],
                    "footer": "Jenkins · BetterLibmanan",
                    "ts": \$(date +%s)
                }]
            }' || echo "⚠️ Slack alert failed"
    """
}

def sendEmailAlert(String severity, String message, Map details) {
    try {
        emailext(
            subject: "[${severity.toUpperCase()}] BetterLibmanan — ${message}",
            body: """
                <h2>${message}</h2>
                <table>
                    <tr><td><b>Severity</b></td><td>${severity}</td></tr>
                    <tr><td><b>Environment</b></td><td>${env.TARGET_ENV}</td></tr>
                    <tr><td><b>Build #</b></td><td>${env.BUILD_NUMBER}</td></tr>
                    <tr><td><b>Branch</b></td><td>${env.BRANCH_NAME}</td></tr>
                    <tr><td><b>Commit</b></td><td>${env.GIT_COMMIT_SHORT}</td></tr>
                    <tr><td><b>Timestamp</b></td><td>${env.BUILD_TIMESTAMP}</td></tr>
                </table>
                <h3>Details</h3>
                <pre>${details}</pre>
                <p><a href="${env.BUILD_URL}">View Build in Jenkins</a></p>
            """,
            to      : env.NOTIFICATION_EMAIL ?: 'lil.studiosx@gmail.com',
            mimeType: 'text/html'
        )
    } catch (Exception e) {
        echo "⚠️ Email alert failed: ${e.message}"
    }
}

// ─── Metric helpers ───────────────────────────────────────────────────────────

def trackDuration(String label, Closure block) {
    def start = System.currentTimeMillis()
    try {
        block()
        def duration = (System.currentTimeMillis() - start) / 1000
        echo "⏱️  ${label} completed in ${duration}s"
        return duration
    } catch (Exception e) {
        def duration = (System.currentTimeMillis() - start) / 1000
        echo "⏱️  ${label} failed after ${duration}s"
        throw e
    }
}

return this
