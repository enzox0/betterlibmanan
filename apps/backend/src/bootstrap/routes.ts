import { Router } from "express";
import { dpwhProxyRouter } from "@/modules/dpwh-proxy";
import { authRouter } from "@/modules/auth/auth.module";
import { freedomWallRouter } from "@/modules/freedom-wall";
import { accountsRouter } from "@/modules/accounts";
import { auditRouter } from "@/modules/audit";

/**
 * Central API router. Mount feature routers here as the backend grows so
 * `app.ts` only has to deal with global middleware and the SPA catch-all.
 */
export const apiRouter: Router = Router();

// Quick reachability probe for `/api`
apiRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "API ready", version: "1.0.0" });
});

// Admin auth — login, refresh, logout, /me
apiRouter.use("/auth", authRouter);

// Account management — superadmin only
apiRouter.use("/accounts", accountsRouter);

// Audit logs — superadmin only
apiRouter.use("/audit", auditRouter);

// DPWH transparency proxy — bypasses the upstream's CORS restriction
apiRouter.use("/dpwh", dpwhProxyRouter);

// Freedom Wall — anonymous public sticky notes
apiRouter.use("/freedom-wall", freedomWallRouter);

// Fallback for unmatched /api routes — keeps the SPA catch-all from
// accidentally serving index.html for unknown API paths.
apiRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});
