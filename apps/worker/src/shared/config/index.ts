import dotenv from "dotenv";
import path from "path";
import { logger } from "../logger";

// Load .env files from project root in order of precedence
// Precedence: .env.<NODE_ENV>.local > .env.<NODE_ENV> > .env.local > .env
//
// Use DOTENV_CONFIG_PATH if provided by dev script, otherwise use process.cwd()
// This resolves correctly whether the worker runs via tsx (source), compiled JS (build/worker/),
// Docker, or VPS deployment.
const projectRoot = process.env.DOTENV_CONFIG_PATH
  ? path.dirname(process.env.DOTENV_CONFIG_PATH)
  : process.cwd();
const nodeEnv = process.env.NODE_ENV || "development";

// List of env files to load, in order of precedence (highest first)
const envFiles = [
  `.env.${nodeEnv}.local`,
  `.env.${nodeEnv}`,
  `.env.local`,
  `.env`,
];

logger.info(`Loading env files (NODE_ENV=${nodeEnv})`, { nodeEnv, projectRoot });
envFiles.forEach((file) => {
  const fullPath = path.resolve(projectRoot, file);
  const result = dotenv.config({ path: fullPath });
  if (!result.error) {
    logger.info(`Loaded env file: ${file}`, { file, fullPath });
  }
});

logger.info("Worker config initialized", {
  smtpHost: process.env.SMTP_HOST,
  healthCheckIntervalMinutes: process.env.HEALTH_CHECK_INTERVAL_MINUTES,
});

// Determine port based on environment (same as backend)
const getPort = (): number => {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    return parseInt(
      process.env.PORT_PRODUCTION || process.env.PORT || "5002",
      10,
    );
  } else if (env === "staging") {
    return parseInt(process.env.PORT_STAGING || process.env.PORT || "5001", 10);
  }
  // Development
  return parseInt(process.env.PORT || "5000", 10);
};

export const config = {
  app: {
    name: process.env.APP_NAME || "BetterLibmanan",
    url: process.env.APP_URL || "http://localhost:3000",
    apiUrl: process.env.API_URL || "http://localhost:5000",
    env: process.env.NODE_ENV || "development",
    port: getPort(),
    host: process.env.HOST || "0.0.0.0",
    // Internal URL for health checks (avoids SSL issues for local requests)
    internalApiUrl: `http://localhost:${getPort()}`,
  },
  health: {
    checkIntervalMinutes: parseInt(
      process.env.HEALTH_CHECK_INTERVAL_MINUTES || "3",
      10,
    ),
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
    from: process.env.MAIL_FROM || "noreply@betterlibmanan.gov.ph",
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@betterlibmanan.gov.ph",
  },
};
