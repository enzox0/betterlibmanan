const { base } = require("@betterlibmanan/eslint-config");

module.exports = {
  ...base,
  root: true,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
