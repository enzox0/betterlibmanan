module.exports = {
  root: true,
  extends: ["@betterlibmanan/eslint-config"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // types package is pure type declarations — relax some rules
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
