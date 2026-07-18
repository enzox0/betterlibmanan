/**
 * Production Build Verification Script
 * Verifies that the build output is ready for production deployment
 */

const fs = require("fs");
const path = require("path");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

let hasErrors = false;
let hasWarnings = false;

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}: ${filePath}`, GREEN);
    return true;
  } else {
    log(`✗ ${description}: NOT FOUND at ${filePath}`, RED);
    hasErrors = true;
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    log(`✓ ${description}: ${dirPath} (${files.length} files)`, GREEN);
    return files;
  } else {
    log(`✗ ${description}: NOT FOUND at ${dirPath}`, RED);
    hasErrors = true;
    return [];
  }
}

console.log("\n" + "=".repeat(60));
log("Production Build Verification", YELLOW);
console.log("=".repeat(60) + "\n");

// Check build directories
console.log("Checking build directories...\n");

const buildDir = path.resolve(__dirname, "../build");
checkDirectory(buildDir, "Build root directory");

const frontendBuildDir = path.join(buildDir, "frontend");
const backendBuildDir = path.join(buildDir, "backend");
const workerBuildDir = path.join(buildDir, "worker");

checkDirectory(frontendBuildDir, "Frontend build directory");
checkDirectory(backendBuildDir, "Backend build directory");
checkDirectory(workerBuildDir, "Worker build directory");

console.log("\nChecking critical files...\n");

// Check frontend critical files
checkFile(path.join(frontendBuildDir, "index.html"), "Frontend index.html");

const assetsDir = path.join(frontendBuildDir, "assets");
const assetFiles = checkDirectory(assetsDir, "Frontend assets directory");

if (assetFiles.length > 0) {
  const jsFiles = assetFiles.filter((f) => f.endsWith(".js"));
  const cssFiles = assetFiles.filter((f) => f.endsWith(".css"));
  log(`  → JavaScript files: ${jsFiles.length}`, GREEN);
  log(`  → CSS files: ${cssFiles.length}`, GREEN);

  if (jsFiles.length === 0) {
    log(`  ⚠ Warning: No JavaScript files found in assets`, YELLOW);
    hasWarnings = true;
  }
  if (cssFiles.length === 0) {
    log(`  ⚠ Warning: No CSS files found in assets`, YELLOW);
    hasWarnings = true;
  }
}

// Check backend critical files
checkFile(path.join(backendBuildDir, "main.js"), "Backend main.js");

// Check worker critical files
checkFile(path.join(workerBuildDir, "main.js"), "Worker main.js");

console.log("\nChecking Docker compatibility...\n");

// Check Dockerfile
const dockerfilePath = path.resolve(
  __dirname,
  "../infrastructure/docker/unified.Dockerfile",
);
if (checkFile(dockerfilePath, "Unified Dockerfile")) {
  const dockerfileContent = fs.readFileSync(dockerfilePath, "utf-8");

  // Check for pnpm-lock.yaml in COPY command
  if (dockerfileContent.includes("pnpm-lock.yaml")) {
    log("  ✓ Dockerfile copies pnpm-lock.yaml", GREEN);
  } else {
    log("  ✗ Dockerfile missing pnpm-lock.yaml in COPY command", RED);
    log('  → This will cause "ERR_PNPM_NO_LOCKFILE" error on Render', RED);
    hasErrors = true;
  }

  // Check for critical lines
  if (
    dockerfileContent.includes(
      "COPY --from=builder /app/build/frontend /app/apps/frontend/dist",
    )
  ) {
    log("  ✓ Dockerfile copies frontend to correct Docker path", GREEN);
  } else {
    log("  ✗ Dockerfile missing frontend copy command", RED);
    hasErrors = true;
  }

  if (dockerfileContent.includes("RUN mkdir -p /app/apps/frontend/dist")) {
    log("  ✓ Dockerfile creates frontend dist directory", GREEN);
  } else {
    log("  ⚠ Dockerfile may not create frontend dist directory", YELLOW);
    hasWarnings = true;
  }
}

// Check pnpm-lock.yaml exists
const lockfilePath = path.resolve(__dirname, "../pnpm-lock.yaml");
if (checkFile(lockfilePath, "pnpm-lock.yaml")) {
  const lockfileSize = fs.statSync(lockfilePath).size;
  if (lockfileSize > 0) {
    log(
      `  ✓ pnpm-lock.yaml is valid (${Math.round(lockfileSize / 1024)}KB)`,
      GREEN,
    );
  } else {
    log("  ✗ pnpm-lock.yaml is empty", RED);
    hasErrors = true;
  }
}

console.log("\nChecking configuration files...\n");

// Check package.json scripts
const rootPackageJson = require("../package.json");
if (rootPackageJson.scripts.start) {
  log(`✓ Start script defined: ${rootPackageJson.scripts.start}`, GREEN);
} else {
  log("✗ No start script defined in root package.json", RED);
  hasErrors = true;
}

// Check render.yaml
const renderYamlPath = path.resolve(__dirname, "../render.yaml");
if (checkFile(renderYamlPath, "Render configuration")) {
  const renderContent = fs.readFileSync(renderYamlPath, "utf-8");
  if (
    renderContent.includes(
      "dockerfilePath: ./infrastructure/docker/unified.Dockerfile",
    )
  ) {
    log("  ✓ Render configured to use unified.Dockerfile", GREEN);
  } else {
    log("  ⚠ Render may not be using correct Dockerfile", YELLOW);
    hasWarnings = true;
  }
}

console.log("\n" + "=".repeat(60));
if (hasErrors) {
  log("✗ VERIFICATION FAILED - Please fix errors above", RED);
  console.log("=".repeat(60) + "\n");
  process.exit(1);
} else if (hasWarnings) {
  log("⚠ VERIFICATION PASSED WITH WARNINGS", YELLOW);
  console.log("=".repeat(60) + "\n");
  process.exit(0);
} else {
  log("✓ ALL CHECKS PASSED - Ready for production deployment!", GREEN);
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}
