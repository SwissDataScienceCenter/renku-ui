import eslintPlugin from "@nabla/vite-plugin-eslint";
import { resolve } from "path";
import { defineConfig } from "vite";
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
  plugins: [eslintPlugin(), tsconfigPaths()],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
});
