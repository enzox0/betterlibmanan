const { base } = require("@betterlibmanan/eslint-config");

module.exports = {
  ...base,
  root: true,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    ...base.rules,
    // types package is pure type declarations — relax some rules
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
