import compression from "compression";
import express from "express";
import morgan from "morgan";
import {
  CONFIG_JSON,
  ROBOTS,
  SAMPLE_PRIVACY_CONTENT,
  SAMPLE_TERMS_CONTENT,
  SITEMAP,
} from "./server/constants.js";

const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  throw new Error("Can only run in production");
}

console.log("Starting production server");

// Storybook
app.use("/storybook", express.static("storybook-static"));

// Client assets
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);

//Configuration and miscellaneous files
app.get("/config.json", (_, res) => {
  res.json(CONFIG_JSON);
});
app.get("/sitemap.xml", (_, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.send(SITEMAP);
});
app.get("/robots.txt", (_, res) => {
  res.send(ROBOTS);
});
if (CONFIG_JSON.TERMS_PAGES_ENABLED) {
  app.get("/terms-of-use.md", (_, res) => {
    CONFIG_JSON.TERMS_CONTENT.length > 0
      ? res.send(CONFIG_JSON.TERMS_CONTENT)
      : res.send(SAMPLE_TERMS_CONTENT);
  });
  app.get("/privacy-statement.md", (_, res) => {
    CONFIG_JSON.PRIVACY_CONTENT.length > 0
      ? res.send(CONFIG_JSON.PRIVACY_CONTENT)
      : res.send(SAMPLE_PRIVACY_CONTENT);
  });
}

// Logging
app.use(morgan("tiny"));

// Client files
app.use(express.static("build/client"));

// Server-side rendering
app.use(await import(BUILD_PATH).then((mod) => mod.app));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
