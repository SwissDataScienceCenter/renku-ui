import { resolve } from "path";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    allowedHosts: [".dev.renku.ch"],
  },
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    eslintPlugin(),
    tsconfigPaths(),
    envOnlyMacros(),
  ],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        // See: https://github.com/twbs/bootstrap/issues/40849
        silenceDeprecations: [
          "color-functions",
          "import",
          "global-builtin",
          "if-function",
        ],
      },
    },
  },
});
