import dotenv from "dotenv";
import path from "path";

const projectRoot = process.cwd();
const nodeEnv = process.env.NODE_ENV || "development";

const envFiles = [
  `.env.${nodeEnv}.local`,
  `.env.${nodeEnv}`,
  `.env.local`,
  `.env`,
];

console.log(`[Backend Config] Loading env files (NODE_ENV=${nodeEnv}):`);
envFiles.forEach((file) => {
  const fullPath = path.resolve(projectRoot, file);
  const result = dotenv.config({ path: fullPath });
  if (!result.error) {
    console.log(`[Backend Config] Loaded: ${file}`);
  }
});

console.log(
  "[Backend Config] SMTP_HOST after loading env files:",
  process.env.SMTP_HOST,
);

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
  return parseInt(process.env.PORT || "5000", 10);
};

interface AppConfig {
  name: string;
  url: string;
  apiUrl: string;
  env: string;
  port: number;
  host: string;
}
interface HealthConfig {
  checkIntervalMinutes: number;
}
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}
interface AdminConfig {
  email: string;
}
interface Config {
  readonly app: AppConfig;
  readonly health: HealthConfig;
  readonly smtp: SmtpConfig;
  readonly admin: AdminConfig;
}

export const config: Config = {
  get app(): AppConfig {
    return {
      name: process.env.APP_NAME || "BetterLibmanan",
      url: process.env.APP_URL || "http://localhost:3000",
      apiUrl: process.env.API_URL || "http://localhost:5000",
      env: process.env.NODE_ENV || "development",
      port: getPort(),
      host: process.env.HOST || "0.0.0.0",
    };
  },
  get health(): HealthConfig {
    return {
      checkIntervalMinutes: parseInt(
        process.env.HEALTH_CHECK_INTERVAL_MINUTES || "3",
        10,
      ),
    };
  },
  get smtp(): SmtpConfig {
    return {
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER || "user@example.com",
      pass: process.env.SMTP_PASS || "password",
      from: process.env.MAIL_FROM || "no-reply@betterlibmanan.org",
    };
  },
  get admin(): AdminConfig {
    return {
      email: process.env.ADMIN_EMAIL || "admin@betterlibmanan.gov.ph",
    };
  },
};
