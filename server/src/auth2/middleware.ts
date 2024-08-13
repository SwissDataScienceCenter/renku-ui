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
import { Client, Issuer } from "openid-client";
import { JWT } from "jose";

import config from "../config";
import logger from "../logger";
import { RequestWithUser } from "./authentication.types";

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

  middleware(): (
    req: RequestWithUser,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<void> {
    const that = this;
    function getIssuer() {
      return that.issuer;
    }

    async function authenticationMiddleware(
      req: RequestWithUser,
      res: express.Response,
      next: express.NextFunction
    ) {
      // Do not re-authenticate the request
      if (req.user != null) {
        return next();
      }

      const issuer = getIssuer();
      if (issuer == null) {
        logger.error("The authenticator is not ready.");
        return next();
      }

      const authHeader = req.header(config.auth.authHeaderField);
      const authToken = authHeader
        .toLowerCase()
        .startsWith(config.auth.authHeaderPrefix)
        ? authHeader.slice(config.auth.authHeaderPrefix.length).trim()
        : authHeader.trim();

      if (!authToken) {
        return next();
      }

      try {
        const keystore = await issuer.keystore();
        const { payload } = JWT.verify(authToken, keystore, { complete: true });
        logger.error(`Auth: ${payload}`);
        //   const userId = payload.sub
        return next();
      } catch (error) {
        logger.error("Authentication failed:");
        logger.error(error);
        return next();
      }
    }
    return authenticationMiddleware;
  }
}
