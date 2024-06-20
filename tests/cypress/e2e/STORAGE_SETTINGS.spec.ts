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
      expect(readonly).to.be.false;
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
