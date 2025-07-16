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

interface DataConnectorListArgs extends SimpleFixture {
  namespace?: string;
  visibility?: string;
}

interface DataConnectorPostArgs extends DataConnectorListArgs {
  slug?: string;
}

interface DataConnectorIdArgs extends SimpleFixture {
  dataConnectorId?: string;
}

interface DataConnectorIdentifierArgs extends SimpleFixture {
  namespace?: string;
  slug?: string;
}

interface GlobalDataConnectorIdentifierArgs extends SimpleFixture {
  slug?: string;
}

interface DeleteDataConnectorProjectLinkArgs extends DataConnectorIdArgs {
  linkId?: string;
  projectId?: string;
}

interface PatchDataConnectorSecretsArgs extends DataConnectorIdArgs {
  content: {
    name: string;
    value: string;
  }[];
  shouldNotBeCalled?: boolean;
}

interface ProjectDataConnectorArgs extends SimpleFixture {
  projectId?: string;
}

interface PostDataConnectorProjectLinkArgs extends DataConnectorIdArgs {
  projectId?: string;
  shouldNotBeCalled?: boolean;
}

export function DataConnector<T extends FixturesConstructor>(Parent: T) {
  return class DataConnectorFixtures extends Parent {
    dataConnectorSecrets(args?: DataConnectorIdArgs) {
      const {
        fixture = "dataConnector/data-connector-secrets.json",
        name = "getDataConnectorSecrets",
        dataConnectorId = "ULID-1",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/data_connectors/${dataConnectorId}/secrets`,
        response
      ).as(name);
      return this;
    }

    deleteDataConnector(args?: DataConnectorListArgs) {
      const { name = "deleteDataConnector" } = args ?? {};
      const response = { statusCode: 204 };
      cy.intercept(
        "DELETE",
        "/ui-server/api/data/data_connectors/*",
        response
      ).as(name);
      return this;
    }

    deleteDataConnectorProjectLink(args?: DeleteDataConnectorProjectLinkArgs) {
      const {
        name = "deleteDataConnectorProjectLink",
        dataConnectorId = "ULID-1",
        linkId = "LINK-ULID-1",
      } = args ?? {};
      const response = { statusCode: 204 };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/data_connectors/${dataConnectorId}/project_links/${linkId}`,
        response
      ).as(name);
      return this;
    }

    deleteDataConnectorProjectLinkNotAllowed(
      args?: DeleteDataConnectorProjectLinkArgs
    ) {
      const {
        name = "deleteDataConnectorProjectLinkNotAllowed",
        dataConnectorId = "ULID-1",
        linkId = "LINK-ULID-1",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `The user with ID 'userId' cannot perform operation delete_link on the data connector to project link with ID ${projectId} or the resource does not exist.`,
          },
        },
        statusCode: 404,
      };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/data_connectors/${dataConnectorId}/project_links/${linkId}`,
        response
      ).as(name);
      return this;
    }

    deleteDataConnectorSecrets(args?: DataConnectorIdArgs) {
      const {
        name = "deleteDataConnectorSecrets",
        dataConnectorId = "ULID-1",
      } = args ?? {};
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/data_connectors/${dataConnectorId}/secrets`,
        { body: null, delay: 1000 }
      ).as(name);
      return this;
    }

    getDataConnector(args?: DataConnectorIdArgs) {
      const {
        fixture = "dataConnector/data-connector.json",
        name = "getDataConnector",
        dataConnectorId = "ULID-1",
      } = args ?? {};
      cy.fixture(fixture).then((dcs) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/data_connectors/${dataConnectorId}`,
          (req) => {
            const response = dcs.map((dc) => {
              return {
                ...dc,
                id: dataConnectorId,
              };
            })[0];
            req.reply({ body: response });
          }
        ).as(name);
      });
      return this;
    }

    getDataConnectorByNamespaceAndSlug(args?: DataConnectorIdentifierArgs) {
      const {
        fixture = "dataConnector/data-connector.json",
        name = "getDataConnectorByNamespaceAndSlug",
        namespace = "user1-uuid",
        slug = "example-storage",
      } = args ?? {};
      cy.fixture(fixture).then((dcs) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/namespaces/${namespace}/data_connectors/${slug}`,
          (req) => {
            const response = dcs.map((dc) => {
              return {
                ...dc,
              };
            })[0];
            req.reply({ body: response });
          }
        ).as(name);
      });
      return this;
    }

    getDataConnectorByNamespaceAndSlugNotFound(
      args?: DataConnectorIdentifierArgs
    ) {
      const {
        name = "getDataConnectorByNamespaceAndSlugNotFound",
        namespace = "user1-uuid",
        slug = "example-storage",
      } = args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `Data connector with identifier '${namespace}/${slug}' does not exist or you do not have access to it.`,
          },
        },
        statusCode: 404,
      };
      cy.intercept(
        "GET",
        `/ui-server/api/data/namespaces/${namespace}/data_connectors/${slug}`,
        response
      ).as(name);
      return this;
    }

    getDataConnectorByGlobalSlug(args?: GlobalDataConnectorIdentifierArgs) {
      const {
        fixture = "dataConnector/data-connector-global.json",
        name = "getDataConnectorByGlobalSlug",
        slug = "ULID-DOI-1",
      } = args ?? {};
      cy.fixture(fixture).then((body) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/data_connectors/global/${slug}`,
          (req) => {
            req.reply({ body });
          }
        ).as(name);
      });
      return this;
    }

    getDataConnectorPermissions(args?: DataConnectorIdArgs) {
      const {
        fixture = "dataConnector/data-connector-permissions.json",
        name = "getDataConnectorPermissions",
        dataConnectorId = "ULID-1",
      } = args ?? {};
      cy.fixture(fixture).then((permissions) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/data_connectors/${dataConnectorId}/permissions`,
          (req) => {
            req.reply({ body: permissions });
          }
        ).as(name);
      });
      return this;
    }

    listDataConnectorProjectLinks(args?: DataConnectorIdArgs) {
      const {
        fixture = "dataConnector/project-data-connector-links.json",
        name = "listDataConnectorProjectLinks",
        dataConnectorId = "ULID-1",
      } = args ?? {};
      cy.fixture(fixture).then((links) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/data_connectors/${dataConnectorId}/project_links`,
          (req) => {
            const response = links.map((link) => {
              return {
                ...link,
                data_connector_id: dataConnectorId,
              };
            });
            req.reply({ body: response });
          }
        ).as(name);
      });
      return this;
    }

    listDataConnectors(args?: DataConnectorListArgs) {
      const {
        fixture = "dataConnector/data-connector-multiple.json",
        name = "listDataConnectors",
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

    listProjectDataConnectors(args?: ProjectDataConnectorArgs) {
      const {
        fixture = "dataConnector/project-data-connector-links.json",
        name = "listProjectDataConnectors",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      cy.fixture(fixture).then((links) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "GET",
          `/ui-server/api/data/projects/${projectId}/data_connector_links`,
          (req) => {
            const response = links.map((link) => {
              return {
                ...link,
                project_id: projectId,
              };
            });
            req.reply({ body: response, delay: 1000 });
          }
        ).as(name);
      });
      return this;
    }

    patchDataConnector(args?: DataConnectorListArgs) {
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

    patchDataConnectorSecrets(args?: PatchDataConnectorSecretsArgs) {
      const {
        content,
        fixture = "dataConnector/data-connector-secrets-empty.json",
        name = "patchDataConnectorSecrets",
        shouldNotBeCalled = false,
        dataConnectorId = "ULID-1",
      } = args ?? {};
      const dcId = shouldNotBeCalled ? "*" : dataConnectorId;
      cy.fixture(fixture).then((secrets) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "PATCH",
          `/ui-server/api/data/data_connectors/${dcId}/secrets`,
          (req) => {
            if (shouldNotBeCalled)
              throw new Error("No call to post secrets expected");
            const newSecrets = req.body;
            expect(newSecrets.length).equal(content.length);
            newSecrets.forEach((secret, index) => {
              expect(secret.name).equal(content[index].name);
              expect(secret.value).equal(content[index].value);
            });
            req.reply({ body: secrets, delay: 1000 });
          }
        ).as(name);
      });
      return this;
    }

    postDataConnector(args?: DataConnectorPostArgs) {
      const {
        fixture = "dataConnector/new-data-connector.json",
        name = "postDataConnector",
        namespace,
        slug,
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
          if (slug) {
            expect(newDataConnector.slug).equal(slug);
          }
          dataConnector.namespace = newDataConnector.namespace;
          dataConnector.slug = newDataConnector.slug;
          dataConnector.visibility = newDataConnector.visibility;
          req.reply({ body: dataConnector, statusCode: 201, delay: 1000 });
        }).as(name);
      });
      return this;
    }

    postDataConnectorProjectLink(args?: PostDataConnectorProjectLinkArgs) {
      const {
        fixture = "dataConnector/project-data-connector-links.json",
        name = "postDataConnectorProjectLink",
        dataConnectorId = "ULID-1",
        projectId = "THEPROJECTULID26CHARACTERS",
        shouldNotBeCalled = false,
      } = args ?? {};
      cy.fixture(fixture).then((dataConnectorProjectLinks) => {
        const dcId = shouldNotBeCalled ? "*" : dataConnectorId;
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "POST",
          `/ui-server/api/data/data_connectors/${dcId}/project_links`,
          (req) => {
            if (shouldNotBeCalled)
              throw new Error("No call to post project link expected");
            const newLink = req.body;
            expect(newLink.project_id).to.not.be.undefined;
            expect(newLink.project_id).equal(projectId);
            const link = dataConnectorProjectLinks[0];
            link.data_connector_id = dataConnectorId;
            link.project_id = projectId;
            req.reply({
              body: link,
              statusCode: 201,
              delay: 1000,
            });
          }
        ).as(name);
      });
      return this;
    }

    postGlobalDataConnector(args?: SimpleFixture) {
      const {
        fixture = "dataConnector/data-connector-global.json",
        name = "postGlobalDataConnector",
      } = args ?? {};
      cy.fixture(fixture).then((dataConnector) => {
        cy.intercept(
          "POST",
          "/ui-server/api/data/data_connectors/global",
          (req) => {
            req.reply({ body: dataConnector, statusCode: 201, delay: 1000 });
          }
        ).as(name);
      });
      return this;
    }
  };
}
