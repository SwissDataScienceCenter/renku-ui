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
import { TokenSet } from "openid-client";

import config from "../config";
import logger from "../logger";
import { Authenticator } from "./index";
import { getOrCreateSessionId } from "./routes";
import { getCookieValueByName } from "../utils";


/**
 * Add the authorization header for invoking gateway APIs as an authenticated renku user.
 *
 * @param res - express response
 * @param accessToken - valid access token.
 */
function addAuthToken(req: express.Request, accessToken: string): void {
  const value = config.auth.authHeaderPrefix + accessToken;
  req.headers[config.auth.authHeaderField] = value;
}


/**
 * Add the nonymous header for invoking gateway APIs as an anonymous renku user.
 *
 * @param req - express response
 * @param value - uid for the anonamous user.
 */
function addAnonymousToken(req: express.Request, value: string): void {
  req.headers[config.auth.cookiesAnonymousKey] = value;
}


/**
 * Add the invalid credentials header to signal the need to re-authenticate.
 *
 * @param res - express response
 */
function addAuthInvalid(req: express.Request): void {
  req.headers[config.auth.invalidHeaderField] = config.auth.invalidHeaderExpired;
}


function renkuAuth(authenticator: Authenticator) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    // get or create session
    const sessionId = getOrCreateSessionId(req, res);
    let tokens: TokenSet;
    try {
      tokens = await authenticator.getTokens(sessionId, true);
    }
    catch (error) {
      const stringyError = error.toString();
      const expired = stringyError.includes("expired") || stringyError.includes("invalid");
      if (expired) {
        logger.info(`Adding token expirations info for session ${sessionId}`);
        addAuthInvalid(req);
      }
      else {
        throw error;
      }
    }

    if (tokens)
      addAuthToken(req, tokens.access_token);
    else {
      // check if an anonymous user id exists in the cookies already and use that
      const existingAnonymousToken = getCookieValueByName(req.headers.cookie, config.auth.cookiesAnonymousKey);
      if (existingAnonymousToken) {
        if (existingAnonymousToken.startsWith(config.auth.anonPrefix)){
          // the prefix is added in another part of the code to every request so we should remove it here
          addAnonymousToken(req, existingAnonymousToken.substring(config.auth.anonPrefix.length));
        } else {
          addAnonymousToken(req, existingAnonymousToken);
        }
      } else {
        addAnonymousToken(req, sessionId);
      }
    }
    next();
  };
}

async function wsRenkuAuth(authenticator: Authenticator, sessionId: string): Promise<Record<string, string>> {
  let tokens: TokenSet;
  try {
    tokens = await authenticator.getTokens(sessionId, true);
  }
  catch (error) {
    const stringyError = error.toString();

    const expired = stringyError.includes("expired") || stringyError.includes("invalid");
    if (expired)
      throw new Error("expired");
    throw error;
  }

  if (tokens) {
    const value = config.auth.authHeaderPrefix + tokens.access_token;
    return { [config.auth.authHeaderField]: value };
  }
}

export { renkuAuth, addAuthToken, wsRenkuAuth };
