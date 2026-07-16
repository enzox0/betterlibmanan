import path from "path";

/**
 * Get the absolute path to the monorepo root.
 * This works reliably whether running via tsx, compiled JS, or in production.
 */
export function getMonorepoRoot(): string {
  // If DOTENV_CONFIG_PATH is set by the dev script or PM2, extract the directory
  if (process.env.DOTENV_CONFIG_PATH) {
    return path.dirname(process.env.DOTENV_CONFIG_PATH);
  }

  // Fallback: resolve from this file's location
  // When running via tsx: apps/backend/src/shared/config/paths.ts (5 levels up)
  // When running compiled: build/backend/shared/config/paths.js (4 levels up)
  const levelsUp = __dirname.includes(path.join("build", "backend")) ? 4 : 5;
  const levels = Array(levelsUp).fill("..");
  return path.resolve(__dirname, ...levels);
}

/**
 * Get the absolute path to the .env file at the monorepo root
 */
export function getEnvPath(): string {
  return path.join(getMonorepoRoot(), ".env");
}
