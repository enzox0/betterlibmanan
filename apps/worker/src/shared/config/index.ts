import dotenv from "dotenv";
import path from "path";

// Load .env files from project root in order of precedence
// Precedence: .env.<NODE_ENV>.local > .env.<NODE_ENV> > .env.local > .env
// When compiled, __dirname is in dist folder, so we need to go up more levels
// From apps/worker/dist/shared/config → go up 5 folders to reach project root
const projectRoot = path.resolve(__dirname, "../../../../../");
const nodeEnv = process.env.NODE_ENV || "development";

// List of env files to load, in order of precedence (highest first)
const envFiles = [
  `.env.${nodeEnv}.local`,
  `.env.${nodeEnv}`,
  `.env.local`,
  `.env`,
];

console.log(`[Worker Config] Loading env files (NODE_ENV=${nodeEnv}):`);
envFiles.forEach((file) => {
  const fullPath = path.resolve(projectRoot, file);
  const result = dotenv.config({ path: fullPath });
  if (!result.error) {
    console.log(`[Worker Config] Loaded: ${file}`);
  }
});

console.log("[Worker Config] SMTP_HOST:", process.env.SMTP_HOST);
console.log(
  "[Worker Config] HEALTH_CHECK_INTERVAL_MINUTES:",
  process.env.HEALTH_CHECK_INTERVAL_MINUTES,
);

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
