/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "../config";
import logger from "../logger";
import { Authenticator } from "../authentication";
import { renkuAuth } from "../authentication/middleware";


const proxyMiddleware = createProxyMiddleware({
  // set gateway as target
  target: config.deplyoment.gatewayUrl,
  changeOrigin: true,
  pathRewrite: (path): string => {
    // remove basic ui-server routing
    const rewrittenPath = path.substring((config.server.prefix + config.routes.api).length);
    logger.debug(`rewriting path from "${path}" to "${rewrittenPath}" and routing to ${config.deplyoment.gatewayUrl}`);
    return rewrittenPath;
  },
  onProxyReq: (clientReq) => {
    // remove unnecessary cookies to avoid gateway conflicts with auth tokens
    clientReq.removeHeader("cookie");
  },
  onProxyRes: (clientRes, req: express.Request) => {
    // preserve auth headers
    const expHeader = req.get(config.auth.invalidHeaderField);
    if (expHeader != null) {
      clientRes.headers[config.auth.invalidHeaderField] = expHeader;
      if (expHeader === config.auth.invalidHeaderExpired)
        logger.warn(`Authentication expired when trying to reach ${req.originalUrl}. Attaching auth headers.`);
    }
  }
});


function reigsterApiRoutes(app: express.Application, prefix: string, authenticator: Authenticator): void {
  // Locally defined APIs
  app.get(prefix + "/versions", (req, res) => {
    const uiShortSha = process.env.RENKU_UI_SHORT_SHA ?
      process.env.RENKU_UI_SHORT_SHA :
      "";
    const data = {
      "ui-short-sha": uiShortSha
    };
    res.json(data);
  });

  // All the unmatched APIs will be routed to the gateway using the http-proxy-middleware middlewere
  app.get(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.post(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
}

export default reigsterApiRoutes;
