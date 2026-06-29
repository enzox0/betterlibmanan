import { Router } from "express";
import { dpwhProxyRouter } from "@/modules/dpwh-proxy";
import { authRouter } from "@/modules/auth/auth.module";
import { freedomWallRouter } from "@/modules/freedom-wall";
import { accountsRouter } from "@/modules/accounts";
import { auditRouter } from "@/modules/audit";
import { betterLugsRouter } from "@/modules/better-lugs";
import { barangayMapRouter } from "@/modules/barangay-map";
import { popularServicesRouter } from "@/modules/popular-services";
import { atAGlanceRouter } from "@/modules/at-a-glance";
import { historyRouter } from "@/modules/history";
import { latestUpdatesRouter } from "@/modules/latest-updates";
import { leadershipRouter } from "@/modules/leadership";
import { contactRouter } from "@/modules/contact";
import { quizRouter } from "@/modules/quiz";
import { emergencyContactsRouter } from "@/modules/emergency-contacts";
import { marqueeImagesRouter } from "@/modules/marquee-images";
import { municipalHallRouter } from "@/modules/municipal-hall";
import { communityRouter } from "@/modules/community";
import { userRouter } from "@/modules/users";
import { proxyImage } from "@/modules/files/image-proxy.controller";

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

// Better LUGs — public listing plus admin CRUD + R2 uploads
apiRouter.use("/better-lugs", betterLugsRouter);

// Barangay Map — public listing plus admin CRUD + R2 uploads
apiRouter.use("/barangay-map", barangayMapRouter);

// Popular Services — public listing plus admin CRUD + R2 uploads
apiRouter.use("/popular-services", popularServicesRouter);

// At a Glance — public listing plus admin CRUD
apiRouter.use("/at-a-glance", atAGlanceRouter);

// History — public listing plus admin CRUD
apiRouter.use("/history", historyRouter);

// Latest Updates — public listing plus admin CRUD
apiRouter.use("/latest-updates", latestUpdatesRouter);

// Leadership — public listing plus admin CRUD + R2 avatar uploads
apiRouter.use("/leadership", leadershipRouter);

// Contact — public listing plus admin CRUD
apiRouter.use("/contact", contactRouter);

// Quiz — public listing plus admin CRUD
apiRouter.use("/quiz", quizRouter);

// Emergency Contacts — public listing plus admin CRUD
apiRouter.use("/emergency-contacts", emergencyContactsRouter);

// Marquee Images — public listing plus admin CRUD + R2 uploads + reorder
apiRouter.use("/marquee-images", marqueeImagesRouter);

// Municipal Hall — single-record content for the WeatherMapSection info panel
apiRouter.use("/municipal-hall", municipalHallRouter);

// Community — discussions, peer groups, featured event
apiRouter.use("/community", communityRouter);

// Public user auth — register, login, profile
apiRouter.use("/users", userRouter);

// Image Proxy — proxies images (especially R2) using Node.js DNS overrides
apiRouter.get("/properties/image-proxy", proxyImage);

// Fallback for unmatched /api routes — keeps the SPA catch-all from
// accidentally serving index.html for unknown API paths.
apiRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});
