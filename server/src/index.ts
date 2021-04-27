/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

import express from "express";
import logger from "./logger";
import routes from "./routes";
import morgan from "morgan";

const app = express();
const port = 8080; // default port to listen

// configure logging
const logStream = {
  write: (message: string) => {
    logger.info(message);
  },
};
app.use(morgan("combined", { stream: logStream }));


routes.register(app);

// start the Express server
const server = app.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Shutting down.");
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    logger.info("Interrupted, shutting down.");
  });
});
