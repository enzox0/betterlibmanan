module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'apps/backend/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'worker',
      script: 'apps/worker/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
