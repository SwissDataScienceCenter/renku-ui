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

import fixtures from "../support/renkulab-fixtures";

describe("Project settings page", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .projectTest()
      .projectById()
      .getProjectKG()
      .projectLockStatus()
      .projectMigrationUpToDate()
      .sessionServersEmpty();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("update project tags", () => {
    fixtures.updateProjectKG({
      fixture: "project/update-project-tag-description.json",
    });
    fixtures.getProjectKG({
      name: "getProjectKGEdited",
      fixture: "project/project-kg-edited.json",
    });
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.getDataCy("keywords-input").should("not.contain.text", "abcde");
    cy.getDataCy("keywords-input").type("abcde");
    cy.getDataCy("projectKeywords-button").click();
    cy.wait("@updateProjectKG");
    cy.wait("@getProjectKGEdited");
    cy.getDataCy("entity-tag-list").should("contain.text", "abcde");
  });

  it("update project visibility - success", () => {
    cy.visit("/projects/e2e/local-test-project/settings");

    // public visibility should be checked
    cy.getDataCy("visibility-public").should("be.checked");

    // cancel a change shouldn't change the visibility
    cy.getDataCy("visibility-private").click();
    cy.get(".modal-title").should(
      "contain.text",
      "Change visibility to Private"
    );
    cy.getDataCy("cancel-visibility-btn").click();
    cy.getDataCy("visibility-public").should("be.checked");

    // changing to internal will works
    fixtures.updateProjectKG({
      fixture: "project/visibility/visibility-change-accepted.json",
    });
    cy.getDataCy("visibility-internal").click();
    cy.getDataCy("update-visibility-btn").click();
    cy.wait("@updateProjectKG");
    cy.get(".modal-body").should(
      "contain.text",
      "The visibility of the project has been modified"
    );
  });

  it("update project visibility - failure", () => {
    cy.visit("/projects/e2e/local-test-project/settings");

    // public visibility should be checked
    cy.getDataCy("visibility-public").should("be.checked");

    // changing to internal won't work if visibility is restricted
    // ? we are slightly cheating here cause we are not disabling the buttons
    cy.getDataCy("visibility-internal").click();
    fixtures.updateProjectKG({
      fixture: "project/visibility/error-update-visibility.json",
      statusCode: 400,
    });
    cy.getDataCy("update-visibility-btn").click();
    cy.wait("@updateProjectKG");
    cy.get(".modal-body").should(
      "contain.text",
      "Internal is not allowed in a private group."
    );
    cy.get(".modal-content .btn-close").click();
  });

  it("update description", () => {
    cy.visit("/projects/e2e/local-test-project/settings");

    // check there is no description
    cy.getDataCy("description-input").should(
      "not.have.value",
      "description abcde"
    );
    cy.getDataCy("entity-description").should(
      "not.contain.text",
      "description abcde"
    );
    cy.getDataCy("entity-description").should(
      "contain.text",
      "This project has no description"
    );

    // edit the description -- load the new fixtures
    cy.getDataCy("description-input").type("description abcde");
    fixtures.updateProjectKG({ fixture: "project/project-kg-edited.json" });
    fixtures.getProjectKG({
      name: "getProjectKGdescription",
      fixture: "project/edit/project-kg-description.json",
    });
    cy.getDataCy("projectDescription-button").click();

    // verify the change goes through but is not immediate everywhere else (E.G. on the header)
    cy.getDataCy("settings-description")
      .get(".success-feedback")
      .contains("Updated");
    cy.getDataCy("description-input").should(
      "not.contain.text",
      "description abcde"
    );

    // Check the header also reflects the change onnce KG processes the metadata
    fixtures.getKgStatus();
    cy.wait("@getProjectKGdescription");
    cy.getDataCy("entity-description").should("contain", "description abcde");
    cy.getDataCy("description-input").should("have.value", "description abcde");
  });

  it("displays project settings sessions", () => {
    fixtures.sessionServerOptions().resourcePoolsTest().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
  });

  it("displays project settings with cloud-storage enabled ", () => {
    fixtures
      .sessionServerOptions({ cloudStorage: true })
      .resourcePoolsTest()
      .projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
  });

  it("displays project settings complete", () => {
    fixtures.sessionServerOptions().resourcePoolsTest().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
    cy.get("button.active").contains("/lab").should("be.visible");
  });

  it("displays project settings error", () => {
    fixtures.sessionServerOptions().projectConfigShow({ error: true });
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("not.exist");
    cy.contains("Error").should("be.visible");
  });

  it("displays project settings legacy error", () => {
    fixtures.sessionServerOptions().projectConfigShow({ legacyError: true });
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("not.exist");
    cy.contains("Error").should("be.visible");
    cy.contains("[Show details]").should("be.visible");
  });

  it("delete a project", () => {
    fixtures.deleteProject();
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.wait("@getProjectKG");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getMigration");

    cy.getDataCy("project-settings-general-delete-project")
      .should("be.visible")
      .find("button")
      .contains("Delete project")
      .should("be.visible")
      .as("delete-button")
      .scrollIntoView();
    cy.get("@delete-button").click();

    cy.contains("Are you absolutely sure?");
    cy.get("button").contains("Yes, delete this project").should("be.disabled");
    cy.get("input[name=project-settings-general-delete-confirm-box]").type(
      "e2e/local-test-project"
    );
    cy.get("button")
      .contains("Yes, delete this project")
      .should("be.enabled")
      .click();
    cy.wait("@deleteProject");

    cy.url().should("not.contain", "/projects");
    cy.get(".Toastify")
      .contains("Project e2e/local-test-project deleted")
      .should("be.visible");
  });

  it("delete a project - not allowed", () => {
    fixtures.userNone();
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.getDataCy("project-settings-general-delete-project").should("not.exist");
  });
});

describe("Cloud storage settings page", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .projectTest()
      .projectById()
      .getProjectKG()
      .projectLockStatus()
      .projectMigrationUpToDate()
      .sessionServersEmpty();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("is accessible from the main settings page", () => {
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.wait("@getProjectKG");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getMigration");
    cy.getDataCy("settings-navbar")
      .contains("Cloud Storage")
      .should("be.visible")
      .click();
    cy.getDataCy("settings-container")
      .contains("Cloud storage settings")
      .should("be.visible");
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/settings/storage"
    );
  });

  it("shows an existing storage", () => {
    fixtures.versions().cloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.getDataCy("cloud-storage-section")
      .find(".card")
      .contains("example-storage")
      .should("be.visible");
    cy.getDataCy("cloud-storage-item")
      .contains("s3/Other")
      .should("be.visible");
    cy.getDataCy("cloud-storage-item")
      .contains("mount/path")
      .should("be.visible");
  });

  it("can update an existing storage", () => {
    fixtures.versions().cloudStorageStar().testCloudStorage();
    fixtures.patchCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.getDataCy("cloud-storage-section")
      .find(".card")
      .contains("example-storage")
      .should("be.visible")
      .click();
    cy.getDataCy("cloud-storage-details-toggle").should("be.visible").click();
    cy.getDataCy("cloud-storage-details-buttons")
      .find("button")
      .contains("Edit")
      .click();

    cy.getDataCy("cloud-storage-edit-header")
      .contains("Edit Cloud Storage")
      .should("be.visible");
    cy.get("#sourcePath")
      .should("have.value", "bucket/source")
      .type("{selectAll}bucket/new-target");
    cy.getDataCy("test-cloud-storage-button")
      .should("be.visible")
      .contains("Test connection")
      .click();
    cy.getDataCy("add-cloud-storage-continue-button")
      .should("be.visible")
      .contains("Continue")
      .click();

    cy.get("#name")
      .should("have.value", "example-storage")
      .type("{selectAll}another-storage");
    cy.get("#mountPoint")
      .should("have.value", "mount/path")
      .type("{selectAll}another/path");

    cy.getDataCy("cloud-storage-edit-update-button")
      .should("be.visible")
      .contains("Update");
    cy.getDataCy("cloud-storage-edit-back-button")
      .should("be.visible")
      .contains("Back")
      .click();

    cy.get("#sourcePath").should("have.value", "bucket/new-target");
    cy.getDataCy("cloud-storage-edit-rest-button").should("be.visible").click();
    cy.get("#sourcePath").should("have.value", "bucket/source");
    cy.getDataCy("test-cloud-storage-button")
      .should("be.visible")
      .contains("Test connection")
      .click();
    cy.getDataCy("add-cloud-storage-continue-button")
      .should("be.visible")
      .contains("Continue")
      .click();
    cy.get("#mountPoint").should("have.value", "mount/path");

    cy.getDataCy("cloud-storage-edit-update-button")
      .should("be.visible")
      .contains("Update")
      .click();
  });

  it("can remove an existing storage", () => {
    fixtures.versions().cloudStorage();
    fixtures.deleteCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.getDataCy("cloud-storage-section")
      .find(".card")
      .contains("example-storage")
      .should("be.visible")
      .click();
    cy.getDataCy("cloud-storage-details-toggle").should("be.visible").click();
    cy.getDataCy("cloud-storage-details-buttons")
      .find("button")
      .contains("Delete")
      .click();

    cy.get(".modal").contains("Are you sure?").should("be.visible");
    cy.get(".modal")
      .find("button")
      .contains("Yes")
      .should("be.visible")
      .click();

    cy.wait("@deleteCloudStorage");
  });

  it("can add new storage (simple)", () => {
    fixtures.getStorageSchema();
    fixtures
      .versions({
        notebooks: { fixture: "version-notebooks.json" },
      })
      .cloudStorage()
      .testCloudStorage();
    fixtures.postCloudStorage().patchCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.getDataCy("cloud-storage-section")
      .find("button")
      .contains("Add Cloud Storage")
      .should("be.visible")
      .click();

    cy.getDataCy("cloud-storage-edit-header")
      .contains("Add Cloud Storage")
      .should("be.visible");

    cy.getDataCy("cloud-storage-edit-schema")
      .contains("webdav")
      .should("be.visible")
      .click();
    cy.getDataCy("cloud-storage-edit-next-button").should("be.visible").click();

    cy.get("#sourcePath").should("have.value", "").type("bucket/my-source");
    cy.getDataCy("test-cloud-storage-button").should("be.visible").click();
    cy.getDataCy("add-cloud-storage-continue-button")
      .should("be.visible")
      .click();

    cy.get("#name").should("have.value", "").type("fake-storage");
    cy.get("#mountPoint").should("have.value", "external_storage/fake-storage");

    cy.getDataCy("cloud-storage-edit-update-button")
      .should("be.visible")
      .contains("Add")
      .click();

    cy.wait("@postCloudStorage").then(({ request }) => {
      const { body } = request;
      const { name, readonly, target_path } = body;

      expect(name).to.equal("fake-storage");
      expect(readonly).to.be.true;
      expect(target_path).to.equal("external_storage/fake-storage");
    });

    cy.getDataCy("cloud-storage-edit-body").contains(
      "storage fake-storage has been successfully added"
    );
    cy.getDataCy("cloud-storage-edit-close-button")
      .should("be.visible")
      .click();
  });
});
