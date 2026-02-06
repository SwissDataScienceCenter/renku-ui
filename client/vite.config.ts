import { resolve } from "path";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// import { sentryReactRouter } from "@sentry/react-router";

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

  // TODO: configure this maybe?
  // With Sentry release plugin
  // plugins: [
  //   reactRouter(),
  //   eslintPlugin(),
  //   tsconfigPaths(),
  //   sentryReactRouter(
  //     {
  //       org: "renku",
  //       project: "renku-ui",
  //       authToken: process.env.SENTRY_AUTH_TOKEN,
  //     },
  //     config
  //   ),
  // ],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
}));
