const path = require("path");
const rootDir = __dirname;

module.exports = {
  apps: [
    {
      name: "betterlibmanan-backend",
      script: "./build/backend/main.js",
      cwd: rootDir,
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Add paths to find pnpm modules
        NODE_PATH: [
          path.join(rootDir, "node_modules"),
          path.join(rootDir, "apps/backend/node_modules"),
          path.join(rootDir, "node_modules/.pnpm/node_modules"),
        ].join(path.delimiter),
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "500M",
      watch: false,
    },
    {
      name: "betterlibmanan-worker",
      script: "./build/worker/main.js",
      cwd: rootDir,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        // Add paths to find pnpm modules
        NODE_PATH: [
          path.join(rootDir, "node_modules"),
          path.join(rootDir, "apps/worker/node_modules"),
          path.join(rootDir, "node_modules/.pnpm/node_modules"),
        ].join(path.delimiter),
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "500M",
      watch: false,
    },
  ],
};
