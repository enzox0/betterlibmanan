# Security Hardening Checklist

Pre-production security checklist and hardening guide for BetterLibmanan.

## Application Security

### Authentication

- [ ] **Change JWT secrets**: Replace all `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with cryptographically random values:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **Verify JWT secrets are distinct**: `JWT_ACCESS_SECRET` != `JWT_REFRESH_SECRET`
- [ ] **Test production startup**: Confirm server refuses to start with placeholder secrets
- [ ] **Seed initial admin**: Change default admin password immediately after first login
- [ ] **Configure inactivity timeout**: Set appropriate `SESSION_INACTIVITY_TIMEOUT_MINUTES` for your environment

### CORS

- [ ] **Restrict CORS origins**: Set `CORS_ORIGIN` to your exact production domain (no wildcards):
  ```dotenv
  CORS_ORIGIN=https://libmanan.gov.ph
  ```
- [ ] **Verify CORS headers**: Test with browser dev tools that only allowed origins get `Access-Control-Allow-Origin`

### Rate Limiting

- [ ] **Verify rate limits are active**: Check that `NODE_ENV=production` enables the 500 req/15min global limit
- [ ] **Monitor for unusual traffic**: Watch for IP addresses repeatedly hitting the login rate limit

### Input Validation

- [ ] **Zod schemas active**: All POST/PATCH endpoints validate body with Zod
- [ ] **File upload limits enforced**: Max 10MB body size is configured

### Content Security Policy

- [ ] **Review CSP `scriptSrc`**: Remove any development-only allowances
- [ ] **Remove `unsafe-eval`** if not needed for production:
  ```typescript
  // Only include if strictly necessary
  "'unsafe-eval'";
  ```
- [ ] **Verify Google Maps domain**: If not using Google Maps, remove those entries
- [ ] **Test CSP in browser**: Confirm no CSP violations in browser console

---

## Infrastructure Security

### TLS/HTTPS

- [ ] **HTTPS enabled**: All production traffic uses HTTPS (via Nginx, Render, or similar)
- [ ] **HTTP redirect**: Plain HTTP requests are redirected to HTTPS
- [ ] **Valid certificate**: TLS certificate is valid and not expiring soon
- [ ] **HSTS configured**: `Strict-Transport-Security` header present (Helmet.js provides this)
- [ ] **TLS version**: TLS 1.2+ enforced, TLS 1.0/1.1 disabled

### Network

- [ ] **Firewall rules**: Only ports 80 and 443 open to the internet (5000, 27017, 6379 are internal only)
- [ ] **MongoDB not exposed**: MongoDB port (27017) not accessible from the internet
- [ ] **Redis not exposed**: Redis port (6379) not accessible from the internet

### Docker / Container Security

- [ ] **Non-root user**: Containers run as a non-root user
- [ ] **Read-only filesystem**: Where possible, use read-only container filesystems
- [ ] **Minimal image**: Production image uses multi-stage builds to minimize attack surface
- [ ] **No dev dependencies**: Production image does not include development dependencies
- [ ] **Secret management**: Secrets injected via environment variables, not baked into images

### Kubernetes Security (if using K8s)

- [ ] **Network policies**: Namespace isolation configured
- [ ] **RBAC**: Least-privilege service accounts
- [ ] **Pod security standards**: Restricted PSP/PSA applied
- [ ] **Secrets**: Kubernetes Secrets used for sensitive values (not ConfigMaps)
- [ ] **Image tags**: Pin to specific image digest, not `latest`

---

## Database Security

### MongoDB

- [ ] **Authentication enabled**: MongoDB requires username/password
- [ ] **Principle of least privilege**: Application user has only read/write on its database, not `admin` or `root`
- [ ] **Network allowlist**: MongoDB Atlas IP allowlist contains only known server IPs
- [ ] **Encryption at rest**: Atlas enables encryption at rest by default; verify for self-hosted
- [ ] **Audit logging**: MongoDB Atlas audit logs enabled for compliance
- [ ] **Connection over TLS**: All MongoDB connections use `tls=true`

### Data Retention

- [ ] **Audit log retention**: Configure TTL index on `auditlogs` collection to automatically expire old records:
  ```javascript
  db.auditlogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
  ```
- [ ] **Refresh token cleanup**: Configure TTL on `refreshtokens` for `expiresAt` field:
  ```javascript
  db.refreshtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  ```

---

## Secret Management

- [ ] **`.env` not in version control**: `.env` is in `.gitignore`
- [ ] **`.env.example` safe**: `.env.example` contains only placeholder values (no real secrets)
- [ ] **Environment variables set**: All production secrets are configured in the hosting environment (Render env vars, K8s secrets, etc.)
- [ ] **Cloudflare R2**: Verify R2 API token scope is `Object Read & Write` only (not Account-level)
- [ ] **SMTP app password**: Use app-specific passwords for Gmail/SMTP, not the account password
- [ ] **Secret rotation plan**: Document how and when secrets will be rotated

---

## Dependencies

- [ ] **Run audit**: Check for known vulnerabilities:
  ```bash
  pnpm audit
  ```
- [ ] **Fix critical vulnerabilities**: Address all `critical` and `high` severity advisories
- [ ] **Keep dependencies updated**: Schedule regular dependency updates
- [ ] **Lock file committed**: `pnpm-lock.yaml` is committed to source control

---

## Monitoring & Incident Response

- [ ] **Health alerts configured**: Worker monitors `/health` and sends email on failure
- [ ] **SMTP tested**: Send a test email to verify the alert pipeline works
- [ ] **Log level set**: `LOG_LEVEL=info` in production (not `debug`)
- [ ] **Log aggregation**: Logs are captured and searchable (Loki, Papertrail, etc.)
- [ ] **Uptime monitoring**: External uptime monitor configured (e.g., Better Uptime, UptimeRobot)

---

## Security Headers Verification

Test security headers using:

```bash
curl -I https://your-domain.com
```

Expected headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY (or via CSP: frameSrc 'none')
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Online checker: [securityheaders.com](https://securityheaders.com)

---

## Access Control Review

- [ ] **Admin accounts inventory**: Review all active admin accounts; disable unused ones
- [ ] **Role assignments**: Verify each admin has the minimum role needed (`moderator` vs `admin` vs `superadmin`)
- [ ] **Default password changed**: Initial admin account password has been changed
- [ ] **Multi-factor authentication**: Consider adding TOTP/2FA for superadmin accounts (future enhancement)

---

## Post-Deployment Verification

After each deployment:

1. Verify health check returns `success: true`
2. Test admin login with valid credentials
3. Verify rate limiting is active (attempt 11+ rapid logins)
4. Check browser console -- no CSP violations
5. Test file upload (if R2 is configured)
6. Verify HTTPS redirect is working
7. Check audit logs are recording actions

## Related Documents

- [Security Architecture](../architecture/security.md)
- [Deployment Guide](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
