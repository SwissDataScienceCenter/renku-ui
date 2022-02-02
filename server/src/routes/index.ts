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
import registerInternalRoutes from "./internal";
import registerApiRoutes from "./apis";
import { Authenticator } from "../authentication";
import { Storage } from "../storage";

function register(app: express.Application, prefix: string, authenticator: Authenticator, storage: Storage): void {
  registerInternalRoutes(app, authenticator);

  // Testing ingress
  app.get(prefix, (req, res) => {
    res.send("UI server up and running");
  });

  registerApiRoutes(app, prefix + config.routes.api, authenticator, storage);
}

export default { register };
