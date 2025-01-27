import eslintPlugin from "@nabla/vite-plugin-eslint";
import express from "express";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, ViteDevServer } from "vite";

const app = express();

app.get("/config.json", (req, res) => {
  const baseURL = new URL(process.env.RENKU_BASE_URL);
  const gatewayURL = new URL("/api", baseURL);
  const uiServerURL = new URL("/ui-server", baseURL);
  res
    .json({
      GATEWAY_URL: gatewayURL.href,
      UISERVER_URL: uiServerURL.href,
      BASE_URL: baseURL.href,
      KEYCLOAK_REALM: "Renku",
    })
    .end();
});

function expressPlugin() {
  return {
    name: "express-plugin",
    configureServer(server: ViteDevServer) {
      if (process.env.RENKU_BASE_URL == null) {
        return;
      }
      server.middlewares.use(app);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    sourcemap: true,
  },
  plugins: [react({ include: "/index.html" }), eslintPlugin(), expressPlugin()],
  resolve: {
    alias: {
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
    },
  },
});
