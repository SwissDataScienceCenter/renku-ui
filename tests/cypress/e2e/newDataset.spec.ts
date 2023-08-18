/// <reference types="cypress" />
/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import Fixtures from "../support/renkulab-fixtures";
import "../support/datasets/gui_commands";
import "cypress-file-upload";

describe("Project new dataset", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath).cacheProjectList();
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.addFileDataset();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.wait("@datasetList");
  });

  it("complete new dataset", () => {
    fixtures.createDataset();
    fixtures.uploadDatasetFile();
    cy.gui_new_dataset({
      title: "New dataset completed",
      keywords: ["test key 1", "key 2"],
      description: "This is a dataset description",
      file: "count_flights.txt",
      image: "sdsc.jpeg",
    });
    cy.wait("@uploadDatasetFile");
    // check that the default creator was added
    cy.get("input[name=default-creator]")
      .should("be.disabled")
      .should("have.value", "E2E User (e2e@renku.ch)");
    cy.get_cy("submit-button").click();
    cy.wait("@createDataset", { timeout: 20_000 });
    cy.wait("@addFile");
    cy.url().should(
      "include",
      `projects/${projectPath}/datasets/new-dataset-completed`
    );
  });

  it("complete new dataset with non-default creator", () => {
    fixtures.createDataset();
    fixtures.uploadDatasetFile();
    cy.gui_new_dataset({
      title: "New dataset completed",
      creators: {
        name: "Name Creator",
        email: "email@creator.com",
        affiliation: "SDSC",
      },
      keywords: ["test key 1", "key 2"],
      description: "This is a dataset description",
      file: "count_flights.txt",
      image: "sdsc.jpeg",
    });
    cy.wait("@uploadDatasetFile");
    // There should be a default creator and a non-default creator
    cy.get("input[name=default-creator]")
      .should("be.disabled")
      .should("have.value", "E2E User (e2e@renku.ch)");
    cy.get_cy("creator-email").should("have.value", "email@creator.com");
    cy.get_cy("submit-button").click();
    cy.wait("@createDataset", { timeout: 20_000 });
    cy.wait("@addFile");
    cy.url().should(
      "include",
      `projects/${projectPath}/datasets/new-dataset-completed`
    );
  });

  it("resets form when going to a new project", () => {
    const secondProjectPath = "e2e/random-project";
    fixtures.project(secondProjectPath);
    fixtures.createDataset();
    fixtures.uploadDatasetFile();
    cy.gui_new_dataset({
      title: "New dataset completed",
      creators: {
        name: "Name Creator",
        email: "email@creator.com",
        affiliation: "SDSC",
      },
      keywords: ["test key 1", "key 2"],
      description: "This is a dataset description",
      file: "count_flights.txt",
      image: "sdsc.jpeg",
    });
    // check that the default creator was added
    cy.get("input[name=default-creator]")
      .should("be.disabled")
      .should("have.value", "E2E User (e2e@renku.ch)");
    cy.get_cy("creator-email").should("have.value", "email@creator.com");

    // Visit a new project and check that the form was cleared
    cy.visit(`projects/${secondProjectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.wait("@datasetList");
    cy.get_cy("input-title").should("have.value", "");
    cy.get("input[name=default-creator]")
      .should("be.disabled")
      .should("have.value", "E2E User (e2e@renku.ch)");
    cy.get_cy("creator-email").should("not.exist");
  });

  it("upload dataset file", () => {
    fixtures.uploadDatasetFile(
      "multipleFilesUpload",
      "datasets/upload-dataset-multiple-files.json",
      {
        override_existing: true,
        unpack_archive: true,
        statusCode: 200,
      }
    );
    cy.gui_new_dataset({
      title: "New dataset completed",
    });
    cy.get('[data-cy="dropzone"]').attachFile(
      "/datasets/files/datasetFiles.zip",
      { subjectType: "drag-n-drop" }
    );
    cy.get_cy("upload-compressed-yes").click();
    cy.wait("@multipleFilesUpload");
    cy.get_cy("file-name-column").contains("Show unzipped files");
    cy.get_cy("display-zip-files-link").click();
    cy.get_cy("file-name-column").contains("New Folder With Items");
    cy.get_cy("delete-file-button").click();
    cy.get_cy("file-name-column").should("not.exist");

    // load multiple files
    fixtures.uploadDatasetFile();
    cy.get('[data-cy="dropzone"]').attachFile(
      "/datasets/files/datasetFiles.zip",
      { subjectType: "drag-n-drop" }
    );
    cy.get('[data-cy="dropzone"]').attachFile("/datasets/files/bigFile.bin", {
      subjectType: "drag-n-drop",
    });
    cy.get('[data-cy="dropzone"]').attachFile(
      "/datasets/files/count_flights.txt",
      { subjectType: "drag-n-drop" }
    );
    cy.wait("@uploadDatasetFile");
    cy.get_cy("file-name-column").should("have.length", 3);
  });

  it("error upload dataset file", () => {
    const options = {
      override_existing: true,
      statusCode: 500,
    };
    fixtures.uploadDatasetFile("errorUploadFile", "", options);
    cy.get('[data-cy="dropzone"]').attachFile("/datasets/files/bigFile.bin", {
      subjectType: "drag-n-drop",
    });
    cy.wait("@errorUploadFile", { timeout: 10_000 });
    cy.get_cy("upload-error-message").contains(
      "Server responded with 500 code."
    );
    cy.get_cy("submit-button").click();
    cy.get("div.error-feedback")
      .contains("Please fix problems in the following fields: Title, Files")
      .should("exist");
  });

  it("shows error on empty title", () => {
    fixtures.createDataset(
      "createDatasetError",
      "datasets/create-dataset-title-error.json"
    );
    cy.get_cy("submit-button").click();
    cy.get("div.error-feedback")
      .contains("Please fix problems")
      .should("exist");
  });

  it("shows error on invalid title", () => {
    fixtures.createDataset(
      "createDatasetError",
      "datasets/create-dataset-title-error.json"
    );
    cy.gui_new_dataset({
      title: "test@",
    });
    cy.get_cy("submit-button").click();
    cy.wait("@createDatasetError");
    cy.get("div.alert-danger")
      .contains("Errors occurred while performing this operation.")
      .should("exist");
  });
});

describe("Project new dataset without access", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  const projectPath = "e2e/local-test-project";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTestObserver();
    fixtures.projectLockStatus();
    fixtures.cacheProjectList();
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.createDataset();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
  });

  it("correctly handles missing access", () => {
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.contains("If you were recently given access").should("be.visible");
  });
});

describe("Project import dataset", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath).cacheProjectList();
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
    fixtures.importToProject();
  });

  it("import dataset", () => {
    fixtures.importJobCompleted();
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.wait("@datasetList");
    cy.contains("Import").click();
    cy.get_cy("input-uri")
      .click()
      .type("https://www.doi.org/10.7910/DVN/WTZS4K");
    cy.get_cy("submit-button").click();
    cy.wait("@importToProject");
    cy.contains("Creating Dataset...").should("be.visible");
    cy.wait("@importJobCompleted", { timeout: 20000 });
    cy.wait("@datasetList");
    cy.contains("Datasets List").should("be.visible");
  });

  it("shows error on invalid url", () => {
    fixtures.importJobError();
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.wait("@datasetList");
    cy.contains("Import").click();
    cy.get_cy("input-uri")
      .click()
      .type("https://www.doi.org/10.7910/DVN/WTZS4K");
    cy.get_cy("submit-button").click();
    cy.wait("@importToProject");
    cy.contains("Creating Dataset...").should("be.visible");
    cy.wait("@importJobError", { timeout: 20000 });
    cy.contains("Errors occurred while performing this operation.").should(
      "be.visible"
    );
  });
});
