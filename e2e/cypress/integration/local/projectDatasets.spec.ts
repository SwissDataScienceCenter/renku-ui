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

import "../../support/utils";
import Fixtures from "../../support/renkulab-fixtures";
import "../../support/datasets/gui_commands";

function checkDatasetInKg(cy, fixtures, projectPath) {
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  fixtures.datasetById(datasetIdentifier);
  cy.visit(`projects/${projectPath}/datasets/${datasetName}`);
  cy.wait("@getProject");
  cy.wait("@datasetList");
  cy.wait("@getDatasetById");
  cy.get_cy("add-to-project-button").should("be.enabled");
  cy.get_cy("not-in-kg-warning").should("not.exist");
}

function checkDatasetDisplay(cy, fixtures, datasets) {
  datasets.forEach((d, i) => {
    const datasetIdentifier = d.identifier.replace(/-/g, "");
    const requestId = `getDatasetById${i}`;
    fixtures.datasetById(datasetIdentifier, requestId);
    cy.get_cy("list-card-title").contains(d.title).click();
    cy.wait(`@${requestId}`);

    cy.get_cy("dataset-title").should("contain.text", d.title);

    cy.get_cy("edit-dataset-button").should("exist");
    cy.get("#project-dataset-menu").find(`[data-cy='more-options-button']`).click();
    cy.get_cy("delete-dataset-button").should("exist");

    cy.get_cy("go-back-button").click();
  });
}

function checkDatasetLimitedPermissionDisplay(cy, fixtures, datasets, editDisabled = false) {
  datasets.forEach((d, i) => {
    const datasetIdentifier = d.identifier.replace(/-/g, "");
    const requestId = `getDatasetById${i}`;
    fixtures.datasetById(datasetIdentifier, requestId);
    cy.get_cy("list-card-title").contains(d.title).click();
    cy.wait(`@${requestId}`);

    cy.get_cy("dataset-title").should("contain.text", d.title);

    if (editDisabled) {
      cy.get_cy("edit-dataset-button").should("be.disabled");
      cy.get_cy("add-to-project-button").should("be.disabled");
    }
    else {
      cy.get_cy("edit-dataset-button").should("not.exist");
      cy.get_cy("add-to-project-button").should("be.visible");
    }
    cy.get("#project-dataset-menu").find(`[data-cy='more-options-button']`).should("not.exist");

    cy.get_cy("go-back-button").click();
  });
}

describe("Project dataset", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration"
    });
    fixtures.projectLockStatus();
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.get_cy("list-card").should("have.length", totalDatasets);
        checkDatasetDisplay(cy, fixtures, datasets);
      });
  });

  it("dataset limited options if has not permissions", () => {
    const projectPath = "e2e/testing-datasets";
    fixtures.project(
      projectPath,
      "getProjectLimited",
      "projects/project-limited-permissions.json"
    );
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProjectLimited");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        checkDatasetLimitedPermissionDisplay(cy, fixtures, datasets);
      });
  });

  it("dataset is in Kg", () => {
    checkDatasetInKg(cy, fixtures, projectPath);
  });

  it("dataset is NOT in Kg", () => {
    const datasetName = "abcd";
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.invalidDataset(datasetIdentifier);
    fixtures.getFiles();
    cy.visit(`projects/${projectPath}/datasets/${datasetName}`);
    cy.wait("@getProject");
    cy.wait("@datasetList");
    cy.wait("@invalidDataset");
    cy.wait("@getFiles");
    cy.get_cy("add-to-project-button").should("not.be.enabled");
    cy.get_cy("not-in-kg-warning").should("exist");
  });
});

describe("Project dataset (legacy ids)", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetLegacyIdList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration"
    });
    fixtures.projectLockStatus();
  });

  it("displays legacy project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.get_cy("list-card").should("have.length", totalDatasets);
        checkDatasetDisplay(cy, fixtures, datasets);
      });
  });

  it("legacy dataset details", () => {
    checkDatasetInKg(cy, fixtures, projectPath);
  });
});

describe("Error loading datasets", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList("datasetList", "datasets/dataset-list-error.json");
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({ queryUrl: "*", fixtureName: "getMigration" });
    fixtures.projectLockStatus();
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body").then( () => {
        cy.get_cy("error-datasets-modal").should("exist");
      });
  });
});

describe("Project dataset (locked)", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration"
    });
    fixtures.projectLockStatus({ locked: true });
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@getProjectLockStatus");
    cy.contains("currently being modified").should("be.visible");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.get_cy("list-card").should("have.length", totalDatasets);
        checkDatasetLimitedPermissionDisplay(cy, fixtures, datasets, true);
      });

    cy.contains("Project is being modified.").should("be.visible");
    cy.get_cy("add-dataset-button").should("be.disabled");
  });
});
