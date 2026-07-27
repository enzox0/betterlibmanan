# Architecture Decision Records (ADRs)

This directory contains records of architectural decisions made during the development of BetterLibmanan.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision along with its context and consequences. ADRs help:

- Provide historical context for future developers
- Document the reasoning behind non-obvious choices
- Create a knowledge base of past decisions
- Prevent re-litigating already-settled questions

## ADR Format

Each ADR follows this template:

```markdown
# ADR-XXX: Title

**Status**: Accepted | Rejected | Deprecated | Superseded by ADR-YYY
**Date**: YYYY-MM-DD
**Decision Makers**: Names

## Context

What is the issue we're facing that requires a decision?

## Decision

What did we decide to do?

## Consequences

What are the positive and negative impacts of this decision?

## Alternatives Considered

What other options did we consider and why did we reject them?
```

## Current ADRs

### [ADR-001: Monorepo Architecture with Turborepo](./001-monorepo-turborepo.md)

Status: Accepted
Use Turborepo and pnpm workspaces for managing frontend, backend, worker, and shared packages.

### [ADR-002: Single-Origin Deployment Strategy](./002-single-origin-deployment.md)

Status: Accepted
Serve both the SPA and API from a single Express server in production to eliminate CORS complexity.

### [ADR-003: JWT with Refresh Token Rotation](./003-jwt-refresh-token-rotation.md)

Status: Accepted
Use dual-token auth with 15-minute access tokens and 7-day refresh tokens with rotation for security.

### [ADR-004: Cloudflare R2 for File Storage](./004-cloudflare-r2-storage.md)

Status: Accepted
Use Cloudflare R2 (S3-compatible) for image and file storage with public URL serving.

### [ADR-005: MongoDB as Primary Database](./005-mongodb-primary-database.md)

Status: Accepted
Use MongoDB for content flexibility and rapid feature iteration across 30+ modules.

### [ADR-006: Module-Based Backend Architecture](./006-module-based-backend.md)

Status: Accepted
Organize the backend by feature modules (each with model, service, controller, and routes) for maintainability.

### [ADR-007: Inactivity-Based Session Expiry](./007-inactivity-session-expiry.md)

Status: Accepted
Implement a 30-minute sliding-window inactivity timeout on refresh tokens to balance security and usability.

## Creating a New ADR

When making a significant architectural decision:

1. Copy the template above
2. Number it sequentially (e.g., `008-my-decision.md`)
3. Fill in all sections thoroughly
4. Commit alongside the code that implements the decision
5. Update this index

### When to Write an ADR

Write an ADR when:

- Choosing between multiple technical approaches
- Making a decision with long-term consequences
- Adopting a new technology or pattern
- Deviating from established conventions
- Addressing a significant technical constraint

Do not write an ADR for:

- Minor code refactors
- Obvious best practices
- Implementation details that do not affect architecture

## ADR Status Lifecycle

- **Proposed**: Under discussion
- **Accepted**: Decision is approved and implemented
- **Rejected**: Considered but not pursued
- **Deprecated**: No longer relevant (explain why)
- **Superseded**: Replaced by a newer decision (link to new ADR)

## Related Documents

- [System Architecture Overview](../architecture/overview.md)
- [Security Model](../architecture/security.md)
- [Deployment Guide](../runbooks/deployment.md)
