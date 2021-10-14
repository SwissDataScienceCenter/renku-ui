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
import { v4 as uuidv4 } from "uuid";

import config from "../config";
import { Authenticator } from "./index";


/**
 * Get the session id. If not availabe, one is created and set on the response cookies
 *
 * @param req - express request
 * @param res - express response
 * @return session id
 */
function getOrCreateSessionId(
  req: express.Request,
  res: express.Response,
  serverPrefix: string = config.server.prefix): string {
  const cookiesKey = config.auth.cookiesKey;
  let sessionId: string = getSessionId(req);
  if (req.cookies[cookiesKey] == null) {
    sessionId = uuidv4();
    res.cookie(cookiesKey, sessionId, { secure: true, httpOnly: true, path: serverPrefix });
  }
  return sessionId;
}


/**
 * Get the session id.
 *
 * @param req - express request
 * @returns session id
 */
function getSessionId(req: express.Request) : string {
  const cookiesKey = config.auth.cookiesKey;
  if (req.cookies[cookiesKey] == null)
    return null;
  return req.cookies[cookiesKey];
}


/**
 * Extract and return the search string (i.e. the query parameters in the form `?anyvalue`).
 *
 * @param req - express request containing the url
 * @returns search string
 */
function getStringyParams(req: express.Request) : string {
  const fullUrl = req.url.toLowerCase().startsWith("http") ?
    req.url :
    config.server.url + req.url;
  const urlObject = new URL(fullUrl);
  return urlObject.search;
}


function registerAuthenticationRoutes(app: express.Application, authenticator: Authenticator): void {
  const serverPrefix = config.server.prefix;
  const authPrefix = serverPrefix + config.auth.suffix;

  app.get(authPrefix + "/login", async (req, res, next) => {
    try {
      // start the login using the code flow, preserving query params for later.
      const sessionId = getOrCreateSessionId(req, res);
      const inputParams = getStringyParams(req);
      const loginCodeUrl = await authenticator.startAuthFlow(sessionId, inputParams);

      res.redirect(loginCodeUrl);
    }
    catch (error) {
      next(error);
    }
  });

  app.get(authPrefix + "/callback", async (req, res, next) => {
    try {
      // finish the auth flow, exchanging the auth code with the token set.
      const sessionId = getOrCreateSessionId(req, res);
      const code = authenticator.getAuthCode(req);
      new Error("test");
      const tokens = await authenticator.finishAuthFlow(sessionId, code);
      await authenticator.storeTokens(sessionId, tokens);

      // create the login url, adding the original query params.
      const originalParameters = await authenticator.getPostLoginParametersAndDelete(sessionId);
      const backendLoginUrl = config.deplyoment.gatewayLoginUrl + originalParameters;

      // ? Do I need to set the access token here? Will this be needed when removing the `session` cookie from gateway?
      // ? res.set(config.auth.authHeaderField, config.auth.authHeaderPrefix + tokens["access_token"]);
      res.redirect(backendLoginUrl);
    }
    catch (error) {
      next(error);
    }
  });

  app.get(authPrefix + "/logout", async (req, res, next) => {
    try {
      // delete token set
      const sessionId = getOrCreateSessionId(req, res);
      await authenticator.deleteTokens(sessionId);

      // create the logout url
      const inputParams = getStringyParams(req);
      const backendLoginUrl = config.deplyoment.gatewayLogoutUrl + inputParams;
      res.redirect(backendLoginUrl);
    }
    catch (error) {
      next(error);
    }
  });
}


export { registerAuthenticationRoutes, getSessionId };
