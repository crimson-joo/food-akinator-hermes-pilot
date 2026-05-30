import { defineConfig } from "vitest/config";

const TEST_FILE_GLOB = "**/*.{test,spec}.?(c|m)[jt]s?(x)";
const isExplicitHermesRun = process.argv.some(
  (arg) => arg === ".hermes" || arg.startsWith(".hermes/") || arg.includes("/.hermes/"),
);

export default defineConfig({
  test: {
    include: isExplicitHermesRun ? [TEST_FILE_GLOB] : [`tests/${TEST_FILE_GLOB}`],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.hermes/**', 'tests/e2e/**'],
  },
});
