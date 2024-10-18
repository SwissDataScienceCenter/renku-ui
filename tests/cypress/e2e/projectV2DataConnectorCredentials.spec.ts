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

describe("Set up data connectors with credentials", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          email: "user1@email.com",
        },
      })
      .projects()
      .landingUserProjects()
      .listNamespaceV2()
      .getProjectV2Permissions()
      .listProjectV2Members()
      .readProjectV2()
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" });
  });

  it("set up data connector with failed connection test", () => {
    fixtures
      .testCloudStorage({ success: false })
      .postDataConnector({ namespace: "user1-uuid", visibility: "public" })
      .postDataConnectorProjectLink({
        dataConnectorId: "ULID-5",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    // .cloudStorage({
    //   isV2: true,
    //   fixture: "cloudStorage/cloud-storage-with-secrets-values-empty.json",
    //   name: "getCloudStorageV2",
    // })
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
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
      "The data connector user1-uuid/example-storage-without-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");

    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should("contain.text", "<sensitive>");
  });

  it("set up data connector with credentials", () => {
    fixtures
      .testCloudStorage({ success: true })
      .postDataConnector({ namespace: "user1-uuid", visibility: "public" })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" })
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
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
      });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    // Pick a provider
    cy.wait("@getStorageSchema");
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.wait("@testCloudStorage");
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage with credentials");
      cy.get("#saveCredentials").should("be.checked");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.wait("@patchDataConnectorSecrets");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/example-storage-with-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "credentials were saved"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );

    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");

    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "<saved secret>"
    );
  });
});
