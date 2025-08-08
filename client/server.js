/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

// eslint-disable-next-line no-console
console.log("Starting production server");

// Storybook
app.use("/storybook", express.static("storybook-static"));

// Client assets
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);

// Configuration and miscellaneous files
await import(BUILD_PATH).then(
  (
    /**
     * @import * as ModuleType from './server/app'
     * @type {ModuleType} */
    mod
  ) => {
    const {
      CONFIG_JSON,
      ROBOTS,
      SAMPLE_PRIVACY_CONTENT,
      SAMPLE_TERMS_CONTENT,
      SITEMAP,
    } = mod.constants;
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
  }
);

// Logging
app.use(morgan("tiny"));

// Client files
app.use(express.static("build/client"));

// Server-side rendering
app.use(
  await import(BUILD_PATH).then(
    (
      /**
       * @import * as ModuleType from './server/app'
       * @type {ModuleType} */
      mod
    ) => mod.app
  )
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
