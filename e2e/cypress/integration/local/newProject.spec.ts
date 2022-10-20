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

  it("form validations", () => {
    fixtures
      .templates(false, "url=https%3A%2F%2Fgithub.com%2FSwissDataScienceCenter%2Frenku-project-template&ref=master")
      .getNamespace("internal-space", "getInternalNamespace", "projects/namespace-128.json")
      .getNamespace("private-space", "getPrivateNamespace", "projects/namespace-129.json");
    cy.wait("@getTemplates");

    // validate public visibility is disabled when namespace selected has internal visibility
    cy.get("#namespace-input").click();
    cy.get("div").contains("internal-space").click();
    cy.get_cy("visibility-public").should("be.disabled");

    cy.get_cy("refresh-namespace-list").click();
    // validate public and internal visibility are disabled when namespace selected has private visibility
    cy.get("#namespace-input").click();
    cy.get("div").contains("private-space").click();
    cy.get_cy("visibility-public").should("be.disabled");
    cy.get_cy("visibility-internal").should("be.disabled");

    // validate fetch custom templates
    fixtures.templates(true, "url=invalid-url&ref=master", "getCustomTemplates");
    cy.get_cy("custom-source-button").click();
    cy.get_cy("url-repository").type("invalid-url");
    cy.get_cy("ref-repository").type("master");
    cy.get_cy("fetch-templates-button").click();
    cy.wait("@getCustomTemplates");

    // when invalid source info
    cy.contains("Unable to fetch templates").should("be.visible");

    //when valid source info
    fixtures.templates(false, "url=valid-url&ref=master", "getCustomTemplatesValid");
    cy.get_cy("url-repository").clear().type("valid-url");
    cy.get_cy("fetch-templates-button").click();
    cy.wait("@getCustomTemplatesValid");
    cy.get_cy("project-template-card").should("have.length", 5);

    // cannot submit the form if the title and template are missing
    cy.get_cy("create-project-button").click();
    cy.contains("Title is missing.").should("be.visible");
    cy.contains("Please select a template.").should("be.visible");

    // after send to create project should show progress indicator and hide form
    cy.gui_create_project(newProjectTitle);
    cy.contains("Creating Project...").should("be.visible");
    cy.contains("You'll be redirected to the new project page when the creation is completed.").should("be.visible");
    cy.get_cy("create-project-form").should("not.exist");
  });
});

describe("Add new project shared link", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects("getLandingUserProjects");
  });

  it("prefill values all values (custom template)", () => {
    // eslint-disable-next-line max-len
    const customValues = "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwiZGVzY3JpcHRpb24iOiIgdGhpcyBhIGN1c3RvbSBkZXNjcmlwdGlvbiIsIm5hbWVzcGFjZSI6ImUyZSIsInZpc2liaWxpdHkiOiJpbnRlcm5hbCIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9Td2lzc0RhdGFTY2llbmNlQ2VudGVyL3Jlbmt1LXByb2plY3QtdGVtcGxhdGUiLCJyZWYiOiJtYXN0ZXIiLCJ0ZW1wbGF0ZSI6IkN1c3RvbS9SLW1pbmltYWwifQ%3D%3D";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace("internal-space", "getInternalNamespace", "projects/namespace-128.json");
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // check title
    cy.get_cy("field-group-title").should("contain.value", "new project");
    // check description
    cy.get_cy("field-group-description").should("contain.text", "this a custom description");
    // check namespace
    cy.get_cy("project-slug").should("contain.value", "e2e/new-project");
    // check visibility
    cy.get_cy("visibility-public").should("not.be.checked");
    cy.get_cy("visibility-internal").should("be.checked");
    cy.get_cy("visibility-private").should("not.be.checked");

    // check custom template source
    // eslint-disable-next-line max-len
    cy.get_cy("url-repository").should("contain.value", "https://github.com/SwissDataScienceCenter/renku-project-template");
    cy.get_cy("ref-repository").should("contain.value", "master");

    // check selected template
    cy.get_cy("project-template-card").get(".selected").should("contain.text", "Basic R (4.1.2) Project");
  });

  it("prefill values custom template", () => {
    // eslint-disable-next-line max-len
    const customValues = "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwiZGVzY3JpcHRpb24iOiIgdGhpcyBhIGN1c3RvbSBkZXNjcmlwdGlvbiIsIm5hbWVzcGFjZSI6ImUyZSIsInZpc2liaWxpdHkiOiJpbnRlcm5hbCIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9Td2lzc0RhdGFTY2llbmNlQ2VudGVyL3Jlbmt1LXByb2plY3QtdGVtcGxhdGUiLCJyZWYiOiJtYXN0ZXIifQ%3D%3D";
    const templateUrl = "https://github.com/SwissDataScienceCenter/renku-project-template";
    const templateRef = "master";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace("internal-space", "getInternalNamespace", "projects/namespace-128.json");
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // check custom templates
    cy.get_cy("url-repository").should("contain.value", templateUrl);
    cy.get_cy("ref-repository").should("contain.value", templateRef);
  });

  it("prefill values renkuLab template", () => {
    // eslint-disable-next-line max-len
    const customValues = "?data=eyJ0ZW1wbGF0ZSI6IlJlbmt1L2p1bGlhLW1pbmltYWwifQ%3D%3D";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace("internal-space", "getInternalNamespace", "projects/namespace-128.json");
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // check selected template
    cy.get_cy("project-template-card").get(".selected").should("contain.text", "Basic Julia (1.7.1) Project");
  });
});
