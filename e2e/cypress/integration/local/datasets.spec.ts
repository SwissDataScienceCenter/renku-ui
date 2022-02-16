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

describe("display a dataset", () => {
  const fixtures = new Fixtures(cy);
  const useMockedData = Cypress.env("USE_FIXTURES") === true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.datasets(useMockedData);
    cy.visit("datasets");
  });

  it("displays the dataset list", () => {
    cy.wait("@getDatasets").then((data) => {
      const totalDatasets = data.response.body.length;
      // all datasets are displayed
      cy.get_cy("dataset-card").should("have.length", totalDatasets);

      // the dataset title is displayed
      cy.get_cy("datasets-title").should(
        "contain.text",
        "Renku Datasets"
      );
    });
  });

  it("displays the dataset overview", () => {
    cy.wait("@getDatasets");
    const datasetName = "flight test init project";
    const datasetIdentifier = "3117816964734179b3f3ccef5dcd43d2";

    fixtures.datasetById(useMockedData, datasetIdentifier);
    cy.gui_search_dataset(datasetName, fixtures, useMockedData, `datasets/datasets_search_${datasetIdentifier}.json`);
    cy.get_cy("dataset-card-title").contains(datasetName).click();
    cy.wait("@getDatasetById")
      .its("response.body").then( dataset => {
        // the dataset title is displayed
        cy.get_cy("dataset-title").should("contain.text", dataset?.title);
        // files are displayed
        const totalFiles = dataset?.hasPart?.length;
        cy.get_cy("dataset-file-title").should("contain.text", `Dataset files (${totalFiles})`);
        cy.get_cy("dataset-fs-element").should("have.length", 1);

        // projects that use the dataset are displayed
        const totalProjectsUsingDataset = dataset?.usedIn?.length || 0;
        if (totalProjectsUsingDataset > 1)
          cy.get_cy("project-using-dataset").should("have.length", totalProjectsUsingDataset);

      });
  });

  it("displays warning when dataset is invalid", () => {
    const invalidDatasetId = "99a46c10c94a40359181965e5c4cdabc";
    fixtures.invalidDataset(useMockedData, invalidDatasetId);
    cy.visit(`/datasets/${invalidDatasetId}`);
    cy.wait("@invalidDataset");
    cy.get_cy("dataset-error-title").should("contain.text", "Dataset not found");
  });
});
