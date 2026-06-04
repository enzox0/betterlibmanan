import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
// From apps/worker/src → go up 3 folders: src → worker → apps → root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import axios from 'axios';
import { config } from './shared/config';
import { logger } from './shared/logger';
import { mailer } from './shared/mailer';

let reportedError = false;

async function checkHealth() {
  logger.info('Checking backend health...', { endpoint: `${config.app.apiUrl}/health` });
  try {
    const response = await axios.get(`${config.app.apiUrl}/health`);
    logger.info('Backend health check passed', response.data);
    reportedError = false;
  } catch (error: any) {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      status: error.response?.status || 'unknown',
      statusText: error.response?.statusText || error.message,
      url: `${config.app.apiUrl}/health`,
      error: error.message
    };
    logger.error('Backend health check failed', errorDetails);
    
    if (!reportedError) {
      try {
        await mailer.sendHealthErrorReport(errorDetails);
        reportedError = true;
      } catch (reportError) {
        logger.error('Failed to send health error report:', reportError);
      }
    }
  }
}

const intervalMs = config.health.checkIntervalMinutes * 60 * 1000;
logger.info('BetterLibmanan Worker started', {
  healthCheckIntervalMinutes: config.health.checkIntervalMinutes,
  healthCheckIntervalMs: intervalMs
});
checkHealth();
setInterval(checkHealth, intervalMs);
