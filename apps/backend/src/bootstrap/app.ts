import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { logger } from '@/shared/logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import { requestLogger } from '@/shared/middleware/request-logger';
import { mailer } from '@/shared/mailer';

const app: express.Express = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware with CSP configured for SPA and Vite
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

// CORS
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
  message: {
    success: false,
    message: 'Too many requests from this IP'
  }
});
app.use(limiter);

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Health error report endpoint
app.post('/api/health/report', async (req, res) => {
  try {
    const errorDetails = req.body;
    logger.error('Health check error reported:', errorDetails);
    await mailer.sendHealthErrorReport(errorDetails);
    res.json({
      success: true,
      message: 'Health error report sent'
    });
  } catch (error) {
    logger.error('Failed to process health error report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send health error report'
    });
  }
});

// API routes
app.use('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Coming soon'
  });
});

// Serve frontend static files
// In production Docker: /app/apps/frontend/dist
// __dirname in compiled code: /app/apps/backend/dist/bootstrap (Docker) or local path (Windows)
const fs = require('fs');

// Determine frontend dist path based on environment
let frontendDistPath: string;
if (process.env.NODE_ENV === 'production') {
  // Try Docker path first
  const dockerPath = '/app/apps/frontend/dist';
  if (fs.existsSync(dockerPath)) {
    frontendDistPath = dockerPath;
  } else {
    // Fallback to relative path for Windows production
    frontendDistPath = path.resolve(__dirname, '../../../frontend/dist');
  }
} else {
  // Development mode
  frontendDistPath = path.resolve(__dirname, '../../../frontend/dist');
}
  
logger.info(`[APP] __dirname: ${__dirname}`);
logger.info(`[APP] NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`[APP] Frontend dist path: ${frontendDistPath}`);

// Check if frontend dist exists
if (fs.existsSync(frontendDistPath)) {
  logger.info(`[APP] ✓ Frontend dist directory exists`);
  try {
    const files = fs.readdirSync(frontendDistPath);
    logger.info(`[APP] Frontend dist contains ${files.length} items: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
    
    // Check for critical files
    const indexExists = fs.existsSync(path.join(frontendDistPath, 'index.html'));
    const assetsExists = fs.existsSync(path.join(frontendDistPath, 'assets'));
    logger.info(`[APP] index.html exists: ${indexExists}`);
    logger.info(`[APP] assets/ exists: ${assetsExists}`);
    
    if (assetsExists) {
      const assetFiles = fs.readdirSync(path.join(frontendDistPath, 'assets'));
      logger.info(`[APP] Assets directory contains ${assetFiles.length} files`);
      logger.info(`[APP] Sample assets: ${assetFiles.slice(0, 5).join(', ')}`);
    }
  } catch (err) {
    logger.error(`[APP] Error reading frontend dist:`, err);
  }
} else {
  logger.error(`[APP] ✗ Frontend dist directory NOT FOUND at: ${frontendDistPath}`);
}

// Serve static files with explicit MIME types
app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    // Log every static file request for debugging
    logger.debug(`[STATIC] Serving: ${filePath}`);
    
    // Force correct MIME types - critical for modules
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.js' || ext === '.mjs') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    } else if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    } else if (ext === '.json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    } else if (ext === '.woff') {
      res.setHeader('Content-Type', 'font/woff');
    } else if (ext === '.woff2') {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (ext === '.ico') {
      res.setHeader('Content-Type', 'image/x-icon');
    } else if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (ext === '.lottie') {
      res.setHeader('Content-Type', 'application/json');
    }
    
    // Cache control for assets
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  },
  fallthrough: true,
  index: false,
  etag: true,
  lastModified: true,
  redirect: false
}));

// Catch-all route: serve index.html for React SPA
app.get('*', (req, res, next) => {
  // Don't handle API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Log all requests that reach here
  logger.debug(`[CATCHALL] Request for: ${req.path}`);
  
  // Don't handle static asset extensions - return 404
  if (req.path.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|webp|avif|map)$/)) {
    logger.warn(`[CATCHALL] Static asset not found: ${req.path}`);
    return res.status(404).type('text/plain').send('Asset not found');
  }
  
  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(frontendDistPath, 'index.html');
  logger.debug(`[CATCHALL] Serving index.html from: ${indexPath}`);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('[CATCHALL] Error serving index.html:', err);
      res.status(500).type('text/plain').send('Failed to load application');
    }
  });
});

// Error handler
app.use(errorHandler);

export { app };
