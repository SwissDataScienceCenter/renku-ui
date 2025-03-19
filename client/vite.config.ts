import eslintPlugin from "@nabla/vite-plugin-eslint";
import { vitePlugin as remix } from "@remix-run/dev";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

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
    remix({
      future: {
        v3_singleFetch: true,
      },
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
    eslintPlugin(),
  ],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
});
