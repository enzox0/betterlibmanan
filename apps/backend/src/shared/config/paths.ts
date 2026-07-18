import path from "path";
import fs from "fs";

/**
 * Get the absolute path to the monorepo root.
 * This works reliably whether running via tsx, compiled JS, or in production.
 */
export function getMonorepoRoot(): string {
  // If DOTENV_CONFIG_PATH is set by the dev script or PM2, extract the directory
  if (process.env.DOTENV_CONFIG_PATH) {
    return path.dirname(process.env.DOTENV_CONFIG_PATH);
  }

  // Fallback: search upwards from __dirname for a directory containing package.json
  let currentDir = __dirname;
  while (true) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached filesystem root, give up and use __dirname
      return __dirname;
    }
    currentDir = parentDir;
  }
}

/**
 * Get the absolute path to the .env file at the monorepo root
 */
export function getEnvPath(): string {
  return path.join(getMonorepoRoot(), ".env");
}
