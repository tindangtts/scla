import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    setupFiles: ["src/__test-setup.ts"],
  },
  resolve: {
    alias: {
      "@workspace/db": new URL("../../lib/db/src/index.ts", import.meta.url).pathname,
    },
  },
});
