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

// import { getUserIdFromToken } from "../../authentication";
import config from "../../config";
import logger from "../../logger";
import { Storage, TypeData } from "../../storage";

function projectNameIsId(projectName: string): boolean {
  return projectName.match(/^[0-9]*$/) !== null;
}

const lastProjectsMiddleware =
  (storage: Storage) =>
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    const token = ""; //req.headers[config.auth.authHeaderField] as string;
    const projectName = req.params["projectName"];
    // Ignore projects that are ids -- these will be re-accessed as namespace/name anyway
    if (projectNameIsId(projectName)) {
      next();
      return;
    }

    if (req.query?.doNotTrack !== "true") {
      res.on("finish", function () {
        if (res.statusCode >= 400 || !token) {
          next();
          return;
        }

        const userId = ""; //getUserIdFromToken(token);
        const normalizedProjectName = projectName.toLowerCase();
        // Save as ordered collection
        storage
          .save(
            `${config.data.projectsStoragePrefix}${userId}`,
            normalizedProjectName,
            {
              type: TypeData.Collections,
              limit: config.data.projectsDefaultLength,
              score: Date.now(),
            }
          )
          .then((value) => {
            if (!value) {
              const errorMessage = `Error saving project ${projectName} for user ${userId}`;
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

export { lastProjectsMiddleware };
