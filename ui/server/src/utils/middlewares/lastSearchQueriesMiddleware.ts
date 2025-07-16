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

import * as Sentry from "@sentry/node";
import express from "express";

import type { RequestWithUser } from "../../authentication/authentication.types";
import config from "../../config";
import logger from "../../logger";
import { Storage, TypeData } from "../../storage";

const lastSearchQueriesMiddleware =
  (storage: Storage) =>
  (
    req: RequestWithUser,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    const user = req.user;
    const query = req.query["query"];
    const phrase = query ? (query as string).trim() : "";

    if (req.query?.doNotTrack !== "true" && phrase) {
      res.on("finish", function () {
        if (res.statusCode >= 400 || !user?.id) {
          next();
          return;
        }
        storage
          .save(`${config.data.searchStoragePrefix}${user.id}`, phrase, {
            type: TypeData.Collections,
            limit: config.data.searchDefaultLength,
            score: Date.now(),
          })
          .then((value) => {
            if (!value) {
              const errorMessage = `Error saving search query for user ${user.id}`;
              logger.error(errorMessage);
              Sentry.captureMessage(errorMessage);
            }
          })
          .catch((err) => {
            Sentry.captureException(err);
          });
      });
    }
    next();
  };

export { lastSearchQueriesMiddleware };
