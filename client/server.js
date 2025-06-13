import compression from "compression";
import express from "express";
import morgan from "morgan";

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

// Logging
app.use(morgan("tiny"));

// Client files
app.use(express.static("build/client"));

// Server-side rendering
app.use(await import(BUILD_PATH).then((mod) => mod.app));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
