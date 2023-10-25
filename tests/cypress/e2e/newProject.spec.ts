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

describe("Add new project", () => {
  const newProjectTitle = "new project";
  const slug = "new-project";
  const newProjectPath = `e2e/${slug}`;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects();
    cy.visit("projects/new");
  });

  it("create a new project that should change name", () => {
    fixtures
      .templates()
      .createProject()
      .project({
        name: "getNewProject",
        path: newProjectPath,
        statistics: false,
      })
      .updateProject(newProjectPath);
    cy.createProject(newProjectTitle);
    cy.wait("@getTemplates");
    cy.wait("@createProject");
    cy.wait("@getNewProject");
    cy.wait("@updateProject").should((result) => {
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
    fixtures
      .templates()
      .createProject({ fixture: "errors/core-error-1102.json" });
    cy.createProject(newProjectTitle);
    cy.wait("@getTemplates");
    cy.wait("@createProject");
    cy.contains("error occurred while creating the project").should(
      "be.visible"
    );
  });

  it("form validations", () => {
    fixtures
      .templates(
        false,
        "url=https%3A%2F%2Fgithub.com%2FSwissDataScienceCenter%2Frenku-project-template&ref=master"
      )
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      )
      .getNamespace(
        "private-space",
        "getPrivateNamespace",
        "projects/namespace-129.json"
      );
    cy.wait("@getTemplates");

    // validate public visibility is disabled when namespace selected has internal visibility
    cy.get("#namespace-input").click();
    cy.get("div").contains("internal-space").click();
    cy.getDataCy("visibility-public").should("be.disabled");

    cy.getDataCy("refresh-namespace-list").click();
    // validate public and internal visibility are disabled when namespace selected has private visibility
    cy.get("#namespace-input").click();
    cy.get("div").contains("private-space").click();
    cy.getDataCy("visibility-public").should("be.disabled");
    cy.getDataCy("visibility-internal").should("be.disabled");

    // validate fetch custom templates
    fixtures.templates(
      true,
      "url=invalid-url&ref=master",
      "getCustomTemplates"
    );
    cy.getDataCy("custom-source-button").click();
    cy.getDataCy("url-repository").type("invalid-url");
    cy.getDataCy("ref-repository").type("master");
    cy.getDataCy("fetch-templates-button").click();
    cy.wait("@getCustomTemplates");

    // when invalid source info
    cy.contains("Unable to fetch templates").should("be.visible");

    //when valid source info
    fixtures.templates(
      false,
      "url=valid-url&ref=master",
      "getCustomTemplatesValid"
    );
    cy.getDataCy("url-repository").clear().type("valid-url");
    cy.getDataCy("fetch-templates-button").click();
    cy.wait("@getCustomTemplatesValid");
    cy.getDataCy("project-template-card").should("have.length", 6);

    // cannot submit the form if the title and template are missing
    cy.getDataCy("create-project-button").click();
    cy.contains("Title is missing.").should("be.visible");
    cy.contains("Please select a template.").should("be.visible");

    // after send to create project should show progress indicator and hide form
    cy.createProject(newProjectTitle);
    cy.contains("Creating Project...").should("be.visible");
    cy.contains(
      "You'll be redirected to the new project page when the creation is completed."
    ).should("be.visible");
    cy.getDataCy("create-project-form").should("not.exist");
  });

  it("create a new project with an avatar", () => {
    fixtures
      .templates()
      .createProject()
      .project({
        name: "getNewProject",
        path: newProjectPath,
        statistics: false,
      })
      .updateProject(newProjectPath)
      .updateAvatar();
    cy.wait("@getTemplates");
    cy.get("#project-avatar-file-input-hidden").selectFile(
      "cypress/fixtures/avatars/avatar.png",
      { force: true }
    );
    cy.createProject(newProjectTitle);
    cy.wait("@createProject");
    cy.wait("@getNewProject");
    cy.wait("@updateProject").should((result) => {
      const request = result.request.body;
      expect(request).to.have.property("name");
    });
    cy.wait("@updateAvatar").should((result) => {
      const request = result.request.body;
      expect(request.byteLength).to.lessThan(200 * 1024 * 1024);
    });
    cy.url().should("include", `projects/${newProjectPath}`);
  });
});

describe("Add new project shared link", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects();
  });

  it("prefill values all values (custom template)", () => {
    const customValues =
      "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwiZGVzY3JpcHRpb24iOiIgdGhpcyBhIGN1c3RvbSBkZXNjcml" +
      "wdGlvbiIsIm5hbWVzcGFjZSI6ImUyZSIsInZpc2liaWxpdHkiOiJpbnRlcm5hbCIsInVybCI6Imh0dHBzOi8v" +
      "Z2l0aHViLmNvbS9Td2lzc0RhdGFTY2llbmNlQ2VudGVyL3Jlbmt1LXByb2plY3QtdGVtcGxhdGUiLCJyZWYiO" +
      "iJtYXN0ZXIiLCJ0ZW1wbGF0ZSI6IkN1c3RvbS9SLW1pbmltYWwifQ%3D%3D";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("be.visible", {
      timeout: 20_000,
    });

    // Check the prefill values
    cy.getDataCy("field-group-title").should("contain.value", "new project");
    cy.getDataCy("field-group-description").should(
      "contain.text",
      "this a custom description"
    );
    cy.getDataCy("project-slug").should("contain.value", "e2e/new-project");
    cy.getDataCy("visibility-public").should("not.be.checked");
    cy.getDataCy("visibility-internal").should("be.checked");
    cy.getDataCy("visibility-private").should("not.be.checked");
    cy.getDataCy("url-repository").should(
      "contain.value",
      "https://github.com/SwissDataScienceCenter/renku-project-template"
    );
    cy.getDataCy("ref-repository").should("contain.value", "master");
    cy.getDataCy("project-template-card")
      .get(".selected")
      .should("contain.text", "Basic R (4.1.2) Project");
  });

  it("prefill values custom template", () => {
    const customValues =
      "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwiZGVzY3JpcHRpb24iOiIgdGhpcyBhIGN1c3RvbSBkZXNjcml" +
      "wdGlvbiIsIm5hbWVzcGFjZSI6ImUyZSIsInZpc2liaWxpdHkiOiJpbnRlcm5hbCIsInVybCI6Imh0dHBzOi8v" +
      "Z2l0aHViLmNvbS9Td2lzc0RhdGFTY2llbmNlQ2VudGVyL3Jlbmt1LXByb2plY3QtdGVtcGxhdGUiLCJyZWYiO" +
      "iJtYXN0ZXIifQ%3D%3D";
    const templateUrl =
      "https://github.com/SwissDataScienceCenter/renku-project-template";
    const templateRef = "master";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("be.visible", {
      timeout: 20_000,
    });

    // Check custom templates
    cy.getDataCy("url-repository").should("contain.value", templateUrl);
    cy.getDataCy("ref-repository").should("contain.value", templateRef);
  });

  it("prefill values renkuLab template", () => {
    const customValues =
      "?data=eyJ0ZW1wbGF0ZSI6IlJlbmt1L2p1bGlhLW1pbmltYWwifQ%3D%3D";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("be.visible", {
      timeout: 20_000,
    });

    // Check selected template
    cy.getDataCy("project-template-card")
      .get(".selected")
      .should("contain.text", "Basic Julia (1.7.1) Project");
  });

  it("use the target template and select the custom variables", () => {
    const customValues =
      "?data=eyJ1cmwiOiJodHRwczovL2dpdGh1Yi5jb20vb21uaWJlbmNobWFyay9jb250cmlidXRlZC1wcm9qZWN" +
      "0LXRlbXBsYXRlcyIsInJlZiI6Im1haW4iLCJ0ZW1wbGF0ZSI6IkN1c3RvbS9vbW5pLWRhdGEtcHkiLCJ2YXJp" +
      "YWJsZXMiOnsiYmVuY2htYXJrX25hbWUiOiJvbW5pX2NsdXN0ZXJpbmciLCJkYXRhc2V0X2tleXdvcmQiOiJ0Z" +
      "XN0IHZhbHVlIiwibWV0YWRhdGFfZGVzY3JpcHRpb24iOiIiLCJwcm9qZWN0X3RpdGxlIjoiYW5vdGhlciByYW" +
      "5kb20gdmFsdWUiLCJzdHVkeV9saW5rIjoiIiwic3R1ZHlfbm90ZSI6IiIsInN0dWR5X3Rpc3N1ZSI6IiJ9fQ";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("be.visible", {
      timeout: 20_000,
    });

    // Check selected template
    cy.getDataCy("project-template-card")
      .get(".selected")
      .should("contain.text", "Omnibenchmark dataset");
    cy.get("#parameter-benchmark_name").should("have.value", "omni_clustering");
    cy.get("#parameter-dataset_keyword").should("have.value", "test value");
    cy.get("#parameter-project_title").should(
      "have.value",
      "another random value"
    );
  });

  it("display warning on non-essential fields", () => {
    const customValues =
      "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwibmFtZXNwYWNlIjoiZmFrZSJ9";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-warning")
      .should("be.visible", {
        timeout: 20_000,
      })
      .contains("button", "Show warnings")
      .click();
    cy.getDataCy("project-creation-embedded-warning")
      .contains(`The namespace "fake" is not available.`)
      .should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("not.exist");

    // Other valid fields should be filled in correctly
    cy.getDataCy("field-group-title").should("contain.value", "new project");
  });

  it("display errors on essential fields", () => {
    const customValues =
      "?data=eyJ0aXRsZSI6Im5ldyBwcm9qZWN0IiwidGVtcGxhdGUiOiJmYWtlIn0=";
    fixtures
      .templates(false, "*", "getTemplates")
      .getNamespace(
        "internal-space",
        "getInternalNamespace",
        "projects/namespace-128.json"
      );
    cy.visit(`projects/new${customValues}`);
    cy.wait("@getTemplates");

    // Check feedback messages
    cy.getDataCy("project-creation-embedded-fetching").should("be.visible");
    cy.getDataCy("project-creation-embedded-error")
      .should("be.visible", {
        timeout: 20_000,
      })
      .contains("button", "Show error")
      .click();
    cy.getDataCy("project-creation-embedded-error")
      .contains(`The template "fake" is not available.`)
      .should("be.visible");
    cy.getDataCy("project-creation-embedded-info").should("not.exist");

    // Other valid fields should be filled in correctly
    cy.getDataCy("field-group-title").should("contain.value", "new project");
  });
});
