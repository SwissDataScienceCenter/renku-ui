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

import { REDIS_PREFIX, Storage } from "../../storage";
import express from "express";
import config from "../../config";
import { getUserIdFromToken } from "../../authentication";

const lastProjectsMiddleware = (storage: Storage) =>
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const token = req.headers[config.auth.authHeaderField] as string;
    const projectName = req.params["projectName"];
    res.on("finish", function() {
      const userId = getUserIdFromToken(token);
      // Save project only if the project return a valid code and the user exist
      if ([304, 200].includes(res.statusCode) && !!userId) {
        storage.lpush(userId, projectName, REDIS_PREFIX.DATA);
        storage.ltrim(userId, 100, REDIS_PREFIX.DATA); //adjust list length to 100
      }
    });
    next();
  };

export { lastProjectsMiddleware, getUserIdFromToken };
