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

describe("Set up project components", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .listNamespaceV2()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .getProjectV2Permissions()
      .listProjectV2Members();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("set up repositories", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .updateProjectV2({
        fixture: "projectV2/update-projectV2-one-repository.json",
      });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // add code repositories
    fixtures.readProjectV2({
      name: "getProjectAfterUpdate",
      fixture: "projectV2/update-projectV2-one-repository.json",
    });
    cy.getDataCy("add-code-repository").click();

    cy.getDataCy("project-add-repository-url").type(
      "gitlab.dev.renku.ch/url-repo"
    );
    cy.getDataCy("add-code-repository-modal-button").click();

    cy.wait("@updateProjectV2");
    cy.wait("@getProjectAfterUpdate");

    // edit code repository
    cy.getDataCy("code-repository-edit").click();
    cy.getDataCy("project-edit-repository-url").type("2");
    cy.getDataCy("edit-code-repository-modal-button").click();
    cy.wait("@updateProjectV2");

    // delete code repository
    cy.getDataCy("button-with-menu-dropdown").first().click();
    cy.getDataCy("code-repository-delete").click();
    cy.getDataCy("delete-code-repository-modal-button").click();
    cy.wait("@updateProjectV2");
  });

  it("set up sessions", () => {
    cy.intercept("/api/data/sessions*", {
      body: [],
    }).as("getSessionsV2");
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .getProjectV2Permissions({ projectId: "01HYJE5FR1JV4CWFMBFJQFQ4RM" })
      .listProjectDataConnectors()
      .getDataConnector()
      .sessionLaunchers()
      .newLauncher()
      .editLauncher()
      .resourcePoolsTest()
      .getResourceClass()
      .environments();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionsV2");
    cy.wait("@sessionLaunchers");
    // ADD SESSION CUSTOM IMAGE
    cy.getDataCy("add-session-launcher").click();

    fixtures.sessionLaunchers({
      fixture: "projectV2/session-launchers.json",
      name: "session-launchers-custom",
    });
    const customImage = "renku/renkulab-py:latest";
    cy.getDataCy("environment-kind-custom").click();
    cy.getDataCy("custom-image-input")
      .clear()
      .type(customImage, { delay: 0 })
      .should("have.value", customImage);
    cy.getDataCy("next-session-button").click();
    cy.getDataCy("launcher-name-input").type("Session-custom");
    cy.getDataCy("add-session-button").click();
    cy.wait("@newLauncher");
    cy.wait("@session-launchers-custom");
    cy.getDataCy("close-cancel-button").click();
    // check session values
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("session-name").should("contain.text", "Session-custom");
      cy.getDataCy("session-status").should("contain.text", "Not Running");
      cy.getDataCy("start-session-button").should("contain.text", "Launch");
    });

    // check session launcher view and edit session launcher
    cy.getDataCy("session-name").click();
    cy.getDataCy("session-view-title").should("contain.text", "Session-custom");
    cy.getDataCy("session-view-menu-edit").should("be.visible");
    cy.get(".offcanvas [data-cy=button-with-menu-dropdown]").first().click();
    cy.getDataCy("session-view-menu-delete").should("be.visible");
    cy.getDataCy("session-view-menu-edit").should("be.visible").click();
    cy.getDataCy("edit-session-name").clear().type("Session custom");
    cy.getDataCy("environment-kind-custom").should("be.visible");
    cy.getDataCy("edit-session-button").click();
    cy.wait("@editLauncher");
    cy.getDataCy("close-cancel-button").click();
    cy.getDataCy("get-back-session-view").click();

    // start session
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("start-session-button").click();
    });
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);

    cy.go("back");

    // ADD SESSION EXISTING ENVIRONMENT
    cy.getDataCy("add-session-launcher").click();
    fixtures.sessionLaunchers({
      fixture: "projectV2/session-launchers-global.json",
      name: "session-launchers-global",
    });
    cy.getDataCy("environment-kind-global").click();
    cy.getDataCy("global-environment-item").first().click();
    cy.getDataCy("next-session-button").click();
    cy.getDataCy("add-session-button").click();
    cy.wait("@newLauncher");
    cy.wait("@session-launchers-global");

    // check session values
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("session-name").should("contain.text", "Jupyter Notebook");
      cy.getDataCy("session-status").should("contain.text", "Not Running");
      cy.getDataCy("start-session-button").should("contain.text", "Launch");
    });
  });
});

describe("Set up data connectors", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .listNamespaceV2()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .getGroupV2Permissions()
      .getProjectV2Permissions()
      .listProjectV2Members();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("create a simple data connector", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .testCloudStorage({ success: false })
      .postDataConnector({ namespace: "user1-uuid", visibility: "public" })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();

    // is polybox visible
    cy.getDataCy("data-storage-polybox")
      .contains("PolyBox")
      .should("be.visible");
    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Validate is shown well the label and the help for passwords in full list
    cy.get("#switch-storage-full-list").click();
    cy.get("label")
      .contains("sse_kms_key_id") // Find the label with the desired text
      .parent() // Go one node above (to the parent div)
      .should(
        "contain.text",
        "If using KMS ID you must provide the ARN of Key"
      );

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
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
  });

  it("link a data connector", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnectorByNamespaceAndSlug()
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-1" });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-link").click();
    cy.get("#data-connector-identifier").type("user1-uuid/example-storage");
    cy.getDataCy("link-data-connector-button").click();
    cy.wait("@postDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
  });

  it("link a data connector not found", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnectorByNamespaceAndSlugNotFound();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-link").click();
    cy.get("#data-connector-identifier").type("user1-uuid/example-storage");
    cy.getDataCy("link-data-connector-button").click();
    cy.wait("@getDataConnectorByNamespaceAndSlugNotFound");
    cy.contains(
      "Data connector with identifier 'user1-uuid/example-storage' does not exist or you do not have access to it."
    ).should("be.visible");
  });

  it("unlink a data connector", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .deleteDataConnectorProjectLink();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    cy.contains("example storage").should("be.visible").click();
    cy.getDataCy("data-connector-credentials")
      .should("be.visible")
      .parent()
      .find("[data-cy=button-with-menu-dropdown]")
      .click();
    cy.getDataCy("data-connector-delete").should("be.visible").click();
    cy.wait("@getProjectV2Permissions");
    cy.contains("Are you sure you want to unlink the data connector").should(
      "be.visible"
    );
    cy.getDataCy("delete-data-connector-modal-button")
      .should("be.enabled")
      .click();
    cy.wait("@deleteDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
  });

  it("unlink data connector not allowed", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .getProjectV2Permissions({
        fixture: "projectV2/projectV2-permissions-viewer.json",
      })
      .deleteDataConnectorProjectLinkNotAllowed();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    cy.contains("example storage").should("be.visible").click();
    cy.getDataCy("data-connector-credentials").should("be.visible");
    cy.getDataCy("data-connector-delete").should("not.exist");
  });

  it("should clear state after a data connector has been created", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .testCloudStorage({ success: false })
      .postDataConnector({ namespace: "user1-uuid", visibility: "public" })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
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
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
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

    // Start adding a second data connector, but cancel
    fixtures.postDataConnectorProjectLink({ shouldNotBeCalled: true });
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
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
      cy.get("#name").type("example storage 2");
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
    });
    cy.getDataCy("project-data-connector-connect-header")
      .find("button.btn-close[aria-label='Close']")
      .click();

    // Now edit a data connector
    fixtures
      .testCloudStorage({ success: true })
      .getDataConnectorPermissions()
      .patchDataConnector({ namespace: "user1-uuid" })
      .patchDataConnectorSecrets({
        shouldNotBeCalled: true,
      });

    cy.contains("example storage").should("be.visible").click();
    cy.getDataCy("data-connector-edit").should("be.visible").click();
    // Fill out the details
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@patchDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/example-storage has been successfully updated."
    );
  });
});
