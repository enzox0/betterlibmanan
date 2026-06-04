const { spawn } = require('child_process');
const path = require('path');
const concurrently = require('concurrently');

const waitForHealth = require('./wait-for-health');

const runCommand = (command, args, cwd, name) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });
  });
};

async function main() {
  console.log('Starting BetterLibmanan development environment...');
  console.log('');

  // Start Backend first
  console.log('Starting Backend...');
  const backendProcess = spawn('pnpm', ['dev'], {
    cwd: path.join(__dirname, '../apps/backend'),
    stdio: 'inherit',
    shell: true
  });

  // Wait for Backend to be healthy
  console.log('Waiting for Backend health check...');
  try {
    await waitForHealth('http://localhost:5000/health', 60, 1000);
  } catch (err) {
    console.error('Failed to wait for Backend:', err.message);
    backendProcess.kill();
    process.exit(1);
  }

  console.log('');

  // Start Worker
  console.log('Starting Worker...');
  const workerProcess = spawn('pnpm', ['dev'], {
    cwd: path.join(__dirname, '../apps/worker'),
    stdio: 'inherit',
    shell: true
  });

  // Wait a bit for Worker to initialize
  console.log('Waiting for Worker to initialize...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('');

  // Start Frontend
  console.log('Starting Frontend...');
  const frontendProcess = spawn('pnpm', ['dev'], {
    cwd: path.join(__dirname, '../apps/frontend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle cleanup on exit
  const cleanup = () => {
    console.log('\nShutting down all processes...');
    backendProcess.kill();
    workerProcess.kill();
    frontendProcess.kill();
    process.exit();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  // Keep the main process alive
  await Promise.all([
    new Promise((resolve) => backendProcess.on('close', resolve)),
    new Promise((resolve) => workerProcess.on('close', resolve)),
    new Promise((resolve) => frontendProcess.on('close', resolve))
  ]);
}

main().catch((err) => {
  console.error('❌ Error in dev script:', err);
  process.exit(1);
});
