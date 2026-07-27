# Monitoring & Alerts

How BetterLibmanan is monitored in production.

## Overview

The monitoring stack consists of:

| Tool           | Purpose                         | Port |
| -------------- | ------------------------------- | ---- |
| **Prometheus** | Metrics collection and alerting | 9090 |
| **Grafana**    | Dashboards and visualization    | 3001 |
| **Loki**       | Log aggregation                 | 3100 |
| **Worker**     | Health check and email alerts   | --   |

## Health Check Endpoint

The primary health signal is the backend's `/health` endpoint.

```bash
curl http://localhost:5000/health
```

**Response fields**:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-07-27T12:00:00.000Z",
  "environment": "production",
  "server": {
    "uptime": 86400,
    "memory": {
      "rss": 104857600,
      "heapTotal": 52428800,
      "heapUsed": 40894464,
      "external": 1048576
    },
    "version": "v18.20.0"
  },
  "frontend": {
    "distPath": "/app/build/frontend",
    "assetsPath": "/app/build/frontend/assets",
    "indexHtml": true,
    "assetsDir": true,
    "ready": true
  }
}
```

**Unhealthy signals**:

- `success: false`
- `frontend.ready: false` -- SPA build is missing or incomplete
- HTTP response code is not `200`
- Request timeout (server is overloaded or down)

## Worker Health Monitor

The background worker polls `/health` at a configurable interval:

```dotenv
HEALTH_CHECK_INTERVAL_MINUTES=3
```

Default: every **3 minutes**.

When a health check fails:

1. The worker logs the error with full details
2. An email alert is sent to `ADMIN_EMAIL` via `SMTP_*` credentials
3. Subsequent failures are suppressed until the service recovers (prevents alert flooding)
4. When the service recovers, the `reportedError` flag is reset (next failure will alert again)

### Worker Logs

```bash
# PM2
pm2 logs betterlibmanan-worker

# Docker
docker logs betterlibmanan-worker

# Kubernetes
kubectl logs -l app=betterlibmanan-worker -n betterlibmanan -f
```

### Alert Email Format

The email includes:

- Timestamp of the failure
- HTTP status code (or "unknown" if network error)
- Error message
- Health endpoint URL

## Prometheus Metrics

Configuration: `infrastructure/monitoring/prometheus/`

### Metrics to Track

| Metric                          | Type      | Description                                |
| ------------------------------- | --------- | ------------------------------------------ |
| `http_requests_total`           | Counter   | Total API requests by method, path, status |
| `http_request_duration_seconds` | Histogram | Request latency distribution               |
| `nodejs_heap_used_bytes`        | Gauge     | Node.js heap memory usage                  |
| `nodejs_active_handles_total`   | Gauge     | Active async handles                       |
| `mongodb_connections`           | Gauge     | MongoDB connection pool size               |
| `process_cpu_seconds_total`     | Counter   | CPU usage                                  |

### Accessing Prometheus

```
http://localhost:9090
```

**Useful queries**:

```promql
# Error rate (5xx per second)
rate(http_requests_total{status=~"5.."}[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage MB
nodejs_heap_used_bytes / 1024 / 1024

# Request rate
rate(http_requests_total[1m])
```

## Grafana Dashboards

Configuration: `infrastructure/monitoring/grafana/`

### Accessing Grafana

```
http://localhost:3001
```

Default credentials: `admin` / `admin` (change immediately in production)

### Recommended Dashboards

1. **Node.js Application Overview**
   - Request rate and error rate
   - P50, P95, P99 latency
   - Memory and CPU usage
   - Active connections

2. **MongoDB Overview**
   - Query performance
   - Connection pool
   - Operation rates

3. **Business Metrics**
   - Active admin sessions
   - Content updates per hour
   - Most accessed modules

## Loki Log Aggregation

Configuration: `infrastructure/monitoring/loki/`

Loki collects structured JSON logs from the backend and worker via promtail or Docker logging driver.

### Querying Logs

In Grafana, use LogQL:

```logql
# All error logs
{app="betterlibmanan-backend"} |= "level\":\"error\""

# Login events
{app="betterlibmanan-backend"} |= "AUTH" |= "Login successful"

# SPA serving issues
{app="betterlibmanan-backend"} |= "[SPA]"
```

## Alerting Rules

Recommended alerts to configure in Prometheus/Grafana:

| Alert                 | Condition                  | Severity | Action              |
| --------------------- | -------------------------- | -------- | ------------------- |
| High Error Rate       | >5% 5xx in 5 min           | Critical | Page on-call        |
| High Latency          | P95 > 2s for 10 min        | Warning  | Investigate         |
| OOM Risk              | Heap > 85%                 | Warning  | Restart service     |
| DB Connection Failure | MongoDB down               | Critical | Page on-call        |
| Health Check Failing  | /health != 200             | Critical | Auto-restart + page |
| Worker Down           | No health polls for 10 min | Warning  | Investigate         |

## Manual Health Checks

### Backend

```bash
# Basic health
curl -f http://localhost:5000/health

# API availability
curl -f http://localhost:5000/api

# Check frontend is served
curl -I http://localhost:5000/ | grep "Content-Type"
```

### Database

```bash
# MongoDB connection test
mongosh "$MONGODB_URI" --eval "db.adminCommand({ ping: 1 })"

# Collection count
mongosh "$MONGODB_URI" --eval "db.tourism.countDocuments()"
```

### Worker

```bash
# Check worker process is running
pm2 status betterlibmanan-worker

# Or via Docker
docker ps | grep worker
```

## Log Levels

The backend uses Winston with the following log levels:

| Level   | Usage                            | Example                           |
| ------- | -------------------------------- | --------------------------------- |
| `error` | System errors, exceptions        | Database connection failed        |
| `warn`  | Abnormal but non-critical events | CORS blocked origin, DNS issue    |
| `info`  | Normal operations                | Server started, admin logged in   |
| `debug` | Detailed debugging (dev only)    | Static asset served, query params |

Configure log level:

```dotenv
LOG_LEVEL=info  # error, warn, info, debug
```

## Related Documents

- [Deployment Guide](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
- [Security Hardening](./security-hardening.md)
