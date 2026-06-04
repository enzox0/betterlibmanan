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
// __dirname in compiled code: /app/apps/backend/dist
// Absolute path approach to avoid any path resolution issues
const frontendDistPath = process.env.NODE_ENV === 'production' 
  ? '/app/apps/frontend/dist'
  : path.join(__dirname, '../../frontend/dist');
  
logger.info(`[APP] __dirname: ${__dirname}`);
logger.info(`[APP] NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`[APP] Frontend dist path: ${frontendDistPath}`);

// Check if frontend dist exists
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  logger.info(`[APP] ✓ Frontend dist directory exists`);
  try {
    const files = fs.readdirSync(frontendDistPath);
    logger.info(`[APP] Frontend dist contains ${files.length} items: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
  } catch (err) {
    logger.error(`[APP] Error reading frontend dist:`, err);
  }
} else {
  logger.error(`[APP] ✗ Frontend dist directory NOT FOUND at: ${frontendDistPath}`);
}

// Serve static files with proper MIME types and fallback prevention
app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    } else if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
    // Add cache control for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  },
  fallthrough: true, // Allow next middleware to handle 404s
  index: false // Don't serve index.html automatically
}));

// Catch-all route: serve index.html for React SPA
// Only for non-API routes and non-static-file requests
app.get('*', (req, res, next) => {
  // Don't handle API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Don't handle static asset extensions - let them 404
  if (req.path.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|webp|avif|map)$/)) {
    logger.warn(`Static asset not found: ${req.path}`);
    return res.status(404).send('Not found');
  }
  
  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html:', err);
      res.status(500).send('Failed to load application');
    }
  });
});

// Error handler
app.use(errorHandler);

export { app };
