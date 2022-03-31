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
import "../../support/projects/gui_commands";

describe("Add new project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  const newProjectTitle = "new project";
  const slug = "new-project";
  const newProjectPath = `e2e/${slug}`;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects("getLandingUserProjects");
    cy.visit("projects/new");
  });

  it("create a new project that should change name", () => {
    fixtures
      .templates()
      .createProject()
      .project(newProjectPath, "getNewProject", "projects/project.json", false)
      .updateProject(newProjectPath);
    cy.gui_create_project(newProjectTitle);
    cy.wait("@getTemplates");
    cy.wait("@createProject");
    cy.wait("@getNewProject");
    cy.wait("@updateProject").should(result => {
      const request = result.request.body;
      expect(request).to.have.property("name");
    });
    cy.url().should("include", `projects/${newProjectPath}`);
  });

  it("error on getting templates", () => {
    fixtures.templates(true);
    cy.wait("@getTemplates");
    cy.contains("Unable to fetch templates").should("be.visible");
  });

  it("error on creating a new project", () => {
    const error = "errors/core-error-1102.json";
    fixtures
      .templates()
      .createProject(error);
    cy.gui_create_project(newProjectTitle);
    cy.wait("@getTemplates");
    cy.wait("@createProject");
    cy.contains("error occurred while creating the project").should("be.visible");
  });
});
