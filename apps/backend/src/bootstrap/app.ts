import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { logger } from "@/shared/logger";
import { errorHandler } from "@/shared/middleware/error-handler";
import { requestLogger } from "@/shared/middleware/request-logger";
import { mailer } from "@/shared/mailer";
import { apiRouter } from "@/bootstrap/routes";

const app: express.Express = express();

// =============================================================================
// CONFIGURATION
// =============================================================================

// Determine frontend dist path with clear priority
const getFrontendDistPath = (): string => {
  // Priority order:
  // 1. Docker production path (Render/Docker deployment)
  // 2. Monorepo build directory
  // 3. Local frontend dist (development)

  const possiblePaths = [
    "/app/apps/frontend/dist", // Docker production (combined.Dockerfile)
    path.resolve(process.cwd(), "build/frontend"), // Monorepo build (local/VPS)
    path.resolve(process.cwd(), "apps/frontend/dist"), // Docker dev volume mount
  ];

  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      const indexExists = fs.existsSync(path.join(testPath, "index.html"));
      if (indexExists) {
        logger.info(`[SPA] Selected frontend path: ${testPath}`);
        return testPath;
      }
    }
  }

  // If nothing found, return development path and let validation below handle it
  logger.warn("[SPA] No valid frontend dist found, using development fallback");
  return path.resolve(process.cwd(), "build/frontend");
};

const frontendDistPath = getFrontendDistPath();
const assetsPath = path.join(frontendDistPath, "assets");

// Log configuration on startup
logger.info(`[SPA] ========================================`);
logger.info(`[SPA] Initializing Production SPA Server`);
logger.info(`[SPA] ========================================`);
logger.info(`[SPA] Environment: ${process.env.NODE_ENV}`);
logger.info(`[SPA] Port: ${process.env.PORT || 5000}`);
logger.info(`[SPA] CWD: ${process.cwd()}`);
logger.info(`[SPA] Frontend dist: ${frontendDistPath}`);
logger.info(`[SPA] Assets path: ${assetsPath}`);

// Verify frontend dist exists
const isDevelopment = process.env.NODE_ENV !== "production";
let assetsExists = false;
if (!fs.existsSync(frontendDistPath)) {
  logger.warn(`[SPA] Frontend dist NOT FOUND at: ${frontendDistPath}`);
  logger.warn(
    `[SPA] Application will run in API-only mode - frontend not served!`,
  );
} else {
  const indexExists = fs.existsSync(path.join(frontendDistPath, "index.html"));
  assetsExists = fs.existsSync(assetsPath);

  logger.info(`[SPA] ✓ Frontend dist directory exists`);
  logger.info(`[SPA] ✓ index.html: ${indexExists ? "Found" : "MISSING"}`);
  logger.info(`[SPA] ✓ assets/: ${assetsExists ? "Found" : "MISSING"}`);

  if (!indexExists || !assetsExists) {
    logger.warn(
      `[SPA] Frontend build incomplete - application will run in API-only mode!`,
    );
  }

  // Log sample assets for verification
  if (assetsExists) {
    try {
      const assetFiles = fs.readdirSync(assetsPath);
      const jsFiles = assetFiles.filter((f) => f.endsWith(".js"));
      const cssFiles = assetFiles.filter((f) => f.endsWith(".css"));
      logger.info(
        `[SPA] ✓ Assets: ${jsFiles.length} JS, ${cssFiles.length} CSS`,
      );
    } catch (err) {
      logger.error(`[SPA] Error reading assets:`, err);
    }
  }
}
logger.info(`[SPA] ========================================`);

// =============================================================================
// MIDDLEWARE - SECURITY & PARSING
// =============================================================================

app.set("trust proxy", 1);

// Disable X-Powered-By header
app.disable("x-powered-by");

// Security headers optimized for SPA
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "blob:",
          "data:",
        ],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'", "blob:", "data:"],
        styleSrcElem: ["'self'", "'unsafe-inline'", "blob:", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
        fontSrc: ["'self'", "data:", "blob:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:", "data:"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'", "blob:", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100,
  message: { success: false, message: "Too many requests from this IP" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (skip static assets in production for performance)
app.use((req, res, next) => {
  if (!req.path.startsWith("/assets")) {
    requestLogger(req, res, next);
  } else {
    next();
  }
});

// =============================================================================
// API ROUTES - Must come BEFORE static file serving
// =============================================================================

// Health check with comprehensive frontend verification
app.get("/health", (_req, res) => {
  const frontendExists = fs.existsSync(frontendDistPath);
  const indexExists =
    frontendExists && fs.existsSync(path.join(frontendDistPath, "index.html"));
  const assetsExists = frontendExists && fs.existsSync(assetsPath);

  const status = {
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    },
    frontend: {
      distPath: frontendDistPath,
      assetsPath: assetsPath,
      indexHtml: indexExists,
      assetsDir: assetsExists,
      ready: indexExists && assetsExists,
    },
  };

  res.json(status);
});

// Health error reporting
app.post("/api/health/report", async (req, res) => {
  try {
    const errorDetails = req.body;
    logger.error("[API] Health error reported:", errorDetails);
    await mailer.sendHealthErrorReport(errorDetails);
    res.json({ success: true, message: "Health error report sent" });
  } catch (error) {
    logger.error("[API] Failed to process health error report:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send health error report" });
  }
});

// API routes (must come before SPA static / catch-all)
app.use("/api", apiRouter);

// =============================================================================
// STATIC FILE SERVING - CRITICAL SECTION
// =============================================================================

// Check if frontend is available
const frontendAvailable =
  fs.existsSync(frontendDistPath) &&
  fs.existsSync(path.join(frontendDistPath, "index.html")) &&
  fs.existsSync(assetsPath);

if (frontendAvailable) {
  // MIME type helper - Comprehensive and explicit
  const getMimeType = (filePath: string): string | null => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      // JavaScript
      ".js": "application/javascript; charset=utf-8",
      ".mjs": "application/javascript; charset=utf-8",

      // Stylesheets
      ".css": "text/css; charset=utf-8",

      // Data
      ".json": "application/json; charset=utf-8",
      ".map": "application/json; charset=utf-8",

      // Images
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".ico": "image/x-icon",
      ".avif": "image/avif",

      // Fonts
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".otf": "font/otf",
      ".eot": "application/vnd.ms-fontobject",

      // Other
      ".lottie": "application/json; charset=utf-8",
    };

    return mimeTypes[ext] || null;
  };

  // CRITICAL: Serve /assets/* with explicit MIME types and error handling
  app.use("/assets", (req, res, next) => {
    const filePath = path.join(assetsPath, req.path);

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(assetsPath)) {
      logger.error(
        `[ASSETS] Security: Path traversal attempt blocked: ${req.path}`,
      );
      return res.status(403).type("text/plain").send("Forbidden");
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`[ASSETS] 404: ${req.path} (full path: ${filePath})`);
      return res.status(404).type("text/plain").send("Asset not found");
    }

    // Check if it's a file (not a directory)
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        logger.error(`[ASSETS] Not a file: ${req.path}`);
        return res.status(404).type("text/plain").send("Asset not found");
      }
    } catch (err) {
      logger.error(`[ASSETS] Error checking file ${req.path}:`, err);
      return res.status(500).type("text/plain").send("Failed to load asset");
    }

    // Set MIME type explicitly
    const mimeType = getMimeType(filePath);
    if (mimeType) {
      res.setHeader("Content-Type", mimeType);

      // Security header for JS and CSS
      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".mjs") ||
        filePath.endsWith(".css")
      ) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    } else {
      // Default to binary if unknown type
      res.setHeader("Content-Type", "application/octet-stream");
    }

    // Aggressive caching for content-hashed files
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Log successful asset serves (useful for debugging)
    if (process.env.NODE_ENV === "production") {
      logger.debug(`[ASSETS] ✓ ${req.path} (${mimeType || "unknown"})`);
    }

    // Serve the file
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`[ASSETS] Error serving ${req.path}:`, err);
        if (!res.headersSent) {
          res.status(500).type("text/plain").send("Failed to load asset");
        }
      }
    });
  });

  // Serve other static files (images, fonts, etc.) from root
  app.use((req, res, next) => {
    // Skip index.html and API routes
    if (req.path === "/index.html" || req.path.startsWith("/api")) {
      return next();
    }

    // Check if file exists in dist
    const filePath = path.join(frontendDistPath, req.path);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const mimeType = getMimeType(filePath);
      if (mimeType) {
        res.setHeader("Content-Type", mimeType);
      }

      res.setHeader("Cache-Control", "public, max-age=3600");

      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error(`[STATIC] Error serving ${req.path}:`, err);
          if (!res.headersSent) {
            next();
          }
        } else {
          logger.debug(`[STATIC] ✓ ${req.path}`);
        }
      });
    } else {
      next();
    }
  });

  // =============================================================================
  // SPA CATCH-ALL - Must be LAST
  // =============================================================================

  app.get("*", (req, res) => {
    // If it looks like a static asset that wasn't found, return 404
    if (
      req.path.match(
        /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|otf|eot|webp|avif|map|lottie)$/,
      )
    ) {
      logger.warn(`[SPA] 404 - Asset-like path: ${req.path}`);
      return res.status(404).type("text/plain").send("Not found");
    }

    // Serve index.html for all SPA routes
    const indexPath = path.join(frontendDistPath, "index.html");

    logger.debug(`[SPA] Serving: ${req.path}`);

    res.sendFile(
      indexPath,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
      (err) => {
        if (err) {
          logger.error(`[SPA] Failed to serve index.html:`, err);
          // Send plain text error, NOT JSON
          if (!res.headersSent) {
            res
              .status(500)
              .type("text/plain")
              .send("Failed to load application");
          }
        }
      },
    );
  });
} else {
  // If frontend is not available, just send 404 for non-API routes
  app.get("*", (req, res) => {
    logger.warn(
      `[SPA] Frontend not available - 404 for non-API route: ${req.path}`,
    );
    res.status(404).json({
      success: false,
      message: "Frontend not available - API only mode",
    });
  });
}

// =============================================================================
// ERROR HANDLING - Last middleware
// =============================================================================

// Custom error handler that doesn't interfere with static assets
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    // Errors thrown by our services may carry an explicit HTTP status and a
    // machine-readable reason (e.g. the DPWH proxy uses 502/504 with reasons
    // like 'cloudflare_challenge' or 'upstream_timeout').
    const statusCode =
      (err as any).statusCode && Number.isInteger((err as any).statusCode)
        ? (err as any).statusCode
        : 500;
    const reason = (err as any).reason as string | undefined;

    // Log the error
    logger.error("[ERROR]", {
      message: err.message,
      reason,
      statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    // If headers already sent, delegate to default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // For asset requests, send plain text errors
    if (
      req.path.startsWith("/assets") ||
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)
    ) {
      return res
        .status(statusCode)
        .type("text/plain")
        .send("Internal server error");
    }

    // For API requests, send JSON. Surface the upstream status (e.g. 502/504)
    // and reason so the client and logs aren't stuck guessing.
    if (req.path.startsWith("/api")) {
      return res.status(statusCode).json({
        success: false,
        reason,
        message:
          process.env.NODE_ENV === "production" && statusCode === 500
            ? "Internal server error"
            : err.message,
      });
    }

    // For everything else, send plain text
    res.status(statusCode).type("text/plain").send("Internal server error");
  },
);

export { app };
