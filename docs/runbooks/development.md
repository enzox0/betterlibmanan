# Development Workflow

Everything you need to start contributing to BetterLibmanan.

## Prerequisites

| Tool    | Version    | Purpose              |
| ------- | ---------- | -------------------- |
| Node.js | `>=18.0.0` | JavaScript runtime   |
| pnpm    | `>=8.0.0`  | Package manager      |
| Git     | Any        | Version control      |
| Docker  | Optional   | Service dependencies |

### Install pnpm

```bash
npm install -g pnpm@9.15.9
```

## Initial Setup

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR-USERNAME/betterlibmanan.git
cd betterlibmanan

# Add upstream remote
git remote add upstream https://github.com/enzox0/betterlibmanan.git
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all workspace dependencies (root, apps, packages) in one command.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your local settings. At minimum, set:

```dotenv
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/betterlibmanan
JWT_ACCESS_SECRET=dev-access-secret-change-in-prod
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-prod
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Development Services

**Option A: Start All Together**

```bash
pnpm run dev
```

This starts the frontend, backend, and worker using a custom orchestrator script.

**Option B: Start Individually**

```bash
# Terminal 1 -- Frontend (http://localhost:3000)
pnpm run dev:frontend

# Terminal 2 -- Backend (http://localhost:5000)
pnpm run dev:backend

# Terminal 3 -- Worker
pnpm run dev:worker
```

**Option C: With Docker for Services**

```bash
# Start MongoDB and Redis
docker-compose up mongodb redis -d

# Then start apps
pnpm run dev
```

## Development URLs

| Service  | URL                            | Description              |
| -------- | ------------------------------ | ------------------------ |
| Frontend | `http://localhost:3000`        | Vite dev server with HMR |
| Backend  | `http://localhost:5000`        | Express API (tsx watch)  |
| API Root | `http://localhost:5000/api`    | API health check         |
| Health   | `http://localhost:5000/health` | System health            |
| MongoDB  | `mongodb://localhost:27017`    | Database                 |

## Project Scripts

### Root-level Scripts

| Script        | Command                | Description                   |
| ------------- | ---------------------- | ----------------------------- |
| `dev`         | `pnpm run dev`         | Start all development servers |
| `build`       | `pnpm run build`       | Build all apps for production |
| `build:prod`  | `pnpm run build:prod`  | Force build (no cache)        |
| `test`        | `pnpm run test`        | Run all tests                 |
| `lint`        | `pnpm run lint`        | Lint all packages             |
| `format`      | `pnpm run format`      | Format with Prettier          |
| `typecheck`   | `pnpm run typecheck`   | TypeScript type checking      |
| `clean`       | `pnpm run clean`       | Remove build artifacts        |
| `db:seed`     | `pnpm run seed`        | Seed admin account            |
| `docker:up`   | `pnpm run docker:up`   | Start Docker services         |
| `docker:down` | `pnpm run docker:down` | Stop Docker services          |

### Backend-specific Scripts

```bash
# In apps/backend/
pnpm --filter @betterlibmanan/backend run dev
pnpm --filter @betterlibmanan/backend run build
pnpm --filter @betterlibmanan/backend run typecheck
pnpm --filter @betterlibmanan/backend run seed
```

### Frontend-specific Scripts

```bash
# In apps/frontend/
pnpm --filter @betterlibmanan/frontend run dev
pnpm --filter @betterlibmanan/frontend run build
pnpm --filter @betterlibmanan/frontend run test
pnpm --filter @betterlibmanan/frontend run typecheck
```

## Project Structure

```
betterlibmanan/
+-- apps/
|   +-- frontend/              # React + Vite SPA
|   |   +-- src/
|   |       +-- app/           # App bootstrap, router, providers, shell
|   |       +-- modules/       # Feature modules (each has its own pages)
|   |       +-- shared/        # Shared UI components, hooks, utilities
|   |       +-- api/           # API client functions
|   |       +-- context/       # React context providers
|   |       +-- hooks/         # Global custom hooks
|   |       +-- lib/           # Third-party library wrappers
|   |       +-- types/         # Frontend-specific TypeScript types
|   |       +-- styles/        # Global styles
|   +-- backend/               # Express.js API
|   |   +-- src/
|   |       +-- bootstrap/     # App and server initialization
|   |       +-- gateway/       # HTTP, REST, WebSocket gateways
|   |       +-- modules/       # Domain feature modules
|   |       +-- infrastructure/# Database, storage, messaging
|   |       +-- shared/        # Shared middleware, utilities
|   +-- worker/                # Background worker
|       +-- src/
|           +-- jobs/          # Job definitions
|           +-- queues/        # Queue configurations
|           +-- schedulers/    # Scheduled job definitions
|           +-- processors/    # Job processors
|           +-- shared/        # Worker utilities
+-- packages/
|   +-- types/                 # Shared TypeScript types
|   +-- utils/                 # Shared utilities
|   +-- ui-kit/                # Shared React components
|   +-- sdk/                   # API client SDK
|   +-- eslint-config/         # ESLint configuration
|   +-- tsconfig/              # TypeScript configurations
+-- infrastructure/            # Docker, K8s, Terraform, etc.
+-- docs/                      # Documentation (this directory)
+-- scripts/                   # Build and utility scripts
+-- tools/                     # Code generators and automation
```

## Adding a New Backend Module

### 1. Create the Module Directory

```bash
mkdir apps/backend/src/modules/my-feature
```

### 2. Create Module Files

**Model** (`my-feature.model.ts`):

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface IMyFeature extends Document {
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const myFeatureSchema = new Schema<IMyFeature>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MyFeatureModel = mongoose.model<IMyFeature>(
  "MyFeature",
  myFeatureSchema,
);
```

**Service** (`my-feature.service.ts`):

```typescript
import { MyFeatureModel, IMyFeature } from "./my-feature.model";

export const getAll = async () => {
  return MyFeatureModel.find({ isActive: true }).lean();
};

export const create = async (data: Partial<IMyFeature>) => {
  return MyFeatureModel.create(data);
};
```

**Controller** (`my-feature.controller.ts`):

```typescript
import { Request, Response, NextFunction } from "express";
import * as service from "./my-feature.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
```

**Routes** (`my-feature.routes.ts`):

```typescript
import { Router } from "express";
import { getAll } from "./my-feature.controller";
import { requireAuth } from "@/modules/auth/auth.middleware";

export const myFeatureRouter = Router();

myFeatureRouter.get("/", getAll);
myFeatureRouter.post("/", requireAuth /* createHandler */);
```

**Module Export** (`index.ts`):

```typescript
export { myFeatureRouter } from "./my-feature.routes";
```

### 3. Register in Central Router

In `apps/backend/src/bootstrap/routes.ts`:

```typescript
import { myFeatureRouter } from "@/modules/my-feature";

apiRouter.use("/my-feature", myFeatureRouter);
```

## Adding a New Frontend Module

### 1. Create the Module Directory

```bash
mkdir -p apps/frontend/src/modules/my-feature/{pages,components,hooks}
```

### 2. Create Module Files

**Page Component**:

```typescript
// apps/frontend/src/modules/my-feature/pages/MyFeaturePage.tsx
import React from 'react';
import { useMyFeature } from '../hooks/useMyFeature';

export function MyFeaturePage() {
  const { data, isLoading } = useMyFeature();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Feature</h1>
      {/* Content */}
    </div>
  );
}
```

**Data Hook**:

```typescript
// apps/frontend/src/modules/my-feature/hooks/useMyFeature.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMyFeature() {
  return useQuery({
    queryKey: ["my-feature"],
    queryFn: () => api.get("/my-feature").then((r) => r.data.data),
  });
}
```

### 3. Register Route

In `apps/frontend/src/app/router/index.tsx`:

```typescript
import { MyFeaturePage } from '@/modules/my-feature/pages/MyFeaturePage';

// Add to route definitions
{ path: '/my-feature', element: <MyFeaturePage /> }
```

## Git Hooks

The project uses git hooks via `.githooks/`:

- `pre-commit` -- Runs linting and type checks
- `commit-msg` -- Enforces conventional commit format
- `pre-push` -- Runs tests

Install hooks (done automatically via `pnpm install`):

```bash
pnpm run hooks:install
```

Uninstall hooks:

```bash
pnpm run hooks:uninstall
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`

**Examples**:

```
feat(tourism): add map integration to tourism page
fix(auth): correct token expiry calculation
docs(api): update authentication endpoint reference
chore(deps): bump express from 4.18.2 to 4.19.0
```

## Code Style

### TypeScript

- All code is TypeScript with strict mode enabled
- Use explicit return types for exported functions
- Avoid `any` -- use proper types or `unknown`
- Use `z.infer<typeof Schema>` for Zod-inferred types

### React

- Functional components only (no class components)
- Custom hooks for data fetching and business logic
- Avoid prop drilling -- use context or state management
- Keep components focused (single responsibility)

### Backend

- All business logic in services (not controllers)
- Controllers only handle HTTP concerns (parsing, responding)
- Throw errors with `statusCode` for HTTP-aware error handling
- Always `next(err)` for unhandled errors in controllers

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefix with `use`)
- Utilities: `camelCase.ts`
- Models/types: `camelCase.ts`
- Route files: `name.routes.ts`
- Service files: `name.service.ts`
- Controller files: `name.controller.ts`

## Running Tests

```bash
# All tests
pnpm run test

# Frontend tests only (uses Vitest)
pnpm --filter @betterlibmanan/frontend run test

# With coverage
pnpm --filter @betterlibmanan/frontend run test:coverage

# Single run (no watch mode)
pnpm --filter @betterlibmanan/frontend run test -- --run
```

## TypeScript

```bash
# Check all packages
pnpm run typecheck

# Check specific package
pnpm --filter @betterlibmanan/backend run typecheck
```

## Debugging

### Backend

The backend uses `tsx watch` in development, so it restarts on file changes. Logs are output to console and `logs/` directory.

Use `winston` logger:

```typescript
import { logger } from "@/shared/logger";

logger.info("Something happened", { context: "data" });
logger.error("Something went wrong", error);
```

### Frontend

- React DevTools browser extension
- React Query DevTools panel (available in development)
- Zustand DevTools (Redux DevTools extension)
- Check browser Network tab for API calls

## Related Documents

- [Contributing Guide](../../CONTRIBUTING.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)
- [Deployment Guide](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
