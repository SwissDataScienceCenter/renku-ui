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


function registerInternalRoutes(app: express.Application, authenticator: Authenticator): void {
  // define a route handler for the default home page
  app.get("/", (req, res) => {
    res.send("Hello world!");
  });

  // define a route handler for the readiness probe
  app.get("/readiness", (req, res) => {
    res.send("ready");
  });

  // define a route handler for the liveness probe
  app.get("/liveness", (req, res) => {
    res.send("live");
  });

  // define a route handler for the startup probe
  app.get("/startup", (req, res) => {
    // check if storage is ready
    if (!authenticator.storage.ready)
      res.status(503).send("Storage (i.e. Redis) not ready");
    // check if authenticator is ready
    else if (!authenticator.ready)
      res.status(503).send("Authenticator not ready");
    // if nothing bad happened so far... all must be working fine!
    else
      res.send("live");
  });
}

export default registerInternalRoutes;
