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
import fetch from "cross-fetch";

import config from "../config";
import { Authenticator } from "../authentication";
import { renkuAuth } from "../authentication/middleware";
import { CheckURLResponse } from "./apis.interfaces";
import { validateCSP } from "../utils/url";

const tmpProxMiddleware = createProxyMiddleware({
  target: config.deplyoment.gatewayUrl,
  changeOrigin: true,
  pathRewrite: (path): string => {
    const rewrittenPath = path.substring((config.server.prefix + "/api").length);
    return rewrittenPath;
  },
  onProxyReq: (clientReq) => {
    // ? We don't need the cookie in the routed request. Let's remove them to avoid gateway conflicts with auth token
    clientReq.removeHeader("cookie");
  }
});


function registerApiRoutes(app: express.Application, prefix: string, authenticator: Authenticator): void {
  app.get(prefix + "/versions", (req, res) => {
    const uiShortSha = process.env.RENKU_UI_SHORT_SHA ?
      process.env.RENKU_UI_SHORT_SHA :
      "";
    const data = {
      "ui-short-sha": uiShortSha
    };
    res.json(data);
  });

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

  app.get(prefix + "/projects*", renkuAuth(authenticator), tmpProxMiddleware, () => {
    // ? This route only attaches the middleware
    // ? REF: https://www.npmjs.com/package/http-proxy-middleware
    // TODO: extend this correctly to unmatched /api/* routes
    // TODO: alterative: consider using https://github.com/nodejitsu/node-http-proxy
  });

  // match all the other api routes
  app.get(prefix + "/*", renkuAuth(authenticator), (req, res) => {
    // TODO: this works as a temporary test. Fix it when implementing the proper API routing
    const headers = { ...req.headers };
    if (headers["Authorization"])
      headers["Authorization"] = "[ADJUSTED] bearer token";
    if (headers["cookie"]) {
      if (headers["cookie"].includes("ui-server-session"))
        headers["cookie"] = "[ADJUSTED] cookies with ui-server-session";
      else
        headers["cookie"] = "[ADJUSTED] cookies not related to ui-server";
    }
    res.json(headers);
  });
}

export default registerApiRoutes;
