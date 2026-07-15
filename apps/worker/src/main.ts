import dns from "dns";
// Override DNS servers to bypass local resolver issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import axios from "axios";
import { config } from "./shared/config/index.js";
import { logger } from "./shared/logger/index.js";
import { mailer } from "./shared/mailer/index.js";

let reportedError = false;

async function checkHealth() {
  const healthEndpoint = `${config.app.internalApiUrl}/health`;
  logger.info("Checking backend health...", {
    endpoint: healthEndpoint,
  });
  try {
    const response = await axios.get(healthEndpoint);
    logger.info("Backend health check passed", response.data);
    reportedError = false;
  } catch (error: any) {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      status: error.response?.status || "unknown",
      statusText: error.response?.statusText || error.message,
      url: healthEndpoint,
      error: error.message,
    };
    logger.error("Backend health check failed", errorDetails);

    if (!reportedError) {
      try {
        await mailer.sendHealthErrorReport(errorDetails);
        reportedError = true;
      } catch (reportError) {
        logger.error("Failed to send health error report:", reportError);
      }
    }
  }
}

const intervalMs = config.health.checkIntervalMinutes * 60 * 1000;
logger.info("BetterLibmanan Worker started", {
  healthCheckIntervalMinutes: config.health.checkIntervalMinutes,
  healthCheckIntervalMs: intervalMs,
});
checkHealth();
setInterval(checkHealth, intervalMs);
