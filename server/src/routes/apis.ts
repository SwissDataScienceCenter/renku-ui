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

import { Authenticator } from "../authentication";
import { renkuAuth } from "../authentication/middleware";


function reigsterApiRoutes(app: express.Application, prefix: string, authenticator: Authenticator): void {
  // match all the other api routes
  app.get(prefix + "/api/*", renkuAuth(authenticator), (req, res) => {
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

export default reigsterApiRoutes;
