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

import fixtures from "../support/renkulab-fixtures";

describe("Add dataset to existing project", () => {
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  const pathOrigin = "e2e/testing-datasets";
  const projectSelected = "e2e/local-test-project";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.landingUserProjects(
      "getLandingUserProjects",
      "projects/member-projects.json"
    );
    fixtures.datasetById({ id: datasetIdentifier });
    fixtures
      .project(pathOrigin, "getProject", "projects/project.json", false)
      .cacheProjectList();
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "migrationCheckDatasetProject",
    });
    fixtures.importToProject();
    fixtures.importJobCompleted();
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.wait("@getLandingUserProjects");
    cy.wait("@getDatasetById");
    cy.wait("@getProject");
    cy.wait("@migrationCheckDatasetProject");
    // verify load dataset info
    cy.getDataCy("add-dataset-to-project-title").should("contain", datasetName);
    cy.getDataCy("add-dataset-existing-project-option-button").should(
      "have.class",
      "active"
    );
    cy.getDataCy("form-project-exist").should("exist");
  });

  it("valid dataset", () => {
    cy.selectProjectFromAutosuggestionList(
      projectSelected,
      fixtures,
      "project/migrationStatus/level1-all-good.json"
    );
    cy.getDataCy("import-dataset-status").should(
      "contain.text",
      "Selected project is compatible with dataset."
    );
    cy.getDataCy("add-dataset-submit-button").should("not.be.disabled");
  });

  it("successfully import dataset", () => {
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectKGDatasetList({ path: projectSelected });
    fixtures.projectDatasetList();
    fixtures.projectTest();
    fixtures.projectLockStatus();
    cy.selectProjectFromAutosuggestionList(
      projectSelected,
      fixtures,
      "project/migrationStatus/level1-all-good.json"
    );
    cy.getDataCy("add-dataset-submit-button").click();
    cy.wait("@importToProject");
    cy.wait("@importJobCompleted", { timeout: 20_000 });
    cy.url().should(
      "include",
      `projects/${projectSelected}/datasets/${datasetName}`
    );
    cy.getDataCy("dataset-title").should("contain.text", datasetName);
  });

  it("error importing dataset", () => {
    cy.selectProjectFromAutosuggestionList(
      projectSelected,
      fixtures,
      "project/migrationStatus/level1-all-good.json"
    );
    fixtures.importJobError();
    cy.getDataCy("add-dataset-submit-button").click();
    cy.wait("@importToProject");
    cy.wait("@importJobError", { timeout: 20_000 });
    cy.getDataCy("import-dataset-status").should(
      "contain.text",
      "Dataset import failed"
    );
  });

  it("error importing from project with different metadata version", () => {
    cy.selectProjectFromAutosuggestionList(
      projectSelected,
      fixtures,
      "project/migrationStatus/level4-old-updatable.json"
    );
    cy.getDataCy("import-dataset-status").contains(
      "cannot be newer than the project metadata version"
    );
    cy.getDataCy("add-dataset-submit-button").should("be.disabled");
  });
});

describe("Add dataset to new project", () => {
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  const pathOrigin = "e2e/testing-datasets";
  const newProjectTitle = "new-project";
  const newProjectPath = `e2e/${newProjectTitle}`;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces().templates();
    fixtures
      .projects()
      .landingUserProjects(
        "getLandingUserProjects",
        "projects/member-projects.json"
      );
    fixtures.datasetById({ id: datasetIdentifier });
    fixtures
      .project(pathOrigin, "getProject", "projects/project.json", false)
      .cacheProjectList();
    fixtures.interceptMigrationCheck(
      "migrationCheckDatasetProject",
      "project/migrationStatus/level1-all-good.json",
      "*"
    );
    cy.visit(`datasets/${datasetIdentifier}/add`);
    fixtures.importToProject();
    fixtures.importJobCompleted();
    cy.wait("@getDatasetById");
    cy.wait("@getProject");
    cy.wait("@migrationCheckDatasetProject");
    // check contain dataset info
    cy.getDataCy("add-dataset-to-project-title").should("contain", datasetName);
    // go to add dataset to new project option
    cy.getDataCy("add-dataset-new-project-option-button").click();
  });

  it("valid dataset, successful import", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheckSelectedProject",
      "project/migrationStatus/level1-all-good.json",
      "*"
    );
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectKGDatasetList({ path: newProjectPath });
    fixtures.projectDatasetList();
    // fill form new project
    cy.createProjectAndAddDataset(newProjectTitle, newProjectPath, fixtures);
    fixtures.project(
      newProjectPath,
      "getNewProject2",
      "projects/project.json",
      true
    );
    cy.wait("@importToProject");
    cy.wait("@importJobCompleted", { timeout: 20_000 });
    cy.url().should(
      "include",
      `projects/${newProjectPath}/datasets/${datasetName}`
    );
    cy.getDataCy("dataset-title").should("contain.text", datasetName);
  });

  it("error importing dataset", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheckSelectedProject",
      "project/migrationStatus/level1-all-good.json",
      "*"
    );
    fixtures.importJobError();
    cy.createProjectAndAddDataset(newProjectTitle, newProjectPath, fixtures);
    cy.wait("@importToProject");
    cy.wait("@importJobError", { timeout: 20_000 });
    cy.getDataCy("import-dataset-status").should(
      "contain.text",
      "Something fail"
    );
  });
});

describe("Invalid dataset", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .landingUserProjects(
        "getLandingUserProjects",
        "projects/member-projects.json"
      );
  });

  it("displays warning when dataset doesn't exist", () => {
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.invalidDataset({ id: datasetIdentifier });
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.wait("@invalidDataset");
    cy.get("h3").contains("Dataset not found").should("be.visible");
  });

  it("displays warning when dataset is invalid", () => {
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.datasetById({ id: datasetIdentifier });
    const pathOrigin = "e2e/testing-datasets";
    fixtures.errorProject(pathOrigin).cacheProjectList();
    fixtures.interceptMigrationCheck(
      "migrationCheckDatasetProject",
      "project/migrationStatus/level1-all-good.json",
      "*"
    );
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.wait("@getDatasetById");
    cy.wait("@getErrorProject");
    cy.getDataCy("add-dataset-submit-button").should("be.disabled");
    cy.getDataCy("import-dataset-status")
      .contains("Invalid Dataset")
      .should("be.visible");
  });
});
