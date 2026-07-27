# ADR-001: Monorepo Architecture with Turborepo

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

BetterLibmanan consists of multiple interconnected applications:

- A React SPA frontend
- An Express.js backend API
- A background worker process

Additionally, the project needed shared code: TypeScript types, utility functions, UI components, an API client SDK, and configuration presets (ESLint, TypeScript).

We needed to decide whether to maintain these as:

1. A single monolithic repository (monorepo)
2. Multiple separate repositories (polyrepo)

The team also needed a build orchestration tool to manage dependencies between these packages and cache builds for efficiency.

## Decision

Use **Turborepo** as the build orchestration tool within a **pnpm workspace monorepo**.

Package manager: **pnpm** (for workspace support and efficient `node_modules` linking)  
Monorepo tool: **Turborepo** (for parallel builds, dependency graphs, and remote caching)

### Repository Layout

```
betterlibmanan/
+-- apps/
|   +-- frontend/   @betterlibmanan/frontend
|   +-- backend/    @betterlibmanan/backend
|   +-- worker/     @betterlibmanan/worker
+-- packages/
    +-- types/      @betterlibmanan/types
    +-- utils/      @betterlibmanan/utils
    +-- ui-kit/     @betterlibmanan/ui-kit
    +-- sdk/        @betterlibmanan/sdk
    +-- eslint-config/
    +-- tsconfig/
```

## Consequences

### Positive

- **Atomic changes**: A change to a shared type can be made alongside the frontend and backend changes that depend on it, in a single commit
- **Shared code reuse**: Types, utilities, and components are version-consistent across all apps
- **Build caching**: Turborepo's local (and optional remote) caching means unchanged packages are not rebuilt
- **Parallel execution**: Turborepo builds packages in dependency order, running independent tasks in parallel
- **Single install**: `pnpm install` installs all dependencies for all workspaces
- **Unified tooling**: Single ESLint config, TypeScript config, and Prettier config for all packages
- **Consistent versioning**: All packages share the same version, preventing version drift

### Negative

- **Larger repository**: All code in one repo means larger clone size
- **Learning curve**: Developers unfamiliar with monorepos need to learn workspace concepts
- **Slower CI on large changes**: Changes that affect many packages rebuild more of the graph

## Alternatives Considered

### Polyrepo (Separate Repositories)

**Rejected because**:

- Coordinating changes across repos is painful (e.g., update types in `types-repo`, publish to npm, update version in `frontend-repo` and `backend-repo`)
- No easy way to guarantee type consistency between frontend and backend without a registry
- More complex CI/CD setup per repo
- Developer friction for context-switching across repos

### Nx (Alternative Monorepo Tool)

**Considered but not chosen**:

- Nx is more opinionated and complex than Turborepo
- Turborepo integrates better with Vite-based projects
- Turborepo's configuration is simpler for the project's current scale
- Turborepo is lighter-weight and easier to adopt

### Lerna (Legacy Monorepo Tool)

**Not considered**:

- Lerna's primary use case is publishing packages to npm registries
- BetterLibmanan is a private application, not a library distribution
- Turborepo + pnpm workspaces cover all needed functionality

## References

- [Turborepo Documentation](https://turbo.build/repo)
- [pnpm Workspaces](https://pnpm.io/workspaces)
