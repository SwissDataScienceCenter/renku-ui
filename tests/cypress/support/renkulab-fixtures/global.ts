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

/**
 * Fixtures generic
 */

function Global<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    getStatuspageInfo({
      name = "getStatuspageInfo",
      fixture = "statuspage-operational.json",
      overrides,
    }: {
      name?: string;
      fixture?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overrides?: any;
    } = {}) {
      if (overrides == null) {
        const interceptResponse = { fixture: `statuspage/${fixture}` };
        cy.intercept(
          "https://*.statuspage.io/api/v2/summary.json",
          interceptResponse
        ).as(name);
        return this;
      }
      cy.fixture(`statuspage/${fixture}`).then((baseResponse) => {
        const combinedResponse = { ...baseResponse, ...overrides };
        cy.intercept("https://*.statuspage.io/api/v2/summary.json", {
          body: combinedResponse,
        }).as(name);
      });
      return this;
    }

    config(params?: {
      name?: string;
      fixture?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overrides?: any;
    }) {
      const {
        name = "getConfig",
        fixture = "config.json",
        overrides,
      } = params || {};
      if (overrides == null) {
        cy.intercept("/config.json", {
          fixture,
        }).as(name);
        return this;
      }
      cy.fixture("config.json").then((baseConfig) => {
        const combinedConfig = { ...baseConfig, ...overrides };
        cy.intercept("/config.json", {
          body: combinedConfig,
        }).as(name);
      });
      return this;
    }

    versions(
      names = {
        coreVersionsName: "getCoreVersions",
        notebooksVersionsName: "getNotebooksVersions",
        uiVersionName: "getUiVersion",
      },
      fixtures = {
        core: "version-core.json",
        notebooks: "version-notebooks.json",
        ui: "version-ui.json",
      }
    ) {
      const { coreVersionsName, notebooksVersionsName, uiVersionName } = names;
      cy.intercept("/ui-server/api/versions", {
        fixture: fixtures.ui,
      }).as(uiVersionName);
      cy.intercept("/ui-server/api/renku/versions", {
        fixture: fixtures.core,
      }).as(coreVersionsName);
      cy.intercept("/ui-server/api/notebooks/version", {
        fixture: fixtures.notebooks,
      }).as(notebooksVersionsName);

      return this;
    }

    namespaces(name = "getNamespaces") {
      cy.intercept("/ui-server/api/namespaces?*", {
        fixture: "namespaces.json",
      }).as(name);
      return this;
    }

    templates(error = false, urlSource = "*", name = "getTemplates") {
      const fixture = error ? "errors/core-error-1101.json" : "templates.json";
      cy.intercept(
        "/ui-server/api/renku/templates.read_manifest?" + urlSource,
        { fixture }
      ).as(name);
      return this;
    }
  };
}

export { Global };
