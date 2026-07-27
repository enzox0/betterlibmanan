# BetterLibmanan Documentation

This is the central documentation index for BetterLibmanan, an enterprise-grade local government platform for the Municipality of Libmanan.

## Documentation Structure

### [Architecture](./architecture/)
System architecture, design patterns, and technical decisions for the monorepo structure.

### [API Documentation](./api/)
Complete REST API reference, endpoints, authentication, and integration guides.

### [Architecture Decision Records](./decisions/)
Historical context and rationale for major technical decisions made throughout the project.

### [System Diagrams](./diagrams/)
Visual representations of system architecture, data flows, and component interactions.

### [Runbooks](./runbooks/)
Operational procedures, deployment guides, troubleshooting steps, and maintenance tasks.

## Quick Links

- [Getting Started Guide](../README.md#quick-start)
- [Deployment Guide](./runbooks/deployment.md)
- [API Reference](./api/endpoints.md)
- [Development Workflow](./runbooks/development.md)
- [System Architecture](./architecture/overview.md)

## Project Overview

BetterLibmanan is a comprehensive, enterprise-grade government platform built with:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query
- **Backend**: Express.js, TypeScript, MongoDB, Redis, Socket.IO
- **Worker**: Background job processor with health monitoring
- **Infrastructure**: Docker, Kubernetes, Terraform, Ansible
- **Monorepo**: Turborepo for efficient build orchestration

### Key Features

- Multi-language support: English, Filipino, and local Philippine languages
- Accessibility: WCAG 2.1 compliant design
- Real-time updates via Socket.IO
- Cloud asset storage via Cloudflare R2
- JWT-based authentication with refresh token rotation
- Monitoring via Prometheus, Grafana, and Loki
- SEO-ready with server-side meta injection, sitemaps, and Open Graph

## Intended Audience

- **Developers**: Implementation details, API specifications, and coding standards
- **DevOps Engineers**: Deployment, infrastructure, and monitoring procedures
- **Project Managers**: Architecture decisions and system capabilities
- **Government Officials**: Feature overview and business capabilities

## Documentation Conventions

- Code blocks are syntax-highlighted for their respective languages
- File paths are relative to the project root unless stated otherwise
- Environment variables are referenced as `VARIABLE_NAME` or `process.env.VARIABLE_NAME`
- Protected API endpoints are marked with `[Auth Required]`

## Getting Help

- **Technical Issues**: [GitHub Issues](https://github.com/enzox0/betterlibmanan/issues)
- **Security Vulnerabilities**: See [SECURITY.md](../SECURITY.md)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

This project is released under the Creative Commons Zero (CC0) License. See [LICENSE.md](../LICENSE.md) for details.

---

**Last Updated**: 2026-07-27
**Documentation Version**: 1.0.0
