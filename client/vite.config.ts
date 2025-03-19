import eslintPlugin from "@nabla/vite-plugin-eslint";
// import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  // build: {
  //   outDir: "build",
  //   sourcemap: true,
  // },
  // server: {
  //   allowedHosts: [".dev.renku.ch"],
  // },
  // plugins: [react({ include: "/index.html" }), eslintPlugin()],
  // resolve: {
  //   alias: {
  //     "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
  //   },
  // },

  server: {
    allowedHosts: [".dev.renku.ch"],
  },
  plugins: [
    remix({
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
