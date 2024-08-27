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

function openDataSourceMenu() {
  cy.getDataCy("data-source-edit")
    .parent()
    .find("[data-cy=button-with-menu-dropdown]")
    .first()
    .click();
}

describe("Set up data sources with credentials", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          email: "user1@email.com",
        },
      })
      .listProjectV2Members();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("set up data source with failed connection test", () => {
    fixtures
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .postCloudStorage({
        name: "postCloudStorageV2",
        fixture: "cloudStorage/new-cloud-storage_v2.json",
      })
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-empty.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-empty.json",
      })
      .testCloudStorage({ success: false })
      .postCloudStorageSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // add data source
    cy.getDataCy("add-data-source").click();
    cy.wait("@getStorageSchema");
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("cloud-storage-edit-next-button").click();
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-cloud-storage-button").click();
    cy.getDataCy("add-cloud-storage-continue-button").contains("Skip").click();
    cy.getDataCy("cloud-storage-edit-mount").within(() => {
      cy.get("#name").type("example-storage");
    });
    cy.getDataCy("cloud-storage-edit-update-button").click();
    cy.wait("@postCloudStorageV2");
    cy.getDataCy("cloud-storage-edit-body").should(
      "contain.text",
      "The storage example-storage has been successfully added."
    );
    cy.getDataCy("cloud-storage-edit-close-button").click();
    cy.wait("@getCloudStorageV2");

    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should("contain.text", "<sensitive>");
    cy.getDataCy("data-source-view-back-button").click();
  });

  it("set up data source with credentials", () => {
    fixtures
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .postCloudStorage({
        name: "postCloudStorageV2",
        fixture: "cloudStorage/new-cloud-storage_v2.json",
      })
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-full.json",
        name: "getCloudStorageV2",
      })
      .postCloudStorageSecrets({
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
      .testCloudStorage({ success: true });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // add data source
    cy.getDataCy("add-data-source").click();
    cy.wait("@getStorageSchema");
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("cloud-storage-edit-next-button").click();
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-cloud-storage-button").click();
    cy.getDataCy("add-cloud-storage-continue-button")
      .contains("Continue")
      .click();
    cy.getDataCy("cloud-storage-edit-mount").within(() => {
      cy.get("#name").type("example-storage");
      cy.get("#saveCredentials").should("be.checked");
    });
    cy.getDataCy("cloud-storage-edit-update-button").click();
    fixtures.cloudStorageSecrets({
      fixture: "cloudStorage/cloud-storage-secrets.json",
      name: "getCloudStorageSecrets2",
    });
    cy.wait("@postCloudStorageV2");
    cy.wait("@postCloudStorageSecrets");
    cy.getDataCy("cloud-storage-edit-body").should(
      "contain.text",
      "The storage example-storage has been successfully added."
    );
    cy.getDataCy("cloud-storage-edit-close-button").click();
    cy.wait("@getCloudStorageV2");
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "<saved secret>"
    );
    cy.getDataCy("data-source-view-back-button").click();
  });

  it("set credentials for a data source", () => {
    fixtures
      .testCloudStorage()
      .sessionServersEmpty()
      .sessionImage()
      .resourcePoolsTest()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-empty.json",
        name: "getCloudStorageV2",
      })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-empty.json",
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");
    // Credentials should not yet be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should("contain.text", "<sensitive>");
    cy.getDataCy("data-source-view-back-button").click();

    // set credentials
    openDataSourceMenu();
    cy.getDataCy("data-source-credentials").click();
    fixtures
      .postCloudStorageSecrets({
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
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets.json",
      })
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-full.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets.json",
        name: "getCloudStorageSecrets2",
      });

    cy.getDataCy("cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("Test and Save")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@postCloudStorageSecrets");
    cy.wait("@getCloudStorageV2");

    // Credentials should be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "<saved secret>"
    );
    cy.getDataCy("data-source-view-back-button").click();
    // edit data source, without touching the credentials
    openDataSourceMenu();
    cy.getDataCy("data-source-edit").click();
    cy.getDataCy("cloud-storage-edit-modal")
      .find("#access_key_id")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
    cy.getDataCy("cloud-storage-edit-modal")
      .find("#secret_access_key")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
  });

  it("edit a data source with credentials", () => {
    fixtures.testCloudStorage();
    fixtures
      .testCloudStorage()
      .sessionServersEmpty()
      .sessionImage()
      .resourcePoolsTest()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-partial.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-partial.json",
      })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .postCloudStorage({
        name: "postCloudStorageV2",
        fixture: "cloudStorage/new-cloud-storage_v2.json",
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");
    // Credentials should be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("secret_access_key-value").should(
      "contain.text",
      "<saved secret>"
    );
    cy.getDataCy("data-source-view-back-button").click();

    // edit data source, without touching the credentials
    openDataSourceMenu();
    cy.getDataCy("data-source-edit").click();
    cy.getDataCy("cloud-storage-edit-modal")
      .find("#access_key_id")
      .invoke("attr", "value")
      .should("eq", "<sensitive>");
    cy.getDataCy("cloud-storage-edit-modal")
      .find("#secret_access_key")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
    cy.getDataCy("cloud-storage-edit-modal").contains("Next").click();

    fixtures.patchCloudStorage({ name: "patchCloudStorage", isV2: true });
    cy.getDataCy("cloud-storage-edit-modal").contains("Update storage").click();
    cy.wait("@patchCloudStorage");
  });

  it("edit credentials for a data source", () => {
    fixtures
      .testCloudStorage()
      .sessionServersEmpty()
      .sessionImage()
      .resourcePoolsTest()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-partial.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-partial.json",
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");
    // Credentials should be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("secret_access_key-value").should(
      "contain.text",
      "<saved secret>"
    );
    cy.getDataCy("data-source-view-back-button").click();

    // update credentials without clearing
    openDataSourceMenu();
    cy.getDataCy("data-source-credentials").click();

    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("The saved credentials for this data source are incomplete")
      .should("be.visible");

    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("Test and Save")
      .click();
    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("Please provide a value for access_key_id")
      .should("be.visible");
    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("Please provide a value for secret_access_key")
      .should("be.visible");

    fixtures
      .postCloudStorageSecrets({
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
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-full.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets.json",
      });

    cy.getDataCy("cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .clear()
      .type("secret key");
    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("Test and Save")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@postCloudStorageSecrets");

    // Credentials should be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "<saved secret>"
    );
  });

  it("clear credentials for a data source", () => {
    fixtures
      .testCloudStorage()
      .sessionServersEmpty()
      .sessionImage()
      .resourcePoolsTest()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets-values-partial.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-partial.json",
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");
    // Credentials should be stored
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("secret_access_key-value").should(
      "contain.text",
      "<saved secret>"
    );
    cy.getDataCy("data-source-view-back-button").click();

    // clear credentials
    openDataSourceMenu();
    cy.getDataCy("data-source-credentials").click();

    fixtures.deleteCloudStorageSecrets().cloudStorageSecrets({
      fixture: "cloudStorage/cloud-storage-secrets-empty.json",
    });

    cy.getDataCy("cloud-storage-credentials-modal")
      .contains("The saved credentials for this data source are incomplete")
      .should("be.visible");

    cy.getDataCy("cloud-storage-credentials-modal").contains("Clear").click();

    cy.wait("@deleteCloudStorageSecrets");

    // Credentials should be changed
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("access_key_id-value").should("contain.text", "<sensitive>");
    cy.getDataCy("data-source-view-back-button").click();
  });
});
