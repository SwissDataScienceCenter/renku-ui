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

import express from "express";
import morgan from "morgan";
import ws from "ws";

import APIClient from "./api-client";
import config from "./config";
import logger from "./logger";
import routes from "./routes";
import { RedisStorage } from "./storage/RedisStorage";
import { errorHandler } from "./utils/errorHandler";
import errorHandlerMiddleware from "./utils/middlewares/errorHandlerMiddleware";
import { initializePrometheus } from "./utils/prometheus/prometheus";
import {
  addWebSocketServerContext,
  initializeSentry,
} from "./utils/sentry/sentry";
import { configureWebsocket } from "./websocket";
import { Authenticator } from "./authentication/authenticator";

const app = express();
const port = config.server.port;
const prefix = config.server.prefix;

// configure logging
const logStream = {
  write: (message: string) => {
    logger.info(message);
  },
};
app.use(
  morgan("combined", {
    stream: logStream,
    skip: function (req) {
      // exclude from logging all the internal routes not accessible from outside
      if (!req.url.startsWith(config.server.prefix)) return true;
      return false;
    },
  })
);

logger.info("Server configuration: " + JSON.stringify(config));

// initialize sentry if the SENTRY_URL is set
initializeSentry(app);

// set up Prometheus metrics
initializePrometheus(app);

// configure storage
const storage = new RedisStorage();

// configure authenticator
const authenticator = new Authenticator();
const authPromise = authenticator.init();
app.use(authenticator.middleware());
authPromise.catch(() => {
  shutdown();
});

// register routes
routes.register(app, prefix, storage);

app.use(errorHandlerMiddleware);

// start the Express server
const server = app.listen(port, () => {
  logger.info(`Express server started at http://localhost:${port}`);
});

// configure API client
const apiClient = new APIClient();

// start the WebSocket server
function createWsServer() {
  if (!config.websocket.enabled) {
    return null;
  }

  const path = `${config.server.prefix}${config.server.wsSuffix}`;
  const wsServer = new ws.Server({ server, path });
  addWebSocketServerContext(wsServer);
  authPromise.then(() => {
    logger.info("Configuring WebSocket server");
    configureWebsocket(wsServer, storage, apiClient);
  });
  return wsServer;
}
const wsServer = createWsServer();

function shutdownServer() {
  logger.info("Shutting down server");
  server.close((error) => {
    if (error) {
      logger.error(error);
      process.exit(1);
    } else {
      logger.info("Shutting down storage");
      storage.shutdown();
      logger.info("Shutdown completed.");
      setImmediate(() => {
        process.exit(0);
      });
    }
  });
}

function shutdown() {
  if (wsServer != null) {
    logger.info("Shutting down WebSocket server");
    wsServer.clients.forEach((ws) => {
      ws.close();
    });
    wsServer.close((error) => {
      if (error) {
        logger.error(error);
        process.exit(1);
      } else {
        shutdownServer();
      }
    });
  } else {
    shutdownServer();
  }

  process.on("unhandledRejection", (error) => {
    logger.error(error);
    process.exit(1);
  });
}

process.on("unhandledRejection", (reason: Error) => {
  errorHandler.handleError(reason);
});

process.on("uncaughtException", (error: Error) => {
  errorHandler.handleError(error);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down.");
  shutdown();
});

process.on("SIGINT", () => {
  logger.info("Interrupted, shutting down.");
  shutdown();
});
