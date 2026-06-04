const http = require('http');

const waitForHealth = (url, maxRetries = 30, retryDelayMs = 1000) => {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Health check passed for ${url}`);
          resolve();
        } else {
          console.log(`Health check failed for ${url} (status: ${res.statusCode}), retrying...`);
          retry();
        }
      });

      req.on('error', (err) => {
        console.log(`Health check failed for ${url} (error: ${err.message}), retrying...`);
        retry();
      });

      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`Health check timed out for ${url}, retrying...`);
        retry();
      });
    };

    const retry = () => {
      retries++;
      if (retries >= maxRetries) {
        reject(new Error(`Max retries (${maxRetries}) reached for ${url}`));
      } else {
        setTimeout(check, retryDelayMs);
      }
    };

    check();
  });
};

module.exports = waitForHealth;

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node wait-for-health.js <health-check-url>');
    process.exit(1);
  }

  waitForHealth(url)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
