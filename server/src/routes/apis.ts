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
import { Authenticator } from "../authentication";
import { CheckURLResponse } from "./apis.interfaces";
import { renkuAuth } from "../authentication/middleware";
import { validateCSP } from "../utils/url";
import { Storage, StorageGetOptions, TypeData } from "../storage";
import { getUserIdFromToken, lastProjectsMiddleware } from "../utils/middlewares/lastProjectsMiddleware";
import uploadFileMiddleware from "../utils/middlewares/uploadFileMiddleware";

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
  onProxyReq: (clientReq) => {
    // remove unnecessary cookies to avoid gateway conflicts with auth tokens
    const cookie = clientReq.getHeader("cookie") as string;
    if (cookie)
      clientReq.removeHeader("cookie");
    // add anon-id to cookies when the proper header is set.
    const anonId = clientReq.getHeader(config.auth.cookiesAnonymousKey);
    if (anonId) {
      // ? the anon-id MUST start with a letter to prevent k8s limitations
      const fullAnonId = config.auth.anonPrefix + config.auth.cookiesAnonymousKey;
      clientReq.setHeader("cookie", `${config.auth.cookiesAnonymousKey}=${fullAnonId}`);
    }
  },
  onProxyRes: (clientRes, req: express.Request, res: express.Response) => {
    // Add CORS for sentry
    res.setHeader("Access-Control-Allow-Headers", "sentry-trace");

    // handle auth expiration -- we change the response status to avoid browser caching
    const expHeader = req.get(config.auth.invalidHeaderField);
    if (expHeader != null) {
      clientRes.headers[config.auth.invalidHeaderField] = expHeader;
      if (expHeader === config.auth.invalidHeaderExpired) {
        // We return a different response to prevent side effects from caching mechanism on 30x responses
        logger.warn(`Authentication expired when trying to reach ${req.originalUrl}. Attaching auth headers.`);
        res.status(500);
        res.setHeader(config.auth.invalidHeaderField, expHeader);
        res.json({ error: "Invalid authentication tokens" });
      }
    }

    // remove setting anon-id cookies from the gateway -- should be temporary until gateway gets updated
    const setCookie = null ?? clientRes.headers["set-cookie"];
    if (setCookie != null && setCookie.length) {
      if (setCookie.length === 1) {
        if (setCookie[0].startsWith(config.auth.cookiesAnonymousKey))
          clientRes.headers["set-cookie"] = null;
      }
      else {
        const allowedSetCookie = [];
        for (const cookie of setCookie) {
          if (!cookie.startsWith(config.auth.cookiesAnonymousKey))
            allowedSetCookie.push(cookie);
        }
        if (allowedSetCookie.length < setCookie.length)
          clientRes.headers["set-cookie"] = allowedSetCookie;
      }
    }
  }
});


function registerApiRoutes(app: express.Application,
  prefix: string, authenticator: Authenticator, storage: Storage): void {

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

  if (config.sentry.enabled && config.sentry.debugMode) {
    app.get(prefix + "/debug-sentry", async () => {
      setTimeout(() => {
        throw new Error("Async Fn error!");
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

    const userId = getUserIdFromToken(token);
    let data: string[] = [];
    const options: StorageGetOptions = {
      type: TypeData.Collections,
      start: 0,
      stop: (parseFloat(req.params["length"]) || 0) - 1
    };

    if (userId)
      data = await storage.get(`${config.data.projectsStoragePrefix}${userId}`, options) as string[];
    res.json({ projects: data });
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
  app.delete(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.get(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.head(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.options(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.patch(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.post(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
  app.put(prefix + "/*", renkuAuth(authenticator), proxyMiddleware);
}

export default registerApiRoutes;
