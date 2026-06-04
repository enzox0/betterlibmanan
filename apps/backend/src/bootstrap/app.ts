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

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
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
const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all route: serve index.html for React SPA
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath);
});

// Error handler
app.use(errorHandler);

export { app };
