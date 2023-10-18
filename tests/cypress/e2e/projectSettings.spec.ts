/// <reference types="cypress" />
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

import "../support/utils";
import Fixtures from "../support/renkulab-fixtures";

describe("Project settings page", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .projectTest()
      .projectById("getProjectsById", 39646)
      .getProjectKG()
      .projectLockStatus()
      .projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("update project tags", () => {
    fixtures.updateProjectKG(
      "updateProjectKG",
      "project/update-project-tag-description.json",
      200
    );
    fixtures.getProjectKG({
      name: "getProjectKGEdited",
      result: "project/project-kg-edited.json",
    });
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("keywords-input").should("not.contain.text", "abcde");
    cy.get_cy("keywords-input").type("abcde");
    cy.get_cy("projectKeywords-button").click();
    cy.wait("@updateProjectKG");
    cy.wait("@getProjectKGEdited");
    cy.get_cy("entity-tag-list").should("contain.text", "abcde");
  });

  it("update project visibility - success", () => {
    cy.visit("/projects/e2e/local-test-project/settings");

    // public visibility should be checked
    cy.get_cy("visibility-public").should("be.checked");

    // cancel a change shouldn't change the visibility
    cy.get_cy("visibility-private").click();
    cy.get(".modal-title").should(
      "contain.text",
      "Change visibility to Private"
    );
    cy.get_cy("cancel-visibility-btn").click();
    cy.get_cy("visibility-public").should("be.checked");

    // changing to internal will works
    fixtures.updateProjectKG(
      "updateProjectKG",
      "project/visibility/visibility-change-accepted.json",
      200
    );
    cy.get_cy("visibility-internal").click();
    cy.get_cy("update-visibility-btn").click();
    cy.wait("@updateProjectKG");
    cy.get(".modal-body").should(
      "contain.text",
      "The visibility of the project has been modified"
    );
  });

  it("update project visibility - failure", () => {
    cy.visit("/projects/e2e/local-test-project/settings");

    // public visibility should be checked
    cy.get_cy("visibility-public").should("be.checked");

    // changing to internal won't work if visibility is restricted
    // ? we are slightly cheating here cause we are not disabling the buttons
    cy.get_cy("visibility-internal").click();
    fixtures.updateProjectKG(
      "updateProjectKG",
      "project/visibility/error-update-visibility.json",
      400
    );
    cy.get_cy("update-visibility-btn").click();
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
    cy.get_cy("description-input").should(
      "not.have.value",
      "description abcde"
    );
    cy.get_cy("entity-description").should(
      "not.contain.text",
      "description abcde"
    );
    cy.get_cy("entity-description").should(
      "contain.text",
      "This project has no description"
    );

    // edit the description -- load the new fixtures
    cy.get_cy("description-input").type("description abcde");
    fixtures.updateProjectKG(
      "updateProjectKG",
      "project/project-kg-edited.json"
    );
    fixtures.getProjectKG({
      name: "getProjectKGdescription",
      result: "project/edit/project-kg-description.json",
    });
    cy.get_cy("projectDescription-button").click();

    // verify the change goes through but is not immediate everywhere else (E.G. on the header)
    cy.get_cy("settings-description")
      .get(".success-feedback")
      .contains("Updated");
    cy.get_cy("description-input").should(
      "not.contain.text",
      "description abcde"
    );

    // Check the header also reflects the change onnce KG processes the metadata
    fixtures.getKgStatus();
    cy.wait("@getProjectKGdescription");
    cy.get_cy("entity-description").should("contain", "description abcde");
    cy.get_cy("description-input").should("have.value", "description abcde");
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
    fixtures.sessionServerOptions(true).resourcePoolsTest().projectConfigShow();
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

    cy.get_cy("project-settings-general-delete-project")
      .should("be.visible")
      .find("button")
      .contains("Delete project")
      .should("be.visible")
      .click();

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
    cy.get_cy("project-settings-general-delete-project").should("not.exist");
  });
});

describe("Cloud storage settings page", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .projectTest()
      .projectById("getProjectsById", 39646)
      .getProjectKG()
      .projectLockStatus()
      .projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("is accessible from the main settings page", () => {
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("settings-navbar")
      .contains("Cloud Storage")
      .should("be.visible")
      .click();
    cy.get_cy("settings-container")
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

    cy.get_cy("settings-container")
      .find(".card")
      .contains("Example storage")
      .should("be.visible");
    cy.get_cy("settings-container")
      .find(".card")
      .contains("bucket/source")
      .should("be.visible");
    cy.get_cy("settings-container")
      .find(".card")
      .contains("mount/path")
      .should("be.visible");
  });

  it("can update an existing storage", () => {
    fixtures.versions().cloudStorage();
    fixtures.patchCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.get_cy("settings-container")
      .find(".card")
      .contains("Example storage")
      .should("be.visible")
      .click();
    cy.get_cy("settings-container")
      .find(".card")
      .find("button")
      .contains("Edit")
      .should("be.visible")
      .click();

    cy.get("label").contains("Name").click();
    cy.get(":focused").type("{selectAll}My special storage");

    cy.get("label").contains("Source path").click();
    cy.get(":focused").type("/subfolder");

    cy.get("label").contains("Mount point").click();
    cy.get(":focused").type("{selectAll}/mnt/special");

    cy.get("label")
      .contains("Requires credentials")
      .click()
      .siblings("input")
      .should("not.be.checked");

    if (Cypress.env("CLOUD_STORAGE_READWRITE_ENABLED")) {
      cy.get("label")
        .contains("Read/Write")
        .click()
        .siblings("input")
        .should("be.checked");
      cy.get("label")
        .contains("Read-only")
        .siblings("input")
        .should("not.be.checked");
    }

    cy.get("button[type='submit']")
      .contains("Save changes")
      .should("be.visible")
      .click();

    cy.wait("@patchCloudStorage").then(({ request }) => {
      const { body } = request;
      const {
        name,
        private: isPrivate,
        readonly,
        source_path,
        target_path,
      } = body;

      expect(name).to.equal("My special storage");
      expect(isPrivate).to.be.false;
      expect(readonly).to.be.undefined;
      expect(source_path).to.equal("bucket/source/subfolder");
      expect(target_path).to.equal("/mnt/special");
    });
  });

  it("can remove an existing storage", () => {
    fixtures.versions().cloudStorage();
    fixtures.deleteCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.get_cy("settings-container")
      .find(".card")
      .contains("Example storage")
      .should("be.visible")
      .click();

    cy.get_cy("settings-container")
      .find(".card")
      .find("button")
      .contains("Delete")
      .should("be.visible")
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
    fixtures
      .versions(undefined, {
        core: "version-core.json",
        notebooks: "version-notebooks-s3.json",
        ui: "version-ui.json",
      })
      .cloudStorage();
    fixtures.postCloudStorage().patchCloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
    cy.wait("@getNotebooksVersions");
    cy.wait("@getCloudStorage");

    cy.get_cy("settings-container")
      .find("button")
      .contains("Add Cloud Storage")
      .should("be.visible")
      .click();

    cy.get(".modal").contains("Add Cloud Storage").should("be.visible");

    cy.get("label").contains("Name").click();
    cy.get(":focused").type("My new storage");

    cy.get(".modal")
      .contains("For AWS S3 buckets, supported URLs are of the form")
      .should("be.visible");
    cy.get("label").contains("Endpoint URL").click();
    cy.get(":focused").type("s3://data.s3.eu-central-2.amazonaws.com/folder");

    cy.get("label")
      .contains("Requires credentials")
      .siblings("input")
      .should("be.checked");

    if (Cypress.env("CLOUD_STORAGE_READWRITE_ENABLED")) {
      cy.get("label")
        .contains("Read/Write")
        .click()
        .siblings("input")
        .should("be.checked");
      cy.get("label")
        .contains("Read-only")
        .siblings("input")
        .should("not.be.checked");
    }

    cy.get("button[type='submit']")
      .contains("Add Storage")
      .should("be.visible")
      .click();

    cy.wait("@postCloudStorage").then(({ request }) => {
      const { body } = request;
      const { name, private: isPrivate, readonly, target_path } = body;

      expect(name).to.equal("My new storage");
      expect(isPrivate).to.be.true;
      expect(readonly).to.equal(
        !Cypress.env("CLOUD_STORAGE_READWRITE_ENABLED")
      );
      expect(target_path).to.equal("My new storage");
    });

    cy.get(".modal").contains("Please select which credentials are required");

    cy.get("label")
      .contains("first")
      .click()
      .siblings("input")
      .should("be.checked");

    cy.get("label")
      .contains("second")
      .siblings("input")
      .should("not.be.checked");

    cy.get("button[type='submit']")
      .contains("Finish cloud storage setup")
      .should("be.visible")
      .click();

    cy.wait("@patchCloudStorage").then(({ request }) => {
      const { body } = request;
      const { configuration } = body;

      expect(configuration).to.haveOwnProperty("first");
      expect(configuration["first"]).to.equal("<sensitive>");
      expect(configuration).not.to.haveOwnProperty("second");
    });
  });
});
