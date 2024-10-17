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
 * limitations under the License.
 */

import { FixturesConstructor } from "./fixtures";
import { SimpleFixture } from "./fixtures.types";

interface SimpleOrEmpty extends SimpleFixture {
  empty?: boolean;
}

export function ConnectedServices<T extends FixturesConstructor>(Parent: T) {
  return class ConnectedServicesFixtures extends Parent {
    listConnectedServicesProviders(args?: SimpleOrEmpty) {
      const {
        fixture = "connectedServicesV2/providers.json",
        name = "listProviders",
        empty = false,
      } = args ?? {};

      if (empty) {
        cy.intercept("GET", "/ui-server/api/data/oauth2/providers", {
          body: [],
        }).as(name);
      } else {
        cy.fixture(fixture).then((providers) => {
          cy.intercept("GET", "/ui-server/api/data/oauth2/providers", {
            body: providers,
          }).as(name);
        });
      }
      return this;
    }

    listConnectedServicesConnections(args?: SimpleOrEmpty) {
      const {
        fixture = "connectedServicesV2/connections.json",
        name = "listConnections",
        empty = false,
      } = args ?? {};

      if (empty) {
        cy.intercept("GET", "/ui-server/api/data/oauth2/connections", {
          body: [],
        }).as(name);
      } else {
        cy.fixture(fixture).then((connections) => {
          cy.intercept("GET", "/ui-server/api/data/oauth2/connections", {
            body: connections,
          }).as(name);
        });
      }
      return this;
    }

    listConnectedServicesAccount(args?: SimpleOrEmpty) {
      const {
        fixture = "connectedServicesV2/account.json",
        name = "listAccount",
        empty = false,
      } = args ?? {};
      const url = "/ui-server/api/data/oauth2/connections/**/account";

      if (empty) {
        cy.intercept("GET", url, {
          body: {},
        }).as(name);
      } else {
        cy.fixture(fixture).then((account) => {
          cy.intercept("GET", url, {
            body: account,
          }).as(name);
        });
      }
      return this;
    }

    listConnectedServicesInstallations(args?: SimpleOrEmpty) {
      const {
        fixture = "connectedServicesV2/installationsFull.json",
        name = "listInstallations",
        empty = false,
      } = args ?? {};
      const url = "/ui-server/api/data/oauth2/connections/**/installations*";

      if (empty) {
        cy.intercept("GET", url, {
          body: [],
        }).as(name);
      } else {
        cy.fixture(fixture).then((installations) => {
          cy.intercept("GET", url, {
            body: installations,
          }).as(name);
        });
      }
      return this;
    }
  };
}
