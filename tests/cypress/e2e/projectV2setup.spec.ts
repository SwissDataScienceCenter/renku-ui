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
          email: "user1@email.com",
        },
      })
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

  it("delete a data connector", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .deleteDataConnectorProjectLink();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    cy.contains("example storage").should("be.visible").click();
    openDataConnectorMenu();
    cy.getDataCy("data-connector-delete").should("be.visible").click();
    cy.contains("Are you sure you want to unlink the data connector").should(
      "be.visible"
    );
    cy.getDataCy("delete-data-connector-modal-button")
      .should("be.enabled")
      .click();
    cy.wait("@deleteDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
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

    cy.getDataCy("add-existing-repository-button").click();
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
    cy.intercept("/ui-server/api/notebooks/servers*", {
      body: { servers: {} },
    }).as("getSessions");
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
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
    cy.wait("@getSessions");
    cy.wait("@sessionLaunchers");
    // ADD SESSION CUSTOM IMAGE
    cy.getDataCy("add-session-launcher").click();

    fixtures.sessionLaunchers({
      fixture: "projectV2/session-launchers.json",
      name: "session-launchers-custom",
    });
    const customImage = "renku/renkulab-py:latest";
    cy.getDataCy("add-custom-image").click();
    cy.getDataCy("custom-image-input")
      .clear()
      .type(customImage, { delay: 0 })
      .should("have.value", customImage);
    cy.getDataCy("launcher-name-input").type("Session-custom");
    cy.getDataCy("add-launcher-custom-button").click();
    cy.wait("@newLauncher");
    cy.wait("@session-launchers-custom");

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
    cy.getDataCy("edit-session-type-custom").should("be.visible");
    cy.getDataCy("edit-session-type-existing").should("be.visible");
    cy.getDataCy("edit-session-button").click();
    cy.wait("@editLauncher");
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
    cy.getDataCy("add-existing-environment").click();
    cy.getDataCy("global-environment-item").first().click();
    cy.getDataCy("add-session-launcher-button").click();
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
