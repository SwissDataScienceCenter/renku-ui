/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
 * Fixtures for the dashboard page
 */
export function Dashboard<T extends FixturesConstructor>(Parent: T) {
  return class DashboardFixtures extends Parent {
    configWithDashboardMessage(args?: SimpleFixture) {
      const { fixture = "config.json", name = "getConfig" } = args ?? {};

      if (fixture === "config.json") {
        const response = { fixture };
        cy.intercept("GET", "/config.json", response).as(name);
        return this;
      }

      cy.fixture("config.json").then((baseConfig) => {
        cy.fixture(fixture).then((layeredConfig) => {
          const combinedConfig = { ...baseConfig, ...layeredConfig };
          const response = { body: combinedConfig };
          cy.intercept("GET", "/config.json", response).as(name);
        });
      });

      return this;
    }
  };
}

export const DISMISSIBLE_SIMPLE_INFO_MESSAGE_FIXTURE =
  "dashboard/dismissible-simple-info-message.json";

export const NON_DISMISSIBLE_READ_MORE_SUCCESS_MESSAGE_FIXTURE =
  "dashboard/non-dismissible-read-more-success-message.json";
