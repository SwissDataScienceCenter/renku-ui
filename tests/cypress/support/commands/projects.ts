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

function createProject(title: string) {
  // create project with the minimum required: title and template
  cy.getDataCy("field-group-title").type(title);
  cy.getDataCy("visibility-private").click();
  cy.getDataCy("project-template-card").first().scrollIntoView().click();
  cy.getDataCy("create-project-button").click();
}

function createProjectAndAddDataset(
  title: string,
  path: string,
  fixtures: FixturesType
) {
  fixtures
    .createProject()
    .project(path, "getNewProject", "projects/project.json", false)
    .changeVisibility(path);
  // create project with the minimum required: title and template
  cy.getDataCy("field-group-title").type(title);
  cy.getDataCy("project-template-card").first().scrollIntoView().click();
  cy.getDataCy("add-dataset-submit-button").click();
  cy.wait("@createProject");
  cy.wait("@getNewProject");
  cy.wait("@changeVisibility");
}

export default function registerProjectsCommands() {
  Cypress.Commands.add("createProject", createProject);
  Cypress.Commands.add(
    "createProjectAndAddDataset",
    createProjectAndAddDataset
  );
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createProject: typeof createProject;
      createProjectAndAddDataset: typeof createProjectAndAddDataset;
    }
  }
}
