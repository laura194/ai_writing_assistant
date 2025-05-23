// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/tests/setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
