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

describe("display a dataset", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.datasets();
    cy.visit("/datasets");
  });

  it("displays the dataset list", () => {
    cy.wait("@getDataset");
    // Check that the dataset title is shown
    cy.get("[data-cy='datasets-title']").should(
      "contain.text",
      "Renku Datasets"
    );
    // Check the all datasets are shown
    cy.get("[data-cy='dataset-card']").should("have.length", 7);
  });

  it("displays the dataset overview", () => {
    fixtures.datasetById();
    cy.get("[data-cy='dataset-card-title']").contains("test-new-dataset").click();

    cy.wait("@getDatasetById");
    // Check that the dataset title is shown
    cy.get("[data-cy='dataset-title']").should(
      "contain.text",
      "test-new-dataset"
    );

    // datasetFileTitle
    cy.get("[data-cy='dataset-file-title']").should(
      "contain.text",
      "Dataset files (1)"
    );
    // datasetFsElement
    cy.get("[data-cy='dataset-fs-element']").should("have.length", 1);
    cy.get("[data-cy='dataset-fs-folder']").should("have.length", 2);
  });
});
