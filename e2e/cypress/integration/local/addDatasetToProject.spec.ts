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

import "../../support/utils";
import Fixtures from "../../support/renkulab-fixtures";
import "../../support/datasets/gui_commands";

describe("Add dataset to existing project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  const pathOrigin = "e2e/testing-datasets";
  const projectSelected = "e2e/local-test-project";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects("getLandingUserProjects", "projects/member-projects.json");
    fixtures.datasetById(datasetIdentifier);
    fixtures.project(pathOrigin, "getProject", "projects/project.json", false).cacheProjectList();
    fixtures.interceptMigrationCheck("migrationCheckDatasetProject", "projects/migration-check_43781.json", "*");
    fixtures.importToProject();
    fixtures.importJobCompleted();
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.wait("@getLandingUserProjects");
    cy.wait("@getProjects");
    cy.wait("@getDatasetById");
    cy.wait("@getProject");
    cy.wait("@migrationCheckDatasetProject");
    // verify load dataset info
    cy.get_cy("add-dataset-to-project-title").should("contain", datasetName);
    cy.get_cy("add-dataset-existing-project-option-button").should("have.class", "active");
    cy.get_cy("form-project-exist").should("exist");
  });

  it("valid dataset", () => {
    cy.gui_select_project_autosuggestion_list(projectSelected, fixtures, "projects/migration-check_43781.json");
    cy.get_cy("import-dataset-status").should("contain.text", "Selected project is compatible with dataset.");
    cy.get_cy("add-dataset-submit-button").should("not.be.disabled");
  });

  it("successfully import dataset", () => {
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectKGDatasetList(projectSelected);
    fixtures.projectDatasetList();
    fixtures.projectTest();
    cy.gui_select_project_autosuggestion_list(projectSelected, fixtures, "projects/migration-check_43781.json");
    cy.get_cy("add-dataset-submit-button").click();
    cy.wait("@importToProject");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.wait("@importJobCompleted");
    cy.url().should("include", `projects/${ projectSelected }/datasets/${ datasetName }`);
    cy.get_cy("dataset-title").should("contain.text", datasetName);
  });

  it("error importing dataset", () => {
    cy.gui_select_project_autosuggestion_list(projectSelected, fixtures, "projects/migration-check_43781.json");
    fixtures.importJobError();
    cy.get_cy("add-dataset-submit-button").click();
    cy.wait("@importToProject");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.get_cy("import-dataset-status").should("contain.text", "Something fail");
  });

  it("error importing from project with different metadata version", () => {
    cy.gui_select_project_autosuggestion_list(projectSelected, fixtures, "projects/migration-check_43781-old.json");
    cy.get_cy("import-dataset-status").contains("cannot be newer than the project metadata version");
    cy.get_cy("add-dataset-submit-button").should("be.disabled");
  });
});

describe("Add dataset to new project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  const pathOrigin = "e2e/testing-datasets";
  const newProjectTitle = "new-project";
  const newProjectPath = `e2e/${newProjectTitle}`;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces().templates();
    fixtures.projects().landingUserProjects("getLandingUserProjects", "projects/member-projects.json");
    fixtures.datasetById(datasetIdentifier);
    fixtures.project(pathOrigin, "getProject", "projects/project.json", false).cacheProjectList();
    fixtures.interceptMigrationCheck("migrationCheckDatasetProject", "projects/migration-check_43781.json", "*");
    cy.visit(`datasets/${datasetIdentifier}/add`);
    fixtures.importToProject();
    fixtures.importJobCompleted();
    cy.wait("@getDatasetById");
    cy.wait("@getProject");
    cy.wait("@migrationCheckDatasetProject");
    // check contain dataset info
    cy.get_cy("add-dataset-to-project-title").should("contain", datasetName);
    // go to add dataset to new project option
    cy.get_cy("add-dataset-new-project-option-button").click();
  });

  it("valid dataset, successful import", () => {
    fixtures.interceptMigrationCheck("migrationCheckSelectedProject", "projects/migration-check_43781.json", "*");
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectKGDatasetList(newProjectPath);
    fixtures.projectDatasetList();
    // fill form new project
    cy.gui_create_project_add_dataset(newProjectTitle, newProjectPath, fixtures);
    fixtures.project(newProjectPath, "getNewProject2", "projects/project.json", true);
    cy.wait("@importToProject");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500); // necessary because request the job status is called in a interval
    cy.wait("@importJobCompleted");
    cy.url().should("include", `projects/${ newProjectPath }/datasets/${ datasetName }`);
    cy.get_cy("dataset-title").should("contain.text", datasetName);
  });

  it("error importing dataset", () => {
    fixtures.interceptMigrationCheck("migrationCheckSelectedProject", "projects/migration-check_43781.json", "*");
    fixtures.importJobError();
    cy.gui_create_project_add_dataset(newProjectTitle, newProjectPath, fixtures);
    cy.wait("@importToProject");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.get_cy("import-dataset-status").should("contain.text", "Something fail");
  });

});

describe("Invalid dataset", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects("getLandingUserProjects", "projects/member-projects.json");
  });

  it("displays warning when dataset doesn't exist", () => {
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.invalidDataset(datasetIdentifier);
    cy.visit(`datasets/${ datasetIdentifier }/add`);
    cy.wait("@invalidDataset");
    cy.get("h3").contains("Dataset not found").should("be.visible");
  });

  it("displays warning when dataset is invalid", () => {
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.datasetById(datasetIdentifier);
    const pathOrigin = "e2e/testing-datasets";
    fixtures.errorProject(pathOrigin).cacheProjectList();
    fixtures.interceptMigrationCheck("migrationCheckDatasetProject", "projects/migration-check_43781.json", "*");
    cy.visit(`datasets/${ datasetIdentifier }/add`);
    cy.wait("@getDatasetById");
    cy.wait("@getErrorProject");
    cy.get_cy("add-dataset-submit-button").should("be.disabled");
    cy.get_cy("import-dataset-status").contains("Invalid Dataset").should("be.visible");
  });
});
