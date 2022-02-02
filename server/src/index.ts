/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import config from "./config";
import logger from "./logger";
import routes from "./routes";
import { Authenticator } from "./authentication";
import { registerAuthenticationRoutes } from "./authentication/routes";
import { RedisStorage } from "./storage/RedisStorage";


const app = express();
const port = config.server.port;
const prefix = config.server.prefix;

// configure logging
const logStream = {
  write: (message: string) => {
    logger.info(message);
  },
};
app.use(morgan("combined", {
  stream: logStream,
  skip: function (req) {
    // exclude from logging all the internal routes not accessible from outside
    if (!req.url.startsWith(config.server.prefix))
      return true;
    return false;
  }
}));

logger.info("Server configuration: " + JSON.stringify(config));

// configure storage
const storage = new RedisStorage();

// configure authenticator
const authenticator = new Authenticator(storage);
authenticator.init().then(() => {
  logger.info("Authenticator started");

  registerAuthenticationRoutes(app, authenticator);
});

// register middlewares
app.use(cookieParser());

// register routes
routes.register(app, prefix, authenticator, storage);

// TODO: custom error handler?
// app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   res.status(501);
//   res.json({ status: "error", error: error });
//   next(error);
// });

// start the Express server
const server = app.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    storage.shutdown();
    logger.info("Shutdown completed.");
  });
}

process.on("SIGTERM", () => {
  logger.info("Shutting down.");
  shutdown();
});

process.on("SIGINT", () => {
  logger.info("Interrupted, shutting down.");
  shutdown();
});
