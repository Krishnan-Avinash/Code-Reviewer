import { defineConfig } from "@vscode/test-cli";
const dotenv = require("dotenv").config();

export default defineConfig({
  files: "test/**/*.test.js",
});
