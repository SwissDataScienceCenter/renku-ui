import react from "@vitejs/plugin-react";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), envOnlyMacros()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./testSetup.ts",
  },
});
