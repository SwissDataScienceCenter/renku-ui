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
import "../support/utils";
import Fixtures from "../support/renkulab-fixtures";

describe.only("display a project - not found", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions();
  });

  it("displays the project not found page when the name is incorrect", () => {
    fixtures.userTest().errorProject("e2e/not-found-test-project");
    cy.visit('/projects/e2e/not-found-test-project');

    cy.get_cy("not-found-title").should("be.visible").should("contain.text", "404");
    cy.get_cy("not-found-subtitle").should("be.visible").should("contain.text", "Project not found");
    cy.get_cy("not-found-description").should("be.visible").should("contain.text", "We could not find project with path e2e/not-found-test-project.");

    cy.get_cy("not-found-children").should("be.visible").should("contain.text", "If you are sure the project exists, you may want to try the following:");
  });

  it("displays the project not found page when the name is incorrect", () => {
    fixtures.userNone().errorProject("e2e/not-found-test-project");
    cy.visit('/projects/e2e/not-found-test-project');

    cy.get_cy("not-found-title").should("be.visible").should("contain.text", "404");
    cy.get_cy("not-found-subtitle").should("be.visible").should("contain.text", "Project not found");
    cy.get_cy("not-found-description").should("be.visible").should("contain.text", "We could not find project with path e2e/not-found-test-project.");

    cy.get_cy("not-found-children").should("be.visible").should("contain.text", "You might need to be logged in to see this project.");
  });

  it("displays the project not found page when the name is incorrect", () => {
    fixtures.userTest().errorProject("12345");
    cy.visit('/projects/12345');

    cy.get_cy("not-found-title").should("be.visible").should("contain.text", "404");
    cy.get_cy("not-found-subtitle").should("be.visible").should("contain.text", "Project not found");
    cy.get_cy("not-found-description").should("be.visible").should("contain.text", "We could not find project with path e2e/not-found-test-project.");

    cy.get_cy("not-found-children").should("be.visible").should("contain.text", "If you are sure the project exists, you may want to try the following:");
  });

  it("displays the project not found page when the name is incorrect", () => {
    fixtures.userNone().errorProject("12345");
    cy.visit('/projects/12345');

    cy.get_cy("not-found-title").should("be.visible").should("contain.text", "404");
    cy.get_cy("not-found-subtitle").should("be.visible").should("contain.text", "Project not found");
    cy.get_cy("not-found-description").should("be.visible").should("contain.text", "We could not find project with path e2e/not-found-test-project.");

    cy.get_cy("not-found-children").should("be.visible").should("contain.text", "If you are sure the project exists, you may want to try the following:");
  });
});

describe("display a project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays the project overview page", () => {
    cy.wait("@getProject");
    cy.wait("@getReadme");
    cy.get_cy("header-project").should("be.visible");
    cy.get_cy("project-readme").should("be.visible").should("contain.text", "local test project");
    cy.get_cy("project-title").should("be.visible").should("contain.text", "local-test-project");
  });

  it("displays lock correctly", () => {
    fixtures.projectLockStatus({ locked: true });
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getProjectLockStatus");
    cy.get_cy("project-overview-content").contains("project is currently being modified").should("exist");
    fixtures.projectLockStatus({ locked: false });
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getProjectLockStatus");
    cy.get_cy("project-overview-content").contains("project is currently being modified").should("not.exist");
  });

  it("displays the project KG status updates", () => {
    cy.get_cy("project-overview-nav").contains("a", "Status").should("exist").click();
    cy.url().should("include", "/projects/e2e/local-test-project/overview/status");
    cy.get_cy("project-overview-content").contains("Knowledge Graph integration is active.").should("exist");
    fixtures.getStatusProcessing();
    cy.get_cy("project-overview-nav").contains("a", "Status").should("exist").click();
    cy.wait("@getStatusProcessing");
    cy.get_cy("project-overview-content").contains("Knowledge Graph integration is active.").should("not.exist");
    cy.get_cy("project-overview-content").contains("Knowledge Graph is building").should("exist");
    cy.get_cy("project-overview-content").contains("40%").should("exist");
    fixtures.getStatusProcessing(true);
    cy.get_cy("project-overview-nav").contains("a", "Status").should("exist").click();
    cy.wait("@getStatusProcessing");
    cy.get_cy("project-overview-content").contains("Knowledge Graph is building").should("not.exist");
    cy.get_cy("project-overview-content").contains("Knowledge Graph integration is active.").should("exist");
  });

  it("update project settings overview", () => {
    fixtures.updateProject("39646", "updateProject", "project/update-project-tag-description.json");
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("tags-input").type("abcde");
    cy.get_cy("update-tag-button").click();
    cy.get_cy("updating-tag-list").should("contain.text", "Updating list..");
    cy.wait("@updateProject");
    cy.get_cy("entity-tag-list").should("contain.text", "abcde");

    cy.get_cy("description-input").type("description abcde");
    cy.get_cy("update-desc-button").click();
    cy.get_cy("updating-description").should("contain.text", "Updating description..");
    cy.wait("@updateProject");
    cy.get_cy("entity-description").should("contain.text", "description abcde");
  });

  it("displays project settings sessions", () => {
    fixtures.sessionServerOptions();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
  });

  it("displays project settings with cloud-storage enabled ", () => {
    fixtures.sessionServerOptions(true).projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
  });

  it("displays project settings complete", () => {
    fixtures.sessionServerOptions().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("be.visible");
    cy.get("button.active").contains("0.5").should("be.visible");
  });

  it("displays project settings error", () => {
    fixtures.sessionServerOptions().projectConfigShow({ error: true });
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("not.exist");
    cy.contains("Error").should("be.visible");
  });

  it("displays project settings legacy error", () => {
    fixtures.sessionServerOptions().projectConfigShow({ legacyError: true });
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("not.exist");
    cy.contains("Error").should("be.visible");
    cy.contains("[Show details]").should("be.visible");
  });

  it("displays project file > notebook with image", () => {
    fixtures.projectFiles();
    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("Historical-Use.ipynb").scrollIntoView();
    cy.contains("Historical-Use.ipynb").should("be.visible");
    cy.contains("Historical-Use.ipynb").click();
    cy.wait("@getHistoricalUseNotebook");
    // look for an input cell
    cy.contains("import numpy as np").should("be.visible");
    // look for an output cell
    cy.contains("2005").should("be.visible")
      .should("have.prop", "tagName").should("eq", "TH");
    // look for a markdown cell
    cy.contains("Historical Use Patterns").should("be.visible")
      .should("have.prop", "tagName").should("eq", "H1");
  });

  it("displays project file > notebook with LaTex", () => {
    fixtures.projectFiles();
    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("latex-notebook.ipynb").scrollIntoView();
    cy.contains("latex-notebook.ipynb").should("be.visible");
    cy.contains("latex-notebook.ipynb").click();
    cy.wait("@getLatexNotebook");
    // look for latex output
    cy.get("mjx-container").should("be.visible");
  });

  it("displays project file > notebook with python output", () => {
    fixtures.projectFiles();
    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("01-CountFlights.ipynb").scrollIntoView();
    cy.contains("01-CountFlights.ipynb").should("be.visible");
    cy.contains("01-CountFlights.ipynb").click();
    cy.wait("@getCountFlights");
    // look for python output
    cy.contains("There were 4951 flights to Austin, TX in Jan 2019.")
      .scrollIntoView()
      .should("be.visible");
  });

  it("displays project file > python file", () => {
    fixtures.projectFiles();
    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("random_py_file.py").scrollIntoView();
    cy.contains("random_py_file.py").should("be.visible");
    cy.contains("random_py_file.py").click();
    cy.wait("@getRandomPyFile");
    // look for python output
    cy.contains("Minimal example.").should("be.visible");
  });
});

describe("fork a project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    fixtures.namespaces();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays fork modal correctly", () => {
    fixtures.projectTest(undefined, { visibility: "private" });
    cy.wait("@getProject");
    cy.get("#fork-project").click();
    cy.wait("@getNamespaces");
    cy.get_cy("visibility-private").should("be.enabled");
    cy.get_cy("visibility-internal").should("be.disabled");
    cy.get_cy("visibility-public").should("be.disabled");

  });
});

describe("display migration information", () => {
  const fixtures = new Fixtures(cy);

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.namespaces();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays up-to-date migration", () => {
    fixtures.projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the project up-to-date info is shown
    cy.contains("This project is using the latest version of renku.").should("be.visible");
  });

  it("displays optional migration", () => {
    fixtures.projectMigrationOptional();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is shown
    cy.contains("A new version of renku is available").should("be.visible");
  });

  it("displays recommended migration", () => {
    fixtures.projectMigrationRecommended();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is shown
    cy.contains("Updating to the latest version of renku is highly recommended.").should("be.visible");
  });

  it("displays required migration", () => {
    fixtures.projectMigrationRequired();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is shown
    cy.contains("This project is not compatible with the RenkuLab UI").should("be.visible");
  });

  it("displays error on migration", () => {
    fixtures.projectMigrationError();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getMigration");
    // Check that the project up-to-date info is shown
    cy.contains("unexpected error while handling project data").should("be.visible");
  });

  it("displays legacy error on migration", () => {
    fixtures.projectMigrationLegacyError();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getMigration");
    // Check that the project up-to-date info is shown
    cy.contains("error occurred").should("be.visible");
    cy.contains("[Show details]").should("be.visible");
  });
});

describe("display migration information for anon user", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userNone();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays up-to-date migration", () => {
    fixtures.projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.contains("Project / Latest Renku Version");
    // Check that the project up-to-date info is not shown
    cy.contains("This project is using the latest version of renku.").should(
      "not.exist"
    );
  });

  it("displays optional migration", () => {
    fixtures.projectMigrationOptional();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is not shown
    cy.contains("Project Renku Version");
    cy.contains("A new version of renku is available").should("not.exist");
  });

  it("displays recommended migration", () => {
    fixtures.projectMigrationRecommended();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is not shown
    cy.contains("Project Renku Version");
    cy.contains(
      "Updating to the latest version of renku is highly recommended."
    ).should("not.exist");
  });

  it("displays required migration", () => {
    fixtures.projectMigrationRequired();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is not shown
    cy.contains("Project Renku Version");
    cy.contains("This project is not compatible with the RenkuLab UI").should(
      "not.exist"
    );
  });
});

describe("display migration information for observer user", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTestObserver();
    fixtures.projectLockStatus();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays up-to-date migration", () => {
    fixtures.projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the project up-to-date info is shown
    cy.contains("This project is using the latest version of renku.").should(
      "be.visible"
    );
  });

  it("displays optional migration", () => {
    fixtures.projectMigrationOptional();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is shown
    cy.contains("A new version of renku is available").should("be.visible");
    cy.contains("You do not have the required permissions").should(
      "be.visible"
    );
  });

  it("displays recommended migration", () => {
    fixtures.projectMigrationRecommended();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getProjectLockStatus");
    // Check that the migration suggestion is shown
    cy.contains(
      "Updating to the latest version of renku is highly recommended."
    ).should("be.visible");
    cy.contains("You do not have the required permissions").should(
      "be.visible"
    );
  });

  it("displays required migration", () => {
    fixtures.projectMigrationRequired();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    cy.wait("@getProjectLockStatus");
    // Check that the migration suggestion is  shown
    cy.contains("This project is not compatible with the RenkuLab UI").should(
      "be.visible"
    );
    cy.contains("You do not have the required permissions").should(
      "be.visible"
    );
  });
});
