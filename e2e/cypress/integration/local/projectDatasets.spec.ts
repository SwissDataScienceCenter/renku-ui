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
    fixtures.projectMigrationUpToDate({ queryUrl: "*", fixtureName: "getMigration" });
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body").then( data => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.get_cy("dataset-card").should("have.length", totalDatasets);
        /* 2. Navigation datasets, check first 2 datasets in the list  */
        if (totalDatasets > 1) {
          const firstDataset = datasets[0];
          const secondDataset = datasets[1];
          let datasetIdentifier = firstDataset.identifier;
          fixtures.datasetById(datasetIdentifier);
          cy.get_cy("dataset-card-title").contains(firstDataset.title).click();
          cy.wait("@getDatasetById");
          cy.get_cy("dataset-title").should("contain.text", firstDataset.title);
          datasetIdentifier = secondDataset.identifier;
          cy.get_cy("go-back-button").click();
          fixtures.datasetById(datasetIdentifier, "getDatasetById2");
          cy.get_cy("dataset-card-title").contains(secondDataset.title).click();
          cy.wait("@getDatasetById2");
          cy.get_cy("dataset-title").should("contain.text", secondDataset.title);
        }

        /* 3. Verify displaying info dataset with permissions  */
        cy.get_cy("edit-dataset-button").should("exist");
        cy.get_cy("more-options-button").click();
        cy.get_cy("delete-dataset-button").should("exist");
      });
  });

  it("dataset limited options if has not permissions", () => {
    const projectPath = "e2e/testing-datasets";
    fixtures.project(projectPath, "getProjectLimited", "projects/project-limited-permissions.json");
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProjectLimited");
    cy.wait("@datasetList")
      .its("response.body").then( data => {
        const datasets = data.result.datasets;
        if (datasets.length > 0) {
          const datasetIdentifier = datasets[0].identifier;
          fixtures.datasetById(datasetIdentifier);
          cy.get_cy("dataset-card-title").contains(datasets[0].title).click();
          cy.wait("@getDatasetById");
          /* 3. Verify displaying info dataset with permissions  */
          cy.get_cy("edit-dataset-button").should("not.exist");
          cy.get_cy("more-options-button").should("not.exist");
        }
      });
  });

  it("dataset is in Kg", () => {
    const datasetName = "abcd";
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.datasetById(datasetIdentifier);
    cy.visit(`projects/${projectPath}/datasets/${datasetName}`);
    cy.wait("@getProject");
    cy.wait("@datasetList");
    cy.wait("@getDatasetById");
    cy.get_cy("add-to-project-button").should("be.enabled");
    cy.get_cy("not-in-kg-warning").should("not.exist");
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
