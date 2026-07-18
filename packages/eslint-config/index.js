/** Base config for all packages (no React plugins) */
const base = {
  root: true,
  env: { es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};

/** React config — extends base and adds React-specific plugins */
const react = {
  ...base,
  env: { ...base.env, browser: true },
  extends: [...base.extends, "plugin:react-hooks/recommended"],
  plugins: ["react-refresh"],
  rules: {
    ...base.rules,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};

module.exports = react;
module.exports.base = base;
module.exports.react = react;
