import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { logger } from '@/shared/logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import { requestLogger } from '@/shared/middleware/request-logger';
import { mailer } from '@/shared/mailer';

const app: express.Express = express();

// =============================================================================
// CONFIGURATION
// =============================================================================

// Determine frontend dist path
const getFrontendDistPath = (): string => {
  if (process.env.NODE_ENV === 'production') {
    const dockerPath = '/app/apps/frontend/dist';
    if (fs.existsSync(dockerPath)) {
      return dockerPath;
    }
    return path.resolve(__dirname, '../../../frontend/dist');
  }
  return path.resolve(__dirname, '../../../frontend/dist');
};

const frontendDistPath = getFrontendDistPath();

// Log configuration
logger.info(`[SPA] Initializing SPA server`);
logger.info(`[SPA] Environment: ${process.env.NODE_ENV}`);
logger.info(`[SPA] Frontend dist: ${frontendDistPath}`);
logger.info(`[SPA] __dirname: ${__dirname}`);

// Verify frontend dist
if (!fs.existsSync(frontendDistPath)) {
  logger.error(`[SPA] ✗ Frontend dist NOT FOUND at: ${frontendDistPath}`);
  logger.error(`[SPA] Application will not serve frontend properly!`);
} else {
  const indexExists = fs.existsSync(path.join(frontendDistPath, 'index.html'));
  const assetsExists = fs.existsSync(path.join(frontendDistPath, 'assets'));
  logger.info(`[SPA] ✓ Frontend dist exists`);
  logger.info(`[SPA] ✓ index.html: ${indexExists}`);
  logger.info(`[SPA] ✓ assets/: ${assetsExists}`);
}

// =============================================================================
// MIDDLEWARE - SECURITY & PARSING
// =============================================================================

app.set('trust proxy', 1);

// Security headers for SPA
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'", "blob:", "data:"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "blob:", "data:"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      fontSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'blob:', 'data:'],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", 'blob:', 'data:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// =============================================================================
// API ROUTES - Before static file serving
// =============================================================================

// Health check with frontend verification
app.get('/health', (_req, res) => {
  const indexExists = fs.existsSync(path.join(frontendDistPath, 'index.html'));
  const assetsExists = fs.existsSync(path.join(frontendDistPath, 'assets'));
  
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontend: {
      distPath: frontendDistPath,
      indexHtml: indexExists,
      assetsDir: assetsExists
    }
  });
});

// Health error reporting
app.post('/api/health/report', async (req, res) => {
  try {
    const errorDetails = req.body;
    logger.error('[API] Health error reported:', errorDetails);
    await mailer.sendHealthErrorReport(errorDetails);
    res.json({ success: true, message: 'Health error report sent' });
  } catch (error) {
    logger.error('[API] Failed to process health error report:', error);
    res.status(500).json({ success: false, message: 'Failed to send health error report' });
  }
});

// API placeholder
app.use('/api', (_req, res) => {
  res.json({ success: true, message: 'API coming soon' });
});

// =============================================================================
// STATIC FILE SERVING - SPA Assets
// =============================================================================

// Helper function to set MIME types
const setMimeType = (res: express.Response, filePath: string): void => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.lottie': 'application/json'
  };

  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
    
    // Add security header for JS and CSS
    if (ext === '.js' || ext === '.mjs' || ext === '.css') {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
};

// Serve /assets directory with aggressive caching (content-hashed files)
app.use('/assets', express.static(path.join(frontendDistPath, 'assets'), {
  setHeaders: (res, filePath) => {
    logger.debug(`[ASSETS] ${path.basename(filePath)}`);
    setMimeType(res, filePath);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
  fallthrough: false, // Don't continue to next middleware if asset not found
  index: false,
  etag: true,
  lastModified: true
}));

// Serve other static files (images, fonts, etc.) with moderate caching
app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    const fileName = path.basename(filePath);
    
    // Don't serve index.html here - it's handled by SPA catch-all
    if (fileName === 'index.html') {
      return;
    }
    
    logger.debug(`[STATIC] ${fileName}`);
    setMimeType(res, filePath);
    
    // Shorter cache for non-hashed assets
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
  fallthrough: true,
  index: false, // Don't auto-serve index.html
  etag: true,
  lastModified: true
}));

// =============================================================================
// SPA ROUTING - Catch-all for client-side routing
// =============================================================================

app.get('*', (req, res) => {
  // If request looks like a static asset that wasn't found, return 404
  if (req.path.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|webp|avif|map|lottie)$/)) {
    logger.warn(`[SPA] Asset not found: ${req.path}`);
    return res.status(404).type('text/plain').send('Asset not found');
  }
  
  // Serve index.html for all SPA routes
  const indexPath = path.join(frontendDistPath, 'index.html');
  
  logger.debug(`[SPA] Serving route: ${req.path}`);
  
  res.sendFile(indexPath, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  }, (err) => {
    if (err) {
      logger.error(`[SPA] Failed to serve index.html:`, err);
      res.status(500).type('text/plain').send('Failed to load application');
    }
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use(errorHandler);

export { app };
