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
    // Check that the project header is shown
    cy.get("[data-cy='header-project']").should("be.visible");
    // Check that the readme is shown
    cy.get("[data-cy='project-readme']").should("contain.text", "local test project");

    // Check that the title is correct
    cy.get("[data-cy='project-title']").first()
      .should("contain.text", "local-test-project");
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
  // it("displays project file > notebook with LaTex", () => {
  //   fixtures.projectFiles();
  //   cy.visit("/projects/e2e/local-test-project/files");
  //   cy.wait("@getProjectFilesRoot");
  //   cy.contains("latex-notebook.ipynb").scrollIntoView();
  //   cy.contains("latex-notebook.ipynb").should("be.visible");
  //   cy.contains("latex-notebook.ipynb").click();
  //   cy.wait("@getLatexNotebook");
  //   // look for latex output
  //   cy.get("mjx-container").should("be.visible");
  // });
});

describe("display migration information", () => {
  const fixtures = new Fixtures(cy);

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
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

describe("display lock status", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays nothing for non-locked project", () => {
    fixtures.projectLockStatus();
    cy.visit("/projects/e2e/local-test-project/");
    cy.contains("currently being modified").should("not.exist");
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
