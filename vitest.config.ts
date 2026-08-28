import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@grin/ui": path.resolve(import.meta.dirname, "packages/grin-ui/src/index.ts"),
      "@grin/api": path.resolve(import.meta.dirname, "packages/grin-api/src/index.ts"),
      "@grin/content": path.resolve(import.meta.dirname, "packages/grin-content/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/*/src/**/*.test.{ts,tsx}", "apps/*/src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    reporters: ["default"],
  },
});
