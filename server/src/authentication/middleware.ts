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

import config from "../config";
import { IAuthenticator } from "../interfaces";
import { getSessionId } from "./routes";
import { serializeCookie } from "../utils";
import { WsMessage } from "../websocket/WsMessages";

// /**
//  * Add the authorization header for invoking gateway APIs as an authenticated renku user.
//  *
//  * @param res - express response
//  * @param accessToken - valid access token.
//  */
// function addAuthToken(req: express.Request, accessToken: string): void {
//   const value = config.auth.authHeaderPrefix + accessToken;
//   req.headers[config.auth.authHeaderField] = value;
// }

// /**
//  * Add the nonymous header for invoking gateway APIs as an anonymous renku user.
//  *
//  * @param req - express response
//  * @param value - uid for the anonamous user.
//  */
// function addAnonymousToken(req: express.Request, value: string): void {
//   req.headers[config.auth.cookiesAnonymousKey] = value;
// }

// /**
//  * Add the invalid credentials header to signal the need to re-authenticate.
//  *
//  * @param res - express response
//  */
// function addAuthInvalid(req: express.Request): void {
//   req.headers[config.auth.invalidHeaderField] =
//     config.auth.invalidHeaderExpired;
// }

function renkuAuth(authenticator: IAuthenticator) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    const sessionId = getSessionId(req, res);
    req.headers[config.auth.gatewaySessionHeaderKey] = sessionId;
    next();
  };
}

async function wsRenkuAuth(
  authenticator: IAuthenticator,
  sessionId: string
): Promise<WsMessage | Record<string, string>> {
  const newCookies: Array<string> = [
    serializeCookie(config.auth.cookiesKey, sessionId),
  ];
  return { cookie: newCookies.join("; ") };
}

export { renkuAuth, wsRenkuAuth };
