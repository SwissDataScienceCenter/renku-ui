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

import fixtures from "../support/renkulab-fixtures";

function openDataConnectorMenu() {
  cy.getDataCy("data-connector-edit")
    .parent()
    .find("[data-cy=button-with-menu-dropdown]")
    .first()
    .click();
}

describe("Set up data connectors with credentials", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: { id: "0945f006-e117-49b7-8966-4c0842146313" },
      })
      .listNamespaceV2()
      .landingUserProjects()
      .listGroupV2()
      .getGroupV2Permissions()
      .listGroupV2Members()
      .listProjectV2ByNamespace()
      .projects()
      .readGroupV2()
      .readGroupV2Namespace()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" });
  });

  it("shows information about credentials", () => {
    fixtures
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      });
    cy.visit("/v2/groups/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("data-connector-name").contains("private-storage-1").click();
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "private-storage-1"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );
    cy.getDataCy("data-connector-view-back-button").click();
  });

  it("create data connector after failed connection test", () => {
    fixtures
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: false })
      .postDataConnector({ namespace: "test-2-group-v2" })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    cy.visit("/v2/groups/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector test-2-group-v2/example-storage-without-credentials has been successfully added."
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listDataConnectors");
  });

  it("create data connector with credentials", () => {
    fixtures
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: true })
      .postDataConnector({ namespace: "test-2-group-v2" })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-5",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      });
    cy.visit("/v2/groups/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();

    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage");
      cy.get("#saveCredentials").should("be.checked");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    fixtures.dataConnectorSecrets({
      fixture: "dataConnector/data-connector-secrets.json",
      name: "getDataConnectorSecrets",
    });
    cy.wait("@postDataConnector");
    cy.wait("@patchDataConnectorSecrets");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector test-2-group-v2/example-storage has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "credentials were saved"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listDataConnectors");
  });

  it("set credentials for a data connector", () => {
    fixtures
      .listDataConnectors({
        fixture: "dataConnector/data-connector.json",
        namespace: "test-2-group-v2",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      });

    cy.visit("/v2/groups/test-2-group-v2");
    cy.wait("@readGroupV2");
    cy.wait("@listDataConnectors");
    // Credentials should not yet be stored
    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );

    // set credentials
    openDataConnectorMenu();
    cy.getDataCy("data-connector-credentials").click();

    fixtures
      .testCloudStorage({ success: true })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-1",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
      });

    cy.getDataCy("data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("data-connector-credentials-modal")
      .contains("Test and Save")
      .click();

    cy.wait("@testCloudStorage");
    cy.wait("@patchDataConnectorSecrets");
    cy.wait("@getDataConnectorSecrets");

    // Credentials should be stored
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Credentials saved"
    );

    // edit data connector, without touching the credentials
    fixtures.getStorageSchema({
      fixture: "cloudStorage/storage-schema-s3.json",
    });
    openDataConnectorMenu();
    cy.getDataCy("data-connector-edit").click();
    cy.getDataCy("data-connector-edit-modal")
      .find("#access_key_id")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
    cy.getDataCy("data-connector-edit-modal")
      .find("#secret_access_key")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
  });

  it("clear credentials for a data connector", () => {
    fixtures
      .listDataConnectors({
        fixture: "dataConnector/data-connector.json",
        namespace: "test-2-group-v2",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-partial.json",
        name: "getDataConnectorSecrets",
      });
    cy.visit("/v2/groups/test-2-group-v2");
    cy.wait("@readGroupV2");
    cy.wait("@listDataConnectors");

    // Credentials should be stored
    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Credentials saved"
    );

    // clear credentials
    openDataConnectorMenu();
    cy.getDataCy("data-connector-credentials").click();
    cy.getDataCy("data-connector-credentials-modal")
      .contains("The saved credentials for this data connector are incomplete")
      .should("be.visible");

    fixtures.deleteDataConnectorSecrets().dataConnectorSecrets({
      fixture: "dataConnector/data-connector-secrets-empty.json",
      name: "getDataConnectorSecrets2",
    });
    cy.getDataCy("data-connector-credentials-modal").contains("Clear").click();
    cy.wait("@deleteDataConnectorSecrets");
    cy.wait("@getDataConnectorSecrets2");

    // Credentials should be changed
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );
  });

  describe("Set up multiple data connectors", () => {
    beforeEach(() => {
      fixtures
        .config()
        .versions()
        .userTest()
        .dataServicesUser({
          response: { id: "0945f006-e117-49b7-8966-4c0842146313" },
        })
        .listNamespaceV2()
        .landingUserProjects()
        .listGroupV2()
        .listGroupV2Members()
        .listProjectV2ByNamespace()
        .projects()
        .readGroupV2()
        .readGroupV2Namespace();
    });

    it("set up one data connector that succeeds, another with failed credentials", () => {
      fixtures
        .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
        .listDataConnectors({ namespace: "test-2-group-v2" })
        .testCloudStorage({ success: true })
        .postDataConnector({ namespace: "test-2-group-v2" })
        .patchDataConnectorSecrets({
          dataConnectorId: "ULID-5",
          content: [
            {
              name: "access_key_id",
              value: "access key",
            },
            {
              name: "secret_access_key",
              value: "secret key",
            },
          ],
        });
      cy.visit("/v2/groups/test-2-group-v2");
      cy.wait("@readGroupV2");
      // add data connector
      cy.getDataCy("add-data-connector").should("be.visible").click();
      cy.wait("@getStorageSchema");

      // Pick a provider
      cy.getDataCy("data-storage-s3").click();
      cy.getDataCy("data-provider-AWS").click();
      cy.getDataCy("data-connector-edit-next-button").click();

      // Fill out the details
      cy.get("#sourcePath").type("bucket/my-source");
      cy.get("#access_key_id").type("access key");
      cy.get("#secret_access_key").type("secret key");
      cy.getDataCy("test-data-connector-button").click();
      cy.getDataCy("add-data-connector-continue-button")
        .contains("Continue")
        .click();

      cy.wait("@listNamespaceV2");
      // eslint-disable-next-line max-nested-callbacks
      cy.getDataCy("data-connector-edit-mount").within(() => {
        cy.get("#name").type("example storage");
        cy.get("#saveCredentials").should("be.checked");
      });
      cy.getDataCy("data-connector-edit-update-button").click();
      fixtures.dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
        name: "getDataConnectorSecrets",
      });
      cy.wait("@postDataConnector");
      cy.wait("@patchDataConnectorSecrets");
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "The data connector test-2-group-v2/example-storage has been successfully added"
      );
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "credentials were saved"
      );
      cy.getDataCy("data-connector-edit-close-button").click();
      cy.wait("@listDataConnectors");

      fixtures.testCloudStorage({ success: false }).patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
      cy.visit("/v2/groups/test-2-group-v2");
      cy.wait("@readGroupV2");
      // add data connector
      cy.getDataCy("add-data-connector").should("be.visible").click();
      cy.wait("@getStorageSchema");

      // Pick a provider
      cy.getDataCy("data-storage-s3").click();
      cy.getDataCy("data-provider-AWS").click();
      cy.getDataCy("data-connector-edit-next-button").click();

      // Fill out the details
      cy.get("#sourcePath").type("bucket/my-source");
      cy.get("#access_key_id").type("access key");
      cy.get("#secret_access_key").type("secret key");
      cy.getDataCy("test-data-connector-button").click();
      cy.getDataCy("add-data-connector-continue-button")
        .contains("Skip")
        .click();
      // eslint-disable-next-line max-nested-callbacks
      cy.getDataCy("data-connector-edit-mount").within(() => {
        cy.get("#name").type("example storage without credentials");
      });
      cy.getDataCy("data-connector-edit-update-button").click();
      cy.wait("@postDataConnector");
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "The data connector test-2-group-v2/example-storage-without-credentials has been successfully added."
      );
      cy.getDataCy("data-connector-edit-close-button").click();
      cy.wait("@listDataConnectors");
    });
  });
});
