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

import { FixturesConstructor } from "./fixtures";
import { SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Sessions
 */

export function NewSession<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    newLauncher(args?: SimpleFixture) {
      const { fixture = "", name = "newLauncher" } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept("POST", "/api/data/session_launchers", response).as(name);
      return this;
    }

    editLauncher(args?: SimpleFixture) {
      const { fixture = "", name = "editLauncher" } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept("PATCH", "/api/data/session_launchers/*", response).as(name);
      return this;
    }

    environments(args?: SimpleFixture) {
      const {
        fixture = "sessions/environments.json",
        name = "getEnvironments",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/api/data/environments`, response).as(name);
      return this;
    }
  };
}
