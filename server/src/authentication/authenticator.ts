/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import express from "express";
import { JWT } from "jose";
import { Client, Issuer } from "openid-client";

import config from "../config";
import logger from "../logger";
import { getCookieValueByName } from "../utils";

import {
  AnonymousUser,
  LoggedInUser,
  RequestWithUser,
  User,
} from "./authentication.types";

export class Authenticator {
  authServerUrl: string;
  issuer: Issuer<Client>;

  constructor(authServerUrl: string = config.auth.serverUrl) {
    this.authServerUrl = authServerUrl;
  }

  async init(): Promise<boolean> {
    try {
      this.issuer = await Issuer.discover(this.authServerUrl);
      logger.info("Authenticator initialized");
    } catch (error) {
      logger.error(
        "Cannot initialize the auth client. The authentication server may be down or some paramaters may be wrong. " +
          "Please check the next log entry for further details."
      );
      logger.error(error);
      throw error;
    }
    return true;
  }

  async authenticate({
    authHeader,
    sessionId = "",
  }: {
    authHeader: string;
    sessionId?: string;
  }): Promise<User> {
    const anonUser: AnonymousUser = {
      id: "",
      anonymousId: sessionId ?? "",
    };

    const authToken = authHeader
      .toLowerCase()
      .startsWith(config.auth.authHeaderPrefix)
      ? authHeader.slice(config.auth.authHeaderPrefix.length).trim()
      : authHeader.trim();

    if (!authToken) {
      return anonUser;
    }

    try {
      const issuer = this.issuer;
      if (issuer == null) {
        logger.error("The authenticator is not ready.");
        return anonUser;
      }

      const keystore = await issuer.keystore();
      const { payload } = JWT.verify(authToken, keystore, { complete: true });
      const userId = (payload as { sub?: string })["sub"];
      if (userId) {
        const user: LoggedInUser = { id: userId, renkuAuthToken: authToken };
        logger.debug(`Authentication: authenticated user ${user.id}`);
        return user;
      }
    } catch (error) {
      logger.error("Authentication failed:");
      logger.error(error);
    }
    return anonUser;
  }

  middleware(): (
    req: RequestWithUser,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<void> {
    const authenticate: typeof this.authenticate = this.authenticate.bind(this);

    async function authenticationMiddleware(
      req: RequestWithUser,
      res: express.Response,
      next: express.NextFunction
    ) {
      // Do not re-authenticate the request
      if (req.user != null) {
        return next();
      }

      const authHeader = req.header(config.auth.authHeaderField);
      const sessionId =
        getCookieValueByName(req.header("cookie"), config.auth.cookiesKey) ??
        "";
      req.user = await authenticate({ authHeader, sessionId });
      return next();
    }
    return authenticationMiddleware;
  }
}
