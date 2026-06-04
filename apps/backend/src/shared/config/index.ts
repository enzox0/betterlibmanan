import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
// When compiled, __dirname is in dist folder, so we need to go up more levels
// From apps/backend/dist/shared/config → go up 5 folders to reach project root
const envPath = path.resolve(__dirname, '../../../../../.env');
console.log('[Backend Config] Loading env from:', envPath);
dotenv.config({ path: envPath });
console.log('[Backend Config] SMTP_HOST:', process.env.SMTP_HOST);

export const config = {
  app: {
    name: process.env.APP_NAME || 'BetterLibmanan',
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0'
  },
  health: {
    checkIntervalMinutes: parseInt(process.env.HEALTH_CHECK_INTERVAL_MINUTES || '3', 10)
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
    from: process.env.MAIL_FROM || 'noreply@betterlibmanan.gov.ph'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@betterlibmanan.gov.ph'
  }
};
