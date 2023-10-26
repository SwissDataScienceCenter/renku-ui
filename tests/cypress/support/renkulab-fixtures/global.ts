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
import { DeepPartial, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures generic
 */

export function Global<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    getStatuspageInfo(args?: Partial<GetStatuspageInfoArgs>) {
      const { fixture, name, overrides } = Cypress._.defaults({}, args, {
        fixture: "statuspage/statuspage-operational.json",
        name: "getStatuspageInfo",
        overrides: null,
      });

      if (!this.useMockedData || overrides == null) {
        const response = this.useMockedData ? { fixture } : undefined;
        cy.intercept(
          "https://*.statuspage.io/api/v2/summary.json",
          response
        ).as(name);
        return this;
      }

      cy.fixture(fixture).then((baseResult) => {
        const combinedResult = { ...baseResult, ...overrides };
        const response = { body: combinedResult };
        cy.intercept(
          "https://*.statuspage.io/api/v2/summary.json",
          response
        ).as(name);
      });

      return this;
    }

    config(args?: Partial<ConfigArgs>) {
      const { fixture, name, overrides } = Cypress._.defaults({}, args, {
        fixture: "config.json",
        name: "getConfig",
        overrides: null,
      });

      if (!this.useMockedData || overrides == null) {
        const response = this.useMockedData ? { fixture } : undefined;
        cy.intercept("/config.json", response).as(name);
        return this;
      }

      cy.fixture(fixture).then((baseResult) => {
        const combinedResult = { ...baseResult, ...overrides };
        const response = { body: combinedResult };
        cy.intercept("/config.json", response).as(name);
      });

      return this;
    }

    versions(args?: DeepPartial<VersionsArgs>) {
      const { core, notebooks, ui } = Cypress._.defaultsDeep({}, args, {
        core: {
          fixture: "version-core.json",
          name: "getCoreVersions",
        },
        notebooks: {
          fixture: "version-notebooks.json",
          name: "getNotebooksVersions",
        },
        ui: {
          fixture: "version-ui.json",
          name: "getUiVersion",
        },
      }) as VersionsArgs;

      const coreResponse = this.useMockedData
        ? { fixture: core.fixture }
        : undefined;
      cy.intercept("/ui-server/api/renku/versions", coreResponse).as(core.name);

      const notebooksResponse = this.useMockedData
        ? { fixture: notebooks.fixture }
        : undefined;
      cy.intercept("/ui-server/api/notebooks/version", notebooksResponse).as(
        notebooks.name
      );

      const uiResponse = this.useMockedData
        ? { fixture: ui.fixture }
        : undefined;
      cy.intercept("/ui-server/api/versions", uiResponse).as(ui.name);

      return this;
    }

    namespaces(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "namespaces.json",
        name: "getNamespaces",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/namespaces?*", response).as(name);
      return this;
    }

    templates(args?: Partial<TemplatesArgs>) {
      const error = args?.error ?? false;
      const defaultFixture = error
        ? "errors/core-error-1101.json"
        : "templates.json";
      const { fixture, name, urlSource } = Cypress._.defaults({}, args, {
        fixture: defaultFixture,
        name: "getTemplates",
        urlSource: "*",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(
        `/ui-server/api/renku/templates.read_manifest?${urlSource}`,
        response
      ).as(name);
      return this;
    }
  };
}

interface GetStatuspageInfoArgs extends SimpleFixture {
  overrides: unknown | null;
}

interface ConfigArgs extends SimpleFixture {
  overrides: unknown | null;
}

interface VersionsArgs {
  core: SimpleFixture;
  notebooks: SimpleFixture;
  ui: SimpleFixture;
}

interface TemplatesArgs extends SimpleFixture {
  error: boolean;
  urlSource: string;
}
