# ADR-002: Single-Origin Deployment Strategy

**Status**: Accepted  
**Date**: 2026-07-27  
**Decision Makers**: BetterLibmanan Team

## Context

In development, the frontend (Vite, port 3000) and backend (Express, port 5000) run on separate ports. This is convenient for development (hot module replacement, separate logs) but raises a question for production deployment:

**Should production serve frontend and backend from the same origin or different origins?**

Options:

1. **Same Origin**: Backend serves the React SPA build alongside the API
2. **Separate Origins**: Frontend deployed to a CDN/static host, backend deployed separately

## Decision

Use **single-origin deployment** in production: the Express.js backend serves both the compiled React SPA and the API from a single port (`5000`).

### How it works

```
http://your-domain.com/          -> Express serves build/frontend/index.html
http://your-domain.com/api/*     -> Express handles API requests
http://your-domain.com/assets/*  -> Express serves static assets (1yr cache)
http://your-domain.com/socket.io -> Socket.IO WebSocket upgrade
http://your-domain.com/health    -> Health check endpoint
```

### Static File Serving Logic

Express uses multiple strategies to detect the frontend dist location:

1. `/app/apps/frontend/dist` -- Docker production (combined Dockerfile)
2. `build/frontend` -- Standard monorepo build output
3. `apps/frontend/dist` -- Docker dev volume mount

The SPA catch-all (`*`) serves `index.html` for all non-asset, non-API routes, enabling client-side routing.

### Lazy Frontend Availability

The `isFrontendAvailable()` check is evaluated at request time, not at startup. This handles container cold-start race conditions where the build directory might not exist yet when the process initializes.

### Runtime Environment Injection

The backend injects `window.__ENV__` into `index.html` at serve time, allowing the frontend to read `VITE_*` environment variables without a rebuild:

```html
<script>
  window.__ENV__ = { VITE_API_URL: "https://..." };
</script>
```

## Consequences

### Positive

- **Zero CORS configuration** in production: frontend and backend share the same origin
- **Simpler deployment**: Deploy one container/process instead of two separate services
- **Reduced infrastructure cost**: Single Render/cloud service instance instead of two
- **No CDN required**: Backend serves assets with long-lived cache headers (`Cache-Control: max-age=31536000, immutable`)
- **Simpler WebSocket setup**: Socket.IO shares the same origin as the API
- **Environment injection**: `VITE_*` vars injected at runtime without rebuild

### Negative

- **Backend restarts affect frontend**: If the backend restarts, frontend assets are briefly unavailable
- **Cannot independently scale frontend**: In a high-traffic scenario, frontend and API cannot be scaled separately
- **More complex Express setup**: Frontend serving logic adds complexity to `app.ts`
- **Not CDN-edge delivered**: Assets aren't served from a global CDN (acceptable for a local government site serving Libmanan residents)

## Alternatives Considered

### Separate Frontend and Backend Origins

**Considered**: Deploy React build to Vercel/Netlify CDN, backend on Render/Railway.

**Rejected because**:

- Requires configuring CORS explicitly and keeping it in sync
- More complex deployment workflow
- Higher cost (two services instead of one)
- WebSocket connections across origins are more complex to configure
- The primary users are Libmanan residents (geographically local, CDN edge benefits are minimal)

### Nginx as Reverse Proxy (Split Architecture)

**Considered**: Run Nginx in front of both Express (API) and Vite (static), routing by path.

**Rejected because**:

- Adds an additional service dependency
- Complicates local development
- The Docker Compose setup does include Nginx for local dev scenarios, but production uses single-origin Express for simplicity

## References

- [Express.js Static Files](https://expressjs.com/en/starter/static-files.html)
- [Render.com Single Dockerfile Deployment](https://render.com/docs/deploy-a-dockerfile)
