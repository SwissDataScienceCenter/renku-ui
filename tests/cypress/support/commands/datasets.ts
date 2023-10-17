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

import type { FixturesType } from "../renkulab-fixtures";

function selectProjectFromAutosuggestionList(
  project: string,
  fixtures: FixturesType,
  migrationCheckResult: string
) {
  fixtures.interceptMigrationCheck(
    "migrationCheckSelectedProject",
    migrationCheckResult,
    "*"
  );
  // click in project suggestion list to display options and type project to import dataset and select it
  cy.getDataCy("form-project-exist")
    .get(".mb-3 > .react-autosuggest__container > .form-control")
    .click();
  cy.getDataCy("form-project-exist")
    .get(".mb-3 > .react-autosuggest__container > .form-control")
    .type(project);
  cy.getDataCy("form-project-exist")
    .get("#react-autowhatever-project-section-0-item-0 > span")
    .click();
  cy.wait("@migrationCheckSelectedProject");
}

export interface Dataset {
  name: string;
  creators?: {
    name: string;
    email: string;
    affiliation: string;
  };
  keywords?: string[];
  description?: string;
  file?: string;
  image?: string;
}

function newDataset(newDataset: Dataset) {
  cy.getDataCy("input-title").type(newDataset.name);
  if (newDataset.creators) {
    cy.getDataCy("addCreatorButton").click();
    cy.getDataCy("creator-name").type(newDataset.creators.name);
    cy.getDataCy("creator-email").type(newDataset.creators.email);
    cy.getDataCy("creator-affiliation").type(newDataset.creators.affiliation);
  }
  if (newDataset.keywords?.length) {
    newDataset.keywords.forEach((keyword) => {
      cy.getDataCy("input-keywords").type(keyword).type("{enter}");
    });
  }

  if (newDataset.description)
    cy.get("[data-cy='ckeditor-description']")
      .find("p")
      .click()
      .type(newDataset.description);

  if (newDataset.file) {
    cy.get('[data-cy="dropzone"]').attachFile(
      "/datasets/files/" + newDataset.file,
      { subjectType: "drag-n-drop" }
    );
  }

  if (newDataset.image) {
    cy.get('[data-cy="file-input-image"]').attachFile(
      "/datasets/files/" + newDataset.image,
      { subjectType: "drag-n-drop" }
    );
  }
}

export default function registerDatasetsCommands() {
  Cypress.Commands.add(
    "selectProjectFromAutosuggestionList",
    selectProjectFromAutosuggestionList
  );
  Cypress.Commands.add("newDataset", newDataset);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      selectProjectFromAutosuggestionList: typeof selectProjectFromAutosuggestionList;
      newDataset: typeof newDataset;
    }
  }
}
