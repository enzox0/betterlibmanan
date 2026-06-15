import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleLogin, handleRefresh, handleLogout, handleLogoutAll, handleMe } from './auth.controller';
import { requireAuth } from './auth.middleware';

export const authRouter: Router = Router();

/**
 * Strict rate-limit for login — prevent brute-force attacks.
 * 10 attempts per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
});

/**
 * Moderate rate-limit for token refresh.
 * 30 requests per 15 minutes per IP.
 */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many refresh requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
authRouter.post('/login', loginLimiter, handleLogin);
authRouter.post('/refresh', refreshLimiter, handleRefresh);

// Protected routes (require valid access token)
authRouter.post('/logout', requireAuth, handleLogout);
authRouter.post('/logout-all', requireAuth, handleLogoutAll);
authRouter.get('/me', requireAuth, handleMe);
