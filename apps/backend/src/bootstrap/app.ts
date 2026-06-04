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

// Security middleware with CSP configured for SPA
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
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
logger.info(`[APP] Frontend dist path: ${frontendDistPath}`);

// Serve static files with proper MIME types
app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Catch-all route: serve index.html for React SPA
// Only for non-API routes and non-static-file requests
app.get('*', (req, res) => {
  // Don't handle API routes or static asset requests
  if (req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/)) {
    return res.status(404).send('Not found');
  }
  
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
