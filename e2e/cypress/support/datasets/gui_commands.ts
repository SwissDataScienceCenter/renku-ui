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

Cypress.Commands.add("gui_search_dataset", (datasetName: string, fixtures, resultFile) => {
  fixtures.datasets("getDatasetsSearch", resultFile);
  cy.get("[data-cy='search-dataset-input']").type(datasetName);
  cy.get("[data-cy='search-dataset-submit']").click();
  cy.wait("@getDatasetsSearch");
  cy.get("[data-cy='list-card-title']").contains(datasetName);
});

Cypress.Commands.add("gui_select_project_autosuggestion_list", (project: string, fixtures, migrationCheckResult) => {
  fixtures.interceptMigrationCheck("migrationCheckSelectedProject", migrationCheckResult, "*");
  // click in project suggestion list to display options and type project to import dataset and select it
  cy.get_cy("form-project-exist").get(".mb-3 > .react-autosuggest__container > .form-control").click();
  cy.get_cy("form-project-exist").get(".mb-3 > .react-autosuggest__container > .form-control").type(project);
  cy.get_cy("form-project-exist").get("#react-autowhatever-project-section-0-item-0 > span").click();
  cy.wait("@migrationCheckSelectedProject");
});

export interface Dataset {
  title: string;
  creators?: {
    name: string;
    email: string;
    affiliation: string;
  },
  keywords?: string[];
  description?: string;
  file?: string;
  image?: string;
}

Cypress.Commands.add("gui_new_dataset", (newDataset: Dataset) => {
  cy.get_cy("input-title").type(newDataset.title);
  if (newDataset.creators) {
    cy.get_cy("addCreatorButton").click();
    cy.get_cy("creator-name").type(newDataset.creators.name);
    cy.get_cy("creator-email").type(newDataset.creators.email);
    cy.get_cy("creator-affiliation").type(newDataset.creators.affiliation);
  }
  if (newDataset.keywords?.length) {
    newDataset.keywords.forEach((keyword) => {
      cy.get_cy("input-keywords").type(keyword).type("{enter}");
    });
  }

  if (newDataset.description)
    cy.get("p").click().type(newDataset.description);

  if (newDataset.file) {
    cy.get('[data-cy="dropzone"]')
      .attachFile("/datasets/files/" + newDataset.file, { subjectType: "drag-n-drop" });
  }

  if (newDataset.image) {
    cy.get('[data-cy="file-input-image"]')
      .attachFile("/datasets/files/" + newDataset.image, { subjectType: "drag-n-drop" });
  }
});
