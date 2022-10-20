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

import Fixtures from "../../support/renkulab-fixtures";
import "../../support/datasets/gui_commands";
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
    // fixtures.uploadDatasetFile();
    fixtures.createDataset();
    fixtures.addFileDataset();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration"
    });
    fixtures.projectLockStatus();
  });

  it("complete new dataset", () => {
    fixtures.uploadDatasetFile();
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getProject");
    cy.gui_new_dataset({
      title: "New dataset completed",
      creators: {
        name: "Name Creator",
        email: "email@creator.com",
        affiliation: "SDSC"
      },
      keywords: ["test key 1", "key 2"],
      description: "This is a dataset description",
      file: "count_flights.txt",
      image: "sdsc.jpeg"
    });
    cy.wait("@uploadDatasetFile");
    cy.get_cy("submit-button").click();
    cy.wait("@createDataset");
    cy.wait("@addFile");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false });
    cy.url().should("include", `projects/${projectPath}/datasets/new-dataset-completed/`);
  });

  it("upload dataset file", () => {
    cy.visit(`projects/${projectPath}/datasets/new`);
    const options = {
      override_existing: true,
      unpack_archive: true,
      statusCode: 200,
    };
    fixtures.uploadDatasetFile("cacheProjectListOnProgress", "datasets/upload-dataset-multiple-files.json", options);
    cy.wait("@getProject");
    cy.wait("@getProjectLockStatus");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false });
    cy.gui_new_dataset({
      title: "New dataset completed",
    });
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/datasetFiles.zip", { subjectType: "drag-n-drop" });
    cy.get_cy("upload-compressed-yes").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false });
    cy.wait("@cacheProjectListOnProgress");
    cy.get_cy("file-name-column").contains("Show unzipped files");
    cy.get_cy("display-zip-files-link").click();
    cy.get_cy("file-name-column").contains("New Folder With Items");
    cy.get_cy("delete-file-button").click();
    cy.get_cy("file-name-column").should("not.exist");
    // load multiple files
    fixtures.uploadDatasetFile();
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/datasetFiles.zip", { subjectType: "drag-n-drop" });
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/bigFile.bin", { subjectType: "drag-n-drop" });
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/count_flights.txt", { subjectType: "drag-n-drop" });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false });
    cy.wait("@uploadDatasetFile");
    cy.get_cy("file-name-column").should("have.length", 3);
  });

  it("error upload dataset file", () => {
    cy.visit(`projects/${projectPath}/datasets/new`);
    const options = {
      override_existing: true,
      statusCode: 500,
    };
    fixtures.uploadDatasetFile("errorUploadFile", "", options);
    cy.wait("@getProject");
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/bigFile.bin", { subjectType: "drag-n-drop" });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false });
    cy.wait("@errorUploadFile");
    cy.get_cy("upload-error-message").contains("Server responded with 500 code.");
  });
});

