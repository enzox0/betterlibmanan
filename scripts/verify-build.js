const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying production build...\n");

const checks = [];

// Check 1: Build directory exists
const buildDir = path.join(__dirname, "..", "build");
if (fs.existsSync(buildDir)) {
  checks.push({ name: "Build directory exists", pass: true });
} else {
  checks.push({
    name: "Build directory exists",
    pass: false,
    error: "Build directory not found",
  });
}

// Check 2: Main entry points exist
const backendMain = path.join(buildDir, "backend", "main.js");
const workerMain = path.join(buildDir, "worker", "main.js");

if (fs.existsSync(backendMain)) {
  checks.push({ name: "Backend main.js exists", pass: true });

  // Check 3: No unresolved path aliases in built code
  const content = fs.readFileSync(backendMain, "utf8");
  const hasPathAliases =
    content.match(/require\(['"]@\//g) || content.match(/from ['"]@\//g);

  if (hasPathAliases) {
    checks.push({
      name: "No unresolved path aliases",
      pass: false,
      error: `Found ${hasPathAliases.length} unresolved '@/' imports in backend/main.js`,
    });
  } else {
    checks.push({ name: "No unresolved path aliases", pass: true });
  }

  // Check 4: No syntax errors (basic check)
  const hasSyntaxIssues = content.match(/\baw at\b/) || content.match(/\?\?\?/);
  if (hasSyntaxIssues) {
    checks.push({
      name: "No obvious syntax errors",
      pass: false,
      error: "Found potential syntax errors in built code",
    });
  } else {
    checks.push({ name: "No obvious syntax errors", pass: true });
  }
} else {
  checks.push({
    name: "Backend main.js exists",
    pass: false,
    error: "File not found",
  });
}

if (fs.existsSync(workerMain)) {
  checks.push({ name: "Worker main.js exists", pass: true });
} else {
  checks.push({
    name: "Worker main.js exists",
    pass: false,
    error: "File not found",
  });
}

// Print results
console.log("Build Verification Results:");
console.log("=".repeat(50));

let allPassed = true;
checks.forEach((check) => {
  const icon = check.pass ? "✓" : "✗";
  const status = check.pass ? "PASS" : "FAIL";
  console.log(`${icon} ${check.name}: ${status}`);
  if (!check.pass) {
    console.log(`  └─ ${check.error}`);
    allPassed = false;
  }
});

console.log("=".repeat(50));

if (allPassed) {
  console.log("\n✅ Build verification passed! Safe to deploy with PM2.");
  process.exit(0);
} else {
  console.log("\n❌ Build verification failed! Do NOT deploy with PM2.");
  console.log("\nSuggested fixes:");
  console.log("1. Clean build: rm -rf build");
  console.log("2. Rebuild: pnpm run build");
  console.log("3. Run verification again: node scripts/verify-build.js");
  process.exit(1);
}
