# Runbooks

Operational procedures, deployment guides, and maintenance tasks for BetterLibmanan.

## Table of Contents

- [Development Workflow](./development.md) -- Local setup, coding standards, and contribution guidelines
- [Deployment Guide](./deployment.md) -- Production deployment procedures
- [Environment Management](./environments.md) -- Managing development, staging, and production environments
- [Database Operations](./database.md) -- Backup, restore, and migration procedures
- [Monitoring & Alerts](./monitoring.md) -- System monitoring and alert configuration
- [Troubleshooting](./troubleshooting.md) -- Common issues and solutions
- [Disaster Recovery](./disaster-recovery.md) -- Backup and recovery procedures
- [Security Hardening](./security-hardening.md) -- Production security checklist

## Quick Reference

### Development

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm run dev

# Start specific app
pnpm run dev:frontend
pnpm run dev:backend
pnpm run dev:worker

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run typecheck
```

### Production Build

```bash
# Build all apps
pnpm run build

# Build and verify
pnpm run build:verify

# Start production server
pnpm run start
```

### Docker

```bash
# Start all services
pnpm run docker:up

# Stop all services
pnpm run docker:down

# Rebuild images
pnpm run docker:build
```

### Database

```bash
# Run migrations
pnpm run db:migrate

# Seed database
pnpm run db:seed
```

## Emergency Contacts

| Issue               | Contact          | Escalation         |
| ------------------- | ---------------- | ------------------ |
| Production Outage   | On-call Engineer | DevOps Lead -> CTO |
| Security Incident   | Security Team    | CISO -> CTO        |
| Data Loss           | Database Admin   | DevOps Lead -> CTO |
| Service Degradation | On-call Engineer | DevOps Lead        |

## Monitoring Dashboards

- **Grafana**: System metrics, request rates, error rates
- **Prometheus**: Raw metrics and alerting rules
- **Loki**: Centralized log aggregation
- **Health Check**: `GET /health` endpoint

## Incident Response

1. **Identify**: Confirm the incident via monitoring alerts or user reports
2. **Assess**: Determine severity (P0 critical, P1 high, P2 medium, P3 low)
3. **Respond**: Follow incident-specific runbook
4. **Communicate**: Update stakeholders via status page
5. **Resolve**: Implement fix and verify resolution
6. **Document**: Write postmortem with root cause and prevention measures

## Deployment Schedule

| Environment | Schedule             | Approval Required |
| ----------- | -------------------- | ----------------- |
| Development | On commit            | Auto (CI/CD)      |
| Staging     | Daily                | Team Lead         |
| Production  | Weekly (Fridays 2pm) | CTO + QA Sign-off |

## Related Documents

- [Deployment Procedures](./deployment.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Security Hardening](./security-hardening.md)
- [Monitoring Configuration](./monitoring.md)
