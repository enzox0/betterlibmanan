module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'apps/backend/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
    {
      name: 'worker',
      script: 'apps/worker/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
