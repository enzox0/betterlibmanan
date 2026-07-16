const fs = require("fs");
const path = require("path");

function removeJsExtensions(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      removeJsExtensions(fullPath);
    } else if (file.name.endsWith(".js") && !file.name.endsWith(".map.js")) {
      let content = fs.readFileSync(fullPath, "utf8");
      // Remove .js extensions from require() and import() statements
      content = content.replace(
        /require\(["'](\..+?)\.js["']\)/g,
        'require("$1")',
      );
      content = content.replace(/from ["'](\..+?)\.js["']/g, 'from "$1"');
      fs.writeFileSync(fullPath, content, "utf8");
      console.log(`Fixed: ${fullPath}`);
    }
  }
}

const buildDir = path.join(__dirname, "..", "build");
console.log(`Removing .js extensions from CommonJS modules in: ${buildDir}`);
removeJsExtensions(buildDir);
console.log("Done!");
