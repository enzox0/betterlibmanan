# Troubleshooting Guide

Common issues and their solutions for BetterLibmanan.

## Table of Contents

- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [File Upload Issues](#file-upload-issues)

- [Frontend Issues](#frontend-issues)
- [Worker Issues](#worker-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)

---

## Database Issues

### `querySrv ECONNREFUSED` / `querySrv ENOTFOUND`

**Symptom**: Server fails to start, error in logs: `querySrv ECONNREFUSED`

**Cause**: Local DNS resolver can't resolve MongoDB Atlas SRV records. Common with ISP resolvers, VPNs, and corporate networks.

**Solution**: The server already overrides DNS on startup to Cloudflare/Google resolvers. If still failing:

1. Check the override is being applied before connection:

   ```typescript
   // This MUST be at top of main.ts BEFORE any imports that use DNS
   import dns from "dns";
   dns.setServers(["1.1.1.1", "8.8.8.8"]);
   ```

2. Verify from terminal that the hostname resolves:

   ```bash
   nslookup _mongodb._tcp.your-cluster.mongodb.net 1.1.1.1
   ```

3. Check if your VPN is blocking the query. Try disabling VPN temporarily.

---

### `MongoServerSelectionError` on startup

**Symptom**: Server crashes with `MongoServerSelectionError: connection timed out`

**Cause**: MongoDB is unreachable.

**Solutions**:

1. **Check MongoDB is running**:

   ```bash
   # Docker
   docker ps | grep mongo

   # Local
   systemctl status mongod
   # or
   brew services status mongodb-community
   ```

2. **Check connection string**:

   ```bash
   # Test connection directly
   mongosh "mongodb://localhost:27017/betterlibmanan"
   # or Atlas
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net"
   ```

3. **Check IP allowlist** on MongoDB Atlas -- ensure your server's IP is whitelisted.

4. **Verify environment variable**:
   ```bash
   grep MONGODB_URI .env
   ```

---

### Database connected but data not appearing

**Cause**: Seeded data may not be present, or query is looking at wrong collection.

**Solution**:

```bash
# Re-seed admin account
pnpm run seed

# Check MongoDB collections
mongosh betterlibmanan --eval "db.getCollectionNames()"
```

---

## Authentication Issues

### `401 Unauthorized` on all requests

**Cause**: Token expired, missing, or malformed.

**Solutions**:

1. Check token is included:

   ```
   Authorization: Bearer <token>
   ```

   Note the space between `Bearer` and the token.

2. Check token hasn't expired (access token lasts 15 minutes by default).

3. Use the refresh endpoint to get a new access token:
   ```bash
   curl -X POST http://localhost:5000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "<your-refresh-token>"}'
   ```

---

### `Too many login attempts`

**Cause**: Rate limiter triggered (10 failed logins per 15 min per IP).

**Solution**: Wait 15 minutes. The limiter only counts **failed** attempts, so successful logins don't count against the limit.

---

### `Session expired due to inactivity`

**Cause**: Refresh token was not used within the 30-minute inactivity window (`SESSION_INACTIVITY_TIMEOUT_MINUTES`).

**Solution**: Log in again. Consider extending the inactivity timeout if your admin users frequently take long breaks:

```dotenv
SESSION_INACTIVITY_TIMEOUT_MINUTES=60  # 1 hour
```

---

### JWT secret errors on production startup

**Symptom**: `[AUTH] JWT secrets must be set via JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in production`

**Cause**: Placeholder JWT secrets are still in use.

**Solution**: Set proper secrets in your production environment:

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to different generated values.

---

## File Upload Issues

### `Failed to upload to R2`

**Cause**: Missing or incorrect R2 credentials.

**Solutions**:

1. Verify credentials in `.env`:

   ```dotenv
   R2_ACCOUNT_ID=your-cloudflare-account-id
   R2_ACCESS_KEY_ID=your-r2-access-key-id
   R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
   R2_BUCKET_NAME=betterlibmanan
   R2_PUBLIC_BASE_URL=https://your-r2-domain.r2.dev
   ```

2. Verify the bucket exists in Cloudflare dashboard.

3. Check R2 API token has `Object Read & Write` permission.

4. Test connection via AWS CLI (R2 is S3-compatible):
   ```bash
   aws s3 ls s3://your-bucket-name \
     --endpoint-url https://your-account-id.r2.cloudflarestorage.com \
     --region auto
   ```

---

### Uploaded images not displaying

**Cause**: R2 bucket is not public, or `VITE_R2_PUBLIC_BASE_URL` is not set correctly.

**Solutions**:

1. Ensure the R2 bucket has **Public Access** enabled in Cloudflare dashboard.

2. Set `VITE_R2_PUBLIC_BASE_URL` to the correct public base URL (no trailing slash):

   ```dotenv
   VITE_R2_PUBLIC_BASE_URL=https://pub-abc123.r2.dev
   ```

3. Use the image proxy endpoint if direct URLs fail:
   ```
   GET /api/properties/image-proxy?url=<encoded-image-url>
   ```

---

## Frontend Issues

### Blank screen after deployment

**Symptom**: White/blank page, no content.

**Causes and Solutions**:

1. **Build not completed**: Ensure `pnpm run build` completed successfully.

2. **Missing frontend dist**: Backend logs will show `[SPA] Frontend not yet available`. Check build exists at `build/frontend/index.html`.

3. **Wrong asset path**: If assets fail to load (404), check Vite's `base` config:

   ```typescript
   // vite.config.ts
   base: '/', // Must match your deployment path
   ```

4. **CSP blocking scripts**: Check browser console for CSP errors and update the allowed origins in `apps/backend/src/bootstrap/app.ts`.

5. **Environment variable missing**: The frontend may need `VITE_*` variables. Check browser console for runtime errors.

---

### `CORS` errors in browser

**Symptom**: Browser shows `CORS policy: No 'Access-Control-Allow-Origin' header`

**Causes and Solutions**:

1. **Wrong `CORS_ORIGIN`**: Ensure the backend's `CORS_ORIGIN` matches the frontend's origin:

   ```dotenv
   # Backend .env
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Multiple origins**: Separate with commas:

   ```dotenv
   CORS_ORIGIN=https://libmanan.gov.ph,https://www.libmanan.gov.ph
   ```

3. **In production single-origin**: If frontend and backend are on the same domain, CORS should not be triggered. Verify the proxy/Nginx config forwards requests correctly.

---

### `Failed to fetch` in development

**Symptom**: API calls fail in development with network error.

**Causes**:

1. Backend is not running -- check `http://localhost:5000/health`
2. Wrong API URL in frontend config
3. Vite proxy not configured correctly

**Solution**:

```bash
# Verify backend is running
curl http://localhost:5000/health

# Check Vite config for proxy
# apps/frontend/vite.config.ts should have proxy settings
```

---

### TypeScript compilation errors

```bash
# Check for type errors
pnpm run typecheck

# Auto-fix some issues
pnpm run format
```

Common errors:

- `Property does not exist on type` -- Check interface definitions in `packages/types`
- `Cannot find module` -- Check tsconfig paths and package exports
- `Type 'X' is not assignable to type 'Y'` -- Check Zod schema matches your types

---

## Worker Issues

### Worker not sending health alerts

**Cause**: SMTP not configured, or the backend `/health` endpoint is incorrectly returning success.

**Solutions**:

1. Verify SMTP config:

   ```dotenv
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-app-password
   MAIL_FROM=no-reply@betterlibmanan.org
   ADMIN_EMAIL=alerts@your-domain.com
   ```

2. Check worker logs:

   ```bash
   # PM2
   pm2 logs betterlibmanan-worker

   # Docker
   docker logs betterlibmanan-worker
   ```

3. Verify the health endpoint URL:
   ```dotenv
   # In worker's config, should match backend
   API_URL=http://localhost:5000
   ```

---

### Worker exits immediately

**Cause**: Uncaught promise rejection or configuration error.

**Solution**: Check worker logs and ensure all required environment variables are set.

---

## Deployment Issues

### Docker containers won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs mongodb

# Rebuild without cache
docker-compose build --no-cache

# Check port conflicts
netstat -an | grep 5000
netstat -an | grep 27017
```

---

### Render deployment failing

1. Check **Render Deploy Logs** for build errors
2. Verify `render.yaml` is correctly configured
3. Check all required environment variables are set in Render dashboard
4. Verify Docker build succeeds locally:
   ```bash
   docker build -f infrastructure/docker/unified.Dockerfile .
   ```

---

### Out of memory errors

**Symptom**: Container crashes with `SIGKILL` or OOM error.

**Solutions**:

1. Increase container memory limit (Render: upgrade plan; K8s: increase resource limits)

2. Check for memory leaks in the application logs

3. Monitor memory usage:
   ```bash
   # Via health endpoint
   curl http://localhost:5000/health | jq '.server.memory'
   ```

---

## Performance Issues

### Slow API responses

**Diagnosis**:

```bash
# Check response times
time curl http://localhost:5000/api/tourism

# Check database query performance
mongosh betterlibmanan --eval "db.tourism.find().explain('executionStats')"
```

**Solutions**:

1. Add database indexes for frequently queried fields
2. Use projection to return only needed fields
3. Enable pagination on list endpoints (reduce data transfer)
4. Check if R2 image URLs are generating too many redirects

---

### High memory usage

**Solutions**:

1. Reduce Mongoose connection pool size
2. Add `lean()` to Mongoose queries (returns plain objects, not Mongoose documents)
3. Implement pagination to avoid loading large datasets
4. Set image size limits for uploads

---

### Frontend loading slowly

**Solutions**:

1. Ensure production build is used (not dev server)
2. Check Vite's build output for large chunks (code splitting)
3. Ensure assets are served with `Cache-Control: max-age=31536000, immutable`
4. Check if WebP images are being served (R2 uploads are converted to WebP)

---

## Getting More Help

If you're still stuck after following these steps:

1. **Check the logs carefully** -- they contain the actual error
2. **Search GitHub Issues** for similar problems
3. **Create a GitHub Issue** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (Node version, OS, Docker version)
   - Relevant log output (remove sensitive data)

4. **Security Issues**: Do NOT post publicly -- see [SECURITY.md](../../SECURITY.md)

## Related Documents

- [Deployment Guide](./deployment.md)
- [Development Workflow](./development.md)
- [Monitoring & Alerts](./monitoring.md)
