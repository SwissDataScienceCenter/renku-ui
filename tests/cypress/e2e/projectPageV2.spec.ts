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

describe("Navigate to project page", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .dataServicesUser({
        response: {
          id: "user1-uuid",
          email: "user1@email.com",
        },
      })
      .listProjectV2Members();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("show project information", () => {
    fixtures.readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description"
    );
    cy.getDataCy("project-visibility").should("contain.text", "Public");
    cy.getDataCy("project-namespace").should("contain.text", "user1-uuid");
  });

  it("set up data source", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .postCloudStorage({
        name: "postCloudStorageV2",
        fixture: "cloudStorage/new-cloud-storage_v2.json",
      })
      .cloudStorage({ name: "getCloudStorageV2", isV2: true })
      .deleteCloudStorage({ name: "deleteCloudStorageV2", isV2: true });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // add data source
    cy.getDataCy("add-data-source").click();
    cy.wait("@getStorageSchema");
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("cloud-storage-edit-next-button").click();
    cy.get("#sourcePath").type("giab");
    cy.getDataCy("cloud-storage-edit-next-button").click();
    cy.getDataCy("cloud-storage-edit-mount").within(() => {
      cy.get("#name").type("giab");
    });
    cy.getDataCy("cloud-storage-edit-update-button").click();
    cy.wait("@postCloudStorageV2");
    cy.getDataCy("cloud-storage-edit-body").should(
      "contain.text",
      "The storage example-storage has been succesfully added."
    );
    cy.getDataCy("cloud-storage-edit-close-button").click();
    cy.wait("@getCloudStorageV2");
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("data-source-view-back-button").click();

    cy.getDataCy("data-source-action").first().click();
    cy.getDataCy("data-source-menu").should("be.visible");

    // edit data source
    fixtures.patchCloudStorage({ name: "patchCloudStorage2", isV2: true });
    cy.getDataCy("data-source-edit").click();
    cy.get("#sourcePath").type("2");
    cy.getDataCy("cloud-storage-edit-next-button")
      .filter(":enabled")
      .first()
      .click();
    cy.getDataCy("cloud-storage-edit-update-button")
      .filter(":enabled")
      .first()
      .click();
    cy.wait("@patchCloudStorage2");
    cy.get('button[data-cy="cloud-storage-edit-close-button"]')
      .filter(":visible")
      .first()
      .click();

    // delete data source
    cy.getDataCy("data-source-action").first().click();
    cy.getDataCy("data-source-delete").click();
    cy.getDataCy("delete-data-source-modal-button").click();
    cy.wait("@deleteCloudStorageV2");
  });

  it("set up repositories", () => {
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
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
    cy.getDataCy("add-repository").click();

    cy.getDataCy("add-existing-repository-button").click();
    cy.getDataCy("field-group-url").type("gitlab.dev.renku.ch/url-repo");
    cy.getDataCy("add-code-repository-modal-button").click();

    cy.wait("@updateProjectV2");
    cy.wait("@getProjectAfterUpdate");

    cy.getDataCy("code-repository-actions").first().click();
    cy.getDataCy("code-repository-menu").should("be.visible");

    // edit code repository
    cy.getDataCy("code-repository-edit").click();
    cy.getDataCy("field-group-url").type("2");
    cy.getDataCy("edit-code-repository-modal-button").click();
    cy.wait("@updateProjectV2");

    // delete code repository
    cy.getDataCy("code-repository-actions").first().click();
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
      .sessionLaunchers()
      .newLauncher()
      .editLauncher()
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
    cy.get("#addSessionLauncherName").type("Session-custom");
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
    cy.getDataCy("session-view-menu").click();
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
