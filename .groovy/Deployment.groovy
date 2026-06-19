/**
 * Deployment Script — BetterLibmanan
 *
 * Target: Linux VPS (Nginx + Node.js systemd service)
 * Strategy: Standard (atomic swap) by default, blue-green opt-in
 *
 * The backend is a Node.js monolith that also serves the Vite SPA
 * from build/frontend/ — so we deploy both together.
 *
 * Remote layout on VPS:
 *   /var/www/betterlibmanan/{env}/
 *     app/           ← live Node.js + frontend dist
 *     app.staging/   ← staging area during transfer
 *     app.old/       ← previous release (atomic swap safety net)
 *     backups/       ← tar.gz rolling backups (last 5)
 *
 * Systemd service: betterlibmanan-{env}
 * Web server:      Nginx (reverse proxy to Node on PORT)
 */

def publish(String appName = 'betterlibmanan') {
    def startTime  = System.currentTimeMillis()
    def targetEnv  = env.TARGET_ENV

    try {
        echo "🚀 Deploying ${appName} to ${targetEnv}"

        validateDeploymentPrerequisites(appName, targetEnv)
        createDeploymentBackup(appName, targetEnv)

        def strategy = env.DEPLOYMENT_MODE ?: 'standard'
        switch (strategy) {
            case 'blue-green':
                deployBlueGreen(appName, targetEnv)
                break
            default:
                deployStandard(appName, targetEnv)
        }

        postDeploymentTasks(appName, targetEnv)

        def duration = (System.currentTimeMillis() - startTime) / 1000
        echo "✅ Deployment completed in ${duration}s"

        return [success: true, duration: duration, environment: targetEnv]

    } catch (Exception e) {
        def duration = (System.currentTimeMillis() - startTime) / 1000
        echo "❌ Deployment failed after ${duration}s: ${e.message}"

        if (env.IS_PRODUCTION == 'true') {
            echo "🔄 Production failure — initiating automatic rollback..."
            rollback(appName)
        }

        throw e
    }
}

def validateDeploymentPrerequisites(String appName, String targetEnv) {
    echo "🔍 Validating deployment prerequisites..."

    sh """
        # Build output must exist before we try to deploy
        if [ ! -d "build/backend" ] || [ ! -f "build/backend/main.js" ]; then
            echo "❌ build/backend/main.js not found — run the Build stage first"
            exit 1
        fi
        if [ ! -d "build/frontend" ] || [ ! -f "build/frontend/index.html" ]; then
            echo "❌ build/frontend/index.html not found — run the Build stage first"
            exit 1
        fi

        # SSH credentials must be configured
        if [ -z "\$VPS2_USER" ]; then
            echo "❌ VPS2_USER not set"
            exit 1
        fi
        if [ -z "\$VPS2_HOST" ]; then
            echo "❌ VPS2_HOST not set"
            exit 1
        fi

        echo "✅ Prerequisites validated"
    """
}

def createDeploymentBackup(String appName, String targetEnv) {
    echo "💾 Backing up current deployment..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser  = env.VPS2_USER
        def remoteHost  = env.VPS2_HOST
        def appDir      = "/var/www/${appName}/${targetEnv}/app"
        def backupDir   = "/var/www/${appName}/${targetEnv}/backups"
        def backupName  = "backup-${env.BUILD_TIMESTAMP}"

        sh """
            ssh -o ConnectTimeout=15 -o StrictHostKeyChecking=no ${remoteUser}@${remoteHost} \
                "echo '✅ SSH connection OK'"

            ssh ${remoteUser}@${remoteHost} "mkdir -p ${backupDir}"

            ssh ${remoteUser}@${remoteHost} "
                if [ -d ${appDir} ] && [ -f ${appDir}/backend/main.js ]; then
                    echo '📦 Creating backup...'
                    tar -czf ${backupDir}/${backupName}.tar.gz -C ${appDir} . 2>/dev/null || true
                    # Keep last 5 backups
                    cd ${backupDir} && ls -t backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
                    echo '✅ Backup: ${backupName}.tar.gz'
                else
                    echo 'ℹ️  No existing deployment to back up'
                fi
            "
        """
    }
}

def deployStandard(String appName, String targetEnv) {
    echo "📦 Standard deployment (atomic swap)..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser  = env.VPS2_USER
        def remoteHost  = env.VPS2_HOST
        def baseDir     = "/var/www/${appName}/${targetEnv}"
        def appDir      = "${baseDir}/app"
        def stagingDir  = "${baseDir}/app.staging"

        sh """
            # Prepare staging area
            ssh ${remoteUser}@${remoteHost} "
                rm -rf ${stagingDir}
                mkdir -p ${stagingDir}/backend ${stagingDir}/frontend
            "

            # Transfer backend build
            echo "📤 Transferring backend..."
            tar -czf - -C build/backend . | \
                ssh ${remoteUser}@${remoteHost} "tar -xzf - -C ${stagingDir}/backend"

            # Transfer frontend dist
            echo "📤 Transferring frontend..."
            tar -czf - -C build/frontend . | \
                ssh ${remoteUser}@${remoteHost} "tar -xzf - -C ${stagingDir}/frontend"

            # Transfer root package.json + pnpm lockfile so we can run
            # `pnpm install --prod` on the server if needed
            scp package.json pnpm-lock.yaml ${remoteUser}@${remoteHost}:${stagingDir}/

            # Validate staging contents
            ssh ${remoteUser}@${remoteHost} "
                if [ ! -f ${stagingDir}/backend/main.js ]; then
                    echo '❌ Staging validation failed: backend/main.js missing'
                    exit 1
                fi
                if [ ! -f ${stagingDir}/frontend/index.html ]; then
                    echo '❌ Staging validation failed: frontend/index.html missing'
                    exit 1
                fi
                echo '✅ Staging validated'
            "

            # Atomic swap
            ssh ${remoteUser}@${remoteHost} "
                mkdir -p ${baseDir}
                if [ -d ${appDir} ]; then
                    mv ${appDir} ${appDir}.old
                fi
                mv ${stagingDir} ${appDir}
                rm -rf ${appDir}.old
                echo '✅ Atomic swap completed'
            "

            # Permissions
            ssh ${remoteUser}@${remoteHost} "
                chown -R www-data:www-data ${appDir}
                find ${appDir} -type d -exec chmod 755 {} \\;
                find ${appDir} -type f -exec chmod 644 {} \\;
                # Node entry must be executable
                chmod 755 ${appDir}/backend/main.js
                echo '✅ Permissions set'
            "

            # Restart Node.js service + reload Nginx
            ssh ${remoteUser}@${remoteHost} "
                # Restart the betterlibmanan Node service
                sudo systemctl restart betterlibmanan-${targetEnv} || {
                    echo '❌ Failed to restart betterlibmanan-${targetEnv}'
                    exit 1
                }
                sudo systemctl is-active betterlibmanan-${targetEnv} || {
                    echo '❌ Service is not running after restart'
                    exit 1
                }

                # Reload Nginx (config should already be in place)
                sudo nginx -t && sudo systemctl reload nginx || {
                    echo '❌ Nginx reload failed'
                    exit 1
                }

                echo '✅ Services restarted'
            "

            echo "✅ Standard deployment completed"
        """
    }
}

def deployBlueGreen(String appName, String targetEnv) {
    echo "🔵🟢 Blue-green deployment..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser = env.VPS2_USER
        def remoteHost = env.VPS2_HOST
        def baseDir    = "/var/www/${appName}/${targetEnv}"

        sh """
            # Determine active slot from symlink
            CURRENT_SLOT=\$(ssh ${remoteUser}@${remoteHost} "
                if [ -L ${baseDir}/app ]; then
                    readlink ${baseDir}/app | grep -oE 'blue|green' || echo 'blue'
                else
                    echo 'blue'
                fi
            ")

            NEXT_SLOT=\$([ "\$CURRENT_SLOT" = "blue" ] && echo "green" || echo "blue")
            echo "Active slot: \$CURRENT_SLOT  →  Deploying to: \$NEXT_SLOT"

            # Prepare next slot
            ssh ${remoteUser}@${remoteHost} "
                rm -rf ${baseDir}/app-\$NEXT_SLOT
                mkdir -p ${baseDir}/app-\$NEXT_SLOT/backend ${baseDir}/app-\$NEXT_SLOT/frontend
            "

            # Transfer files
            tar -czf - -C build/backend . | \
                ssh ${remoteUser}@${remoteHost} "tar -xzf - -C ${baseDir}/app-\$NEXT_SLOT/backend"
            tar -czf - -C build/frontend . | \
                ssh ${remoteUser}@${remoteHost} "tar -xzf - -C ${baseDir}/app-\$NEXT_SLOT/frontend"
            scp package.json pnpm-lock.yaml \
                ${remoteUser}@${remoteHost}:${baseDir}/app-\$NEXT_SLOT/

            # Set permissions
            ssh ${remoteUser}@${remoteHost} "
                chown -R www-data:www-data ${baseDir}/app-\$NEXT_SLOT
                chmod -R 755 ${baseDir}/app-\$NEXT_SLOT
            "

            # Atomic symlink swap (mv -T is atomic on Linux)
            ssh ${remoteUser}@${remoteHost} "
                ln -sfn ${baseDir}/app-\$NEXT_SLOT ${baseDir}/app.next
                mv -Tf ${baseDir}/app.next ${baseDir}/app
                echo '✅ Symlink swapped to \$NEXT_SLOT'
            "

            # Restart service + reload Nginx
            ssh ${remoteUser}@${remoteHost} "
                sudo systemctl restart betterlibmanan-${targetEnv}
                sudo nginx -t && sudo systemctl reload nginx
            "

            echo "✅ Blue-green deployment completed (\$NEXT_SLOT is now live)"
        """
    }
}

def postDeploymentTasks(String appName, String targetEnv) {
    echo "🔧 Post-deployment tasks..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser = env.VPS2_USER
        def remoteHost = env.VPS2_HOST
        def appDir     = "/var/www/${appName}/${targetEnv}/app"

        sh """
            ssh ${remoteUser}@${remoteHost} "
                cat > ${appDir}/.deployment-info <<EOF
Application:   BetterLibmanan
Environment:   ${targetEnv}
Build Number:  ${env.BUILD_NUMBER}
Build Tag:     ${env.BUILD_TAG}
Git Commit:    ${env.GIT_COMMIT_SHORT}
Branch:        ${env.BRANCH_NAME}
Deployed At:   ${env.BUILD_TIMESTAMP}
Deployed By:   ${env.BUILD_USER_ID ?: 'Jenkins'}
EOF
                echo '✅ Deployment info written'
            "
        """
    }
}

def verify(String appName = 'betterlibmanan') {
    def targetEnv  = env.TARGET_ENV
    def maxRetries = 5
    def interval   = 10

    echo "🔍 Verifying deployment to ${targetEnv}..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser = env.VPS2_USER
        def remoteHost = env.VPS2_HOST
        def appDir     = "/var/www/${appName}/${targetEnv}/app"

        sh """
            ssh ${remoteUser}@${remoteHost} "
                [ -d ${appDir} ]              || { echo '❌ App dir missing'; exit 1; }
                [ -f ${appDir}/backend/main.js ] || { echo '❌ backend/main.js missing'; exit 1; }
                [ -f ${appDir}/frontend/index.html ] || { echo '❌ frontend/index.html missing'; exit 1; }

                sudo systemctl is-active betterlibmanan-${targetEnv} || {
                    echo '❌ Node service not running'
                    exit 1
                }
                sudo systemctl is-active nginx || {
                    echo '❌ Nginx not running'
                    exit 1
                }

                echo '✅ Files and services verified'
            "
        """
    }

    // HTTP health check against the /health endpoint the backend exposes
    retry(maxRetries) {
        sleep interval
        sh """
            HEALTH_URL="http://\${VPS2_HOST}/health"
            HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \$HEALTH_URL || echo "000")

            if [ "\$HTTP_CODE" = "200" ]; then
                echo "✅ Health check passed (HTTP \$HTTP_CODE)"
            else
                echo "⚠️ Health check returned HTTP \$HTTP_CODE — retrying..."
                exit 1
            fi
        """
    }

    echo "✅ Deployment verified"
}

def rollback(String appName = 'betterlibmanan') {
    def targetEnv = env.TARGET_ENV

    echo "🔄 Rolling back ${appName} in ${targetEnv}..."

    sshagent(credentials: ['VPS_CREDENTIAL_1']) {
        def remoteUser = env.VPS2_USER
        def remoteHost = env.VPS2_HOST
        def baseDir    = "/var/www/${appName}/${targetEnv}"
        def appDir     = "${baseDir}/app"
        def backupDir  = "${baseDir}/backups"

        sh """
            LATEST_BACKUP=\$(ssh ${remoteUser}@${remoteHost} \
                "ls -t ${backupDir}/backup-*.tar.gz 2>/dev/null | head -n 1")

            if [ -z "\$LATEST_BACKUP" ]; then
                echo "❌ No backup found for rollback"
                exit 1
            fi

            echo "📦 Rolling back to: \$LATEST_BACKUP"

            ssh ${remoteUser}@${remoteHost} "
                ROLLBACK_DIR=${appDir}.rollback
                mkdir -p \$ROLLBACK_DIR
                tar -xzf \$LATEST_BACKUP -C \$ROLLBACK_DIR

                mv ${appDir} ${appDir}.failed
                mv \$ROLLBACK_DIR ${appDir}

                chown -R www-data:www-data ${appDir}
                chmod -R 755 ${appDir}

                sudo systemctl restart betterlibmanan-${targetEnv}
                sudo nginx -t && sudo systemctl reload nginx

                echo '✅ Rollback completed'
            "
        """
    }

    echo "✅ Rollback finished"
}

return this
