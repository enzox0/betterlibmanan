# Environment Management

How to configure and manage different environments for BetterLibmanan.

## Environments

| Environment   | Purpose                   | Branch    | Auto-deploy |
| ------------- | ------------------------- | --------- | ----------- |
| `development` | Local coding and testing  | Any       | No          |
| `staging`     | Pre-production validation | `develop` | Yes (CI/CD) |
| `production`  | Live system for end users | `main`    | Yes (CI/CD) |

## Environment Files

The project uses dotenv with priority-based loading:

```
.env.*.local    (highest priority, gitignored, machine-specific)
.env.*          (environment-specific, can be committed if no secrets)
.env            (lowest priority, base configuration)
```

### Creating Environment Files

```bash
# Development
cp .env.example .env
# Edit with your local values

# Staging (no .local suffix -- can be committed without secrets)
cp .env.example .env.staging
# Edit staging values; secrets injected by CI

# Production (never commit this)
cp .env.example .env.production.local
# Edit production secrets
```

## Environment Variable Reference

Complete reference with all variables and their purpose:

### Application Settings

| Variable   | Default                 | Description                                               |
| ---------- | ----------------------- | --------------------------------------------------------- |
| `NODE_ENV` | `development`           | Environment name (`development`, `staging`, `production`) |
| `APP_NAME` | `BetterLibmanan`        | Application display name                                  |
| `APP_URL`  | `http://localhost:3000` | Frontend base URL                                         |
| `API_URL`  | `http://localhost:5000` | Backend API base URL                                      |

### Backend Server

| Variable | Default   | Description      |
| -------- | --------- | ---------------- |
| `PORT`   | `5000`    | HTTP server port |
| `HOST`   | `0.0.0.0` | Bind address     |

### Database

| Variable      | Required | Description               |
| ------------- | -------- | ------------------------- |
| `MONGODB_URI` | Yes      | MongoDB connection string |

### Authentication

| Variable                             | Required            | Description                                 |
| ------------------------------------ | ------------------- | ------------------------------------------- |
| `JWT_ACCESS_SECRET`                  | Yes                 | Access token signing secret (min 32 chars)  |
| `JWT_REFRESH_SECRET`                 | Yes                 | Refresh token signing secret (min 32 chars) |
| `JWT_ACCESS_TTL`                     | No (default: `15m`) | Access token TTL                            |
| `JWT_REFRESH_TTL_DAYS`               | No (default: `7`)   | Refresh token max lifetime in days          |
| `SESSION_INACTIVITY_TIMEOUT_MINUTES` | No (default: `30`)  | Session inactivity window                   |

### CORS

| Variable      | Default                 | Description                                     |
| ------------- | ----------------------- | ----------------------------------------------- |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin(s), comma-separated for multiple |

### Email (SMTP)

| Variable      | Required                      | Description           |
| ------------- | ----------------------------- | --------------------- |
| `SMTP_HOST`   | Yes (for alerts)              | SMTP server hostname  |
| `SMTP_PORT`   | `587`                         | SMTP port             |
| `SMTP_USER`   | Yes (for alerts)              | SMTP username         |
| `SMTP_PASS`   | Yes (for alerts)              | SMTP password         |
| `MAIL_FROM`   | `no-reply@betterlibmanan.org` | Sender email address  |
| `ADMIN_EMAIL` | Yes (for alerts)              | Alert recipient email |

### Storage (Cloudflare R2)

| Variable               | Required          | Description                  |
| ---------------------- | ----------------- | ---------------------------- |
| `R2_ACCOUNT_ID`        | Yes (for uploads) | Cloudflare account ID        |
| `R2_ACCESS_KEY_ID`     | Yes (for uploads) | R2 access key                |
| `R2_SECRET_ACCESS_KEY` | Yes (for uploads) | R2 secret key                |
| `R2_BUCKET_NAME`       | Yes (for uploads) | R2 bucket name               |
| `R2_PUBLIC_BASE_URL`   | Yes (for uploads) | Public URL prefix for bucket |

### Worker / Health

| Variable                        | Default | Description                  |
| ------------------------------- | ------- | ---------------------------- |
| `HEALTH_CHECK_INTERVAL_MINUTES` | `3`     | Worker health poll frequency |

### Frontend (Vite)

|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes (for map) | Google Maps API key |
| `VITE_R2_PUBLIC_BASE_URL` | No | Custom R2 public URL (if using custom domain) |
| `VITE_SOCKET_URL` | No | Socket.IO server URL (if different from API origin) |
| `VITE_PORT` | `3000` | Frontend dev server port |

### Monitoring

| Variable     | Description                                         |
| ------------ | --------------------------------------------------- |
| `SENTRY_DSN` | Sentry error tracking DSN (optional)                |
| `LOG_LEVEL`  | Winston log level: `error`, `warn`, `info`, `debug` |

## Development Configuration

Minimal `.env` for local development:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/betterlibmanan
JWT_ACCESS_SECRET=dev-access-secret-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Staging Configuration

Additional variables for staging:

```dotenv
NODE_ENV=staging
PORT=5000
APP_URL=https://staging.libmanan.gov.ph
CORS_ORIGIN=https://staging.libmanan.gov.ph
# Secrets injected by CI/CD
```

## Production Configuration

Required for production:

```dotenv
NODE_ENV=production
PORT=5000
APP_URL=https://libmanan.gov.ph
CORS_ORIGIN=https://libmanan.gov.ph,https://www.libmanan.gov.ph
LOG_LEVEL=info
# All secrets must be non-placeholder values
```

## Switching Environments

```bash
# Development (default)
NODE_ENV=development pnpm run dev

# Test with staging config
NODE_ENV=staging pnpm run dev

# Simulate production locally
NODE_ENV=production pnpm run build && pnpm run start
```

## CI/CD Environment Variables

In GitHub Actions (`.github.disabled/workflows/`):

```yaml
env:
  NODE_ENV: production
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET }}
  JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}
```

In Render.com:

- Set secrets directly in the dashboard under **Environment > Secret Files** or **Environment Variables**
- Render auto-injects `MONGODB_URI` from the managed database

## Validating Configuration

Test that your environment is correctly configured:

```bash
# Check backend can start
NODE_ENV=production pnpm run start:backend

# Verify health endpoint
curl http://localhost:5000/health

# Verify API responds
curl http://localhost:5000/api

# Test database connection (via logs)
grep "Database connected" logs/app.log
```

## Secret Rotation Procedure

When rotating secrets (e.g., JWT secrets after a potential breach):

1. **Generate new secrets**:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update environment variables** in your hosting provider

3. **Restart the application**: New access tokens will use the new secret

4. **Effect**: All existing access tokens become immediately invalid. All admins must log in again (their refresh tokens are still valid but will exchange for new access tokens signed with the new secret).

> If you suspect refresh tokens are compromised, also clear the `refreshtokens` MongoDB collection to force all users to re-authenticate.

## Related Documents

- [Deployment Guide](./deployment.md)
- [Security Hardening](./security-hardening.md)
- [Troubleshooting](./troubleshooting.md)
