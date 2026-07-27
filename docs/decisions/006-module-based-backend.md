# ADR-006: Module-Based Backend Architecture

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

The backend has 30+ distinct feature domains: `auth`, `tourism`, `leadership`, `legislative`, `transparency`, `freedom-wall`, `community`, `quiz`, `statistics`, `services`, etc.

We needed to decide how to organize this code to keep it maintainable as it grows.

Options:

1. **Technical layers**: `controllers/`, `services/`, `models/` at the top level -- all controllers in one directory, all services in another
2. **Domain modules**: `modules/<feature>/` -- each feature bundles its controller, service, model, and routes together
3. **Hybrid**: Some combination of the above

## Decision

Use a **module-based (domain-driven) organization**:

```
apps/backend/src/modules/
+-- auth/
|   +-- admin.model.ts
|   +-- refresh-token.model.ts
|   +-- auth.service.ts
|   +-- auth.controller.ts
|   +-- auth.middleware.ts
|   +-- auth.routes.ts
|   +-- auth.module.ts    (index/exports)
+-- tourism/
|   +-- tourism.model.ts
|   +-- tourism.service.ts
|   +-- tourism.controller.ts
|   +-- tourism.routes.ts
|   +-- index.ts
+-- ...
```

Each module:

- Has a single, clearly named directory
- Contains all code related to that domain
- Is registered in the central router (`bootstrap/routes.ts`)
- Exports only its router (and optionally its service for cross-module usage)

### File Naming Convention

| File                             | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `<name>.model.ts`                | Mongoose schema and TypeScript interface |
| `<name>.service.ts`              | Business logic (pure functions, no HTTP) |
| `<name>.controller.ts`           | HTTP request/response handling           |
| `<name>.middleware.ts`           | Module-specific Express middleware       |
| `<name>.routes.ts`               | Express Router with endpoint definitions |
| `<name>.module.ts` or `index.ts` | Module barrel exports                    |

### Layer Responsibilities

**Service Layer** -- Business logic only:

- Database operations
- Data transformation
- External API calls
- Should have no knowledge of HTTP (no `Request`, `Response`)
- Should throw typed errors with `statusCode` for HTTP-aware error handling

**Controller Layer** -- HTTP concerns only:

- Parse and validate request body/query/params (Zod)
- Call service functions
- Format and send responses
- Call `next(err)` for unhandled errors
- No business logic

**Model Layer** -- Data schema:

- Mongoose schema definitions
- TypeScript interfaces
- Index definitions
- Pre/post hooks (e.g., password hashing)

### Cross-Module Dependencies

Modules may import from each other's services when needed:

```typescript
// audit module used by auth module
import { writeAuditLog } from "@/modules/audit/audit.service";
```

This is acceptable for utility-style services like `audit`. For complex cross-module interactions, consider extracting shared logic to `shared/`.

## Consequences

### Positive

- **High cohesion**: All code for a feature is co-located -- easy to find and understand
- **Low coupling**: Modules are self-contained and can be worked on independently
- **Scalable team**: Different developers can own different modules without frequent merge conflicts
- **Easy to add**: Adding a new feature means adding a new directory with consistent file structure
- **Easy to delete**: Removing a deprecated feature means deleting a directory and its route registration
- **Clear ownership**: Each module's purpose is immediately obvious from its directory name

### Negative

- **No forced architecture enforcement**: Developers can still put business logic in controllers if they're not disciplined
- **Cross-module imports**: Dependencies between modules must be managed carefully to avoid circular imports
- **Boilerplate**: Every new module requires creating 5+ files with similar structure (mitigated by code generators in `tools/generators/`)

## Alternatives Considered

### Technical Layers (Horizontal Slicing)

**Structure**:

```
src/
+-- controllers/
|   +-- auth.controller.ts
|   +-- tourism.controller.ts
|   +-- ...
+-- services/
|   +-- auth.service.ts
|   +-- tourism.service.ts
|   +-- ...
+-- models/
    +-- admin.model.ts
    +-- ...
```

**Rejected because**:

- With 30+ modules, each `controllers/` and `services/` directory becomes very large
- Context-switching between layers when working on a single feature requires navigating across multiple directories
- Doesn't scale well: adding a new feature requires touching multiple top-level directories

### NestJS Framework

**Considered**: NestJS enforces module-based architecture by design, with decorators and dependency injection.

**Not chosen because**:

- Adds significant framework complexity and learning curve
- Heavyweight for the current scale of the project
- The team has stronger Express.js experience
- NestJS's opinionated structure would require significant refactoring

## References

- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
