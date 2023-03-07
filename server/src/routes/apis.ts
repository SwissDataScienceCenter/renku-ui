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
import fetch from "cross-fetch";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "../config";
import logger from "../logger";
import { IAuthenticator } from "../interfaces";
import { renkuAuth } from "../authentication/middleware";
import { validateCSP } from "../utils/url";
import { lastProjectsMiddleware } from "../utils/middlewares/lastProjectsMiddleware";
import { lastSearchQueriesMiddleware } from "../utils/middlewares/lastSearchQueriesMiddleware";
import uploadFileMiddleware from "../utils/middlewares/uploadFileMiddleware";
import { Storage } from "../storage";
import { CheckURLResponse } from "./apis.interfaces";
import { getUserData } from "./helperFunctions";

const proxyMiddleware = createProxyMiddleware({
  // set gateway as target
  target: config.deployment.gatewayUrl,
  changeOrigin: true,
  proxyTimeout: config.server.proxyTimeout,
  timeout: config.server.proxyTimeout,
  pathRewrite: (path): string => {
    // remove basic ui-server routing
    const rewrittenPath = path.substring((config.server.prefix + config.routes.api).length);
    logger.debug(`rewriting path from "${path}" to "${rewrittenPath}" and routing to ${config.deployment.gatewayUrl}`);
    return rewrittenPath;
  },
  onProxyRes: (clientRes, req: express.Request, res: express.Response) => {
    // Add CORS for sentry
    res.setHeader("Access-Control-Allow-Headers", "sentry-trace");
  }
});


function registerApiRoutes(app: express.Application,
  prefix: string, authenticator: IAuthenticator, storage: Storage): void {

  // Locally defined APIs
  if (config.sentry.enabled && config.sentry.debugMode) {
    app.get(prefix + "/fake-error", async () => {
      setTimeout(() => {
        throw new Error("Fake error!");
      }, 1000);
    });
  }

  app.get(prefix + "/allows-iframe/:url", async (req, res) => {
    const validationResponse: CheckURLResponse = {
      isIframeValid: false,
      url: req.params.url,
    };
    try {
      const externalUrl = new URL(req.params.url);
      const requestExternalURL = await fetch(externalUrl.toString());
      if (requestExternalURL.status >= 400) {
        validationResponse.error = "Bad response from server";
      }
      else if (!requestExternalURL.headers.has("content-security-policy")) {
        validationResponse.isIframeValid = true;
        validationResponse.detail = "Header does not contain Content-Security-Policy (CSP)";
      }
      else {
        // check content-security-policy
        const validation = validateCSP(req.params.url, requestExternalURL.headers.get("content-security-policy"));
        validationResponse.isIframeValid = validation.isIframeValid;
        validationResponse.error = validation.error;
        validationResponse.detail = validation.detail;
      }
    }
    catch (error) {
      validationResponse.error = error.toString();
    }
    res.json(validationResponse);
  });

  app.get(prefix + "/last-projects/:length", renkuAuth(authenticator), async (req, res) => {
    const token = req.headers[config.auth.authHeaderField] as string;
    if (!token) {
      res.json({ error: "User not authenticated" });
      return;
    }
    const length = parseInt(req.params["length"]) || 0;
    const data = await getUserData(config.data.projectsStoragePrefix, token, storage, length);
    res.json({ projects: data });
  });

  app.get(prefix + "/last-searches/:length", renkuAuth(authenticator), async (req, res) => {
    const token = req.headers[config.auth.authHeaderField] as string;
    if (!token) {
      res.json({ error: "User not authenticated" });
      return;
    }
    const length = parseInt(req.params["length"]) || 0;
    const data = await getUserData(config.data.searchStoragePrefix, token, storage, length);
    res.json({ queries: data });
  });

  /*
   * All the unmatched APIs will be routed to the gateway using the http-proxy-middleware middleware
   */
  app.get(
    prefix + "/projects/:projectName",
    [renkuAuth(authenticator), lastProjectsMiddleware(storage)],
    proxyMiddleware
  );
  app.post(
    prefix + "/renku/cache.files_upload",
    [renkuAuth(authenticator), uploadFileMiddleware],
    proxyMiddleware
  );
  app.get(
    prefix + "/kg/entities",
    [renkuAuth(authenticator), lastSearchQueriesMiddleware(storage)],
    proxyMiddleware
  );
  app.delete(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.get(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.head(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.options(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.patch(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.post(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.put(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
}

export default registerApiRoutes;
