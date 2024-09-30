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
 * Fixtures for Cloud Storage
 */

interface DataConnectorArgs extends SimpleFixture {
  namespace?: string;
  visibility?: string;
}

export function DataConnector<T extends FixturesConstructor>(Parent: T) {
  return class DataConnectorFixtures extends Parent {
    listDataConnectors(args?: DataConnectorArgs) {
      const {
        fixture = "dataConnector/data-connector-multiple.json",
        name = "getDataConnectors",
        namespace,
      } = args ?? {};
      cy.fixture(fixture).then((dcs) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/data_connectors?namespace=${namespace}*`,
          (req) => {
            const response = dcs.map((dc) => {
              return {
                ...dc,
                namespace,
              };
            });
            req.reply({ body: response });
          }
        ).as(name);
      });
      return this;
    }

    postDataConnector(args?: DataConnectorArgs) {
      const {
        fixture = "dataConnector/new-data-connector.json",
        name = "postDataConnector",
        namespace,
        visibility = "private",
      } = args ?? {};
      cy.fixture(fixture).then((dataConnector) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept("POST", "/ui-server/api/data/data_connectors", (req) => {
          const newDataConnector = req.body;
          expect(newDataConnector.namespace).to.not.be.undefined;
          expect(newDataConnector.slug).to.not.be.undefined;
          expect(newDataConnector.visibility).to.not.be.undefined;
          expect(newDataConnector.visibility).equal(visibility);
          if (namespace) {
            expect(newDataConnector.namespace).equal(namespace);
          }
          dataConnector.namespace = newDataConnector.namespace;
          dataConnector.slug = newDataConnector.slug;
          dataConnector.visibility = newDataConnector.visibility;
          req.reply({ body: dataConnector, statusCode: 201, delay: 1000 });
        }).as(name);
      });
      return this;
    }

    patchDataConnector(args?: DataConnectorArgs) {
      const {
        fixture = "dataConnector/new-data-connector.json",
        name = "patchDataConnector",
        namespace,
      } = args ?? {};
      cy.fixture(fixture).then((dataConnector) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "PATCH",
          "/ui-server/api/data/data_connectors/*",
          (req) => {
            const newDataConnector = req.body;
            expect(newDataConnector.namespace).to.not.be.undefined;
            expect(newDataConnector.slug).to.not.be.undefined;
            expect(newDataConnector.visibility).to.not.be.undefined;
            if (namespace) {
              expect(newDataConnector.namespace).equal(namespace);
            }
            dataConnector.namespace = newDataConnector.namespace;
            dataConnector.slug = newDataConnector.slug;
            dataConnector.visibility = newDataConnector.visibility;
            req.reply({ body: dataConnector, statusCode: 201, delay: 1000 });
          }
        ).as(name);
      });
      return this;
    }

    deleteDataConnector(args?: DataConnectorArgs) {
      const { name = "deleteDataConnector" } = args ?? {};
      const response = { statusCode: 204 };
      cy.intercept(
        "DELETE",
        "/ui-server/api/data/data_connectors/*",
        response
      ).as(name);
      return this;
    }
  };
}
