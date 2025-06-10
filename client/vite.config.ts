import eslintPlugin from "@nabla/vite-plugin-eslint";
import { reactRouter } from "@react-router/dev/vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: isSsrBuild ? { input: "./server/app.ts" } : undefined,
  },
  server: {
    allowedHosts: [".dev.renku.ch"],
  },
  plugins: [reactRouter(), eslintPlugin(), tsconfigPaths()],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
}));
