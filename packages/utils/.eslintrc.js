module.exports = {
  root: true,
  extends: ["@betterlibmanan/eslint-config"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
