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

describe("display a project - not found", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions();
  });

  it("displays the project not found page when the name is incorrect - logged user", () => {
    fixtures.userTest().errorProject("e2e/not-found-test-project");
    cy.visit("/projects/e2e/not-found-test-project");

    cy.get_cy("not-found-title")
      .should("be.visible")
      .should("contain.text", "404");
    cy.get_cy("not-found-subtitle")
      .should("be.visible")
      .should("contain.text", "Project not found");
    cy.get_cy("not-found-description")
      .should("be.visible")
      .should(
        "contain.text",
        "We could not find project with path e2e/not-found-test-project."
      );
    cy.get_cy("not-found-children")
      .should("be.visible")
      .should(
        "contain.text",
        "If you are sure the project exists, you may want to try the following:"
      );
  });

  it("displays the project not found page when the name is incorrect - anon user", () => {
    fixtures.userNone().errorProject("e2e/not-found-test-project");
    cy.visit("/projects/e2e/not-found-test-project");

    cy.get_cy("not-found-title")
      .should("be.visible")
      .should("contain.text", "404");
    cy.get_cy("not-found-subtitle")
      .should("be.visible")
      .should("contain.text", "Project not found");
    cy.get_cy("not-found-description")
      .should("be.visible")
      .should(
        "contain.text",
        "We could not find project with path e2e/not-found-test-project."
      );
    cy.get_cy("not-found-children")
      .should("be.visible")
      .should(
        "contain.text",
        "You might need to be logged in to see this project."
      );
  });

  it("displays the project not found page when the numeric id is incorrect - logged user", () => {
    fixtures.userTest().errorProject("12345");
    cy.visit("/projects/12345");

    cy.get_cy("not-found-title")
      .should("be.visible")
      .should("contain.text", "404");
    cy.get_cy("not-found-subtitle")
      .should("be.visible")
      .should("contain.text", "Project not found");
    cy.get_cy("not-found-description")
      .should("be.visible")
      .should(
        "contain.text",
        "We could not find project with numeric id 12345."
      );
    cy.get_cy("not-found-children")
      .should("be.visible")
      .should(
        "contain.text",
        "If you are sure the project exists, you may want to try the following:"
      );
  });

  it("displays the project not found page when the numeric id is incorrect - anon user", () => {
    fixtures.userNone().errorProject("12345");
    cy.visit("/projects/12345");

    cy.get_cy("not-found-title")
      .should("be.visible")
      .should("contain.text", "404");
    cy.get_cy("not-found-subtitle")
      .should("be.visible")
      .should("contain.text", "Project not found");
    cy.get_cy("not-found-description")
      .should("be.visible")
      .should(
        "contain.text",
        "We could not find project with numeric id 12345."
      );
    cy.get_cy("not-found-children")
      .should("be.visible")
      .should(
        "contain.text",
        "You might need to be logged in to see this project."
      );
  });
});

describe("display a project", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .landingUserProjects()
      .projectTest()
      .projectById("getProjectsById", 39646);
    fixtures.projectLockStatus().projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays the project overview page", () => {
    cy.wait("@getProject");
    cy.wait("@getReadme");
    cy.get_cy("header-project").should("be.visible");
    cy.get_cy("project-readme")
      .should("be.visible")
      .should("contain.text", "local test project");
    cy.get_cy("project-title")
      .should("be.visible")
      .should("contain.text", "local-test-project");
  });

  it("displays lock correctly", () => {
    fixtures.projectLockStatus({ locked: true });
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("settings-navbar")
      .contains("a", "Sessions")
      .should("exist")
      .click();
    cy.get_cy("settings-container")
      .contains("project is currently being modified")
      .should("exist");
  });

  it("update project settings overview", () => {
    fixtures.updateProject(
      "39646",
      "updateProject",
      "project/update-project-tag-description.json"
    );
    fixtures.getProjectKG();
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("tags-input").type("abcde");
    cy.get_cy("update-tag-button").click();
    cy.get_cy("updating-tag-list").should("contain.text", "Updating list..");
    cy.wait("@updateProject");
    cy.get_cy("entity-tag-list").should("contain.text", "abcde");

    cy.get_cy("description-input").type("description abcde");
    cy.get_cy("update-desc-button").click();
    cy.get_cy("updating-description").should(
      "contain.text",
      "Updating description.."
    );
    cy.wait("@updateProject");
    cy.get_cy("entity-description").should("contain.text", "description abcde");
    // Change visibility
    fixtures.updateProjectKG("updateProjectKG");
    cy.wait("@getProjectKG");
    // should keep visibility status after cancel update
    cy.get_cy("visibility-private").click();
    cy.get(".modal-title").should(
      "contain.text",
      "Change visibility to Private"
    );
    cy.get_cy("cancel-visibility-btn").click();
    cy.get_cy("visibility-public").should("be.checked");

    // success update
    cy.get_cy("visibility-internal").click();
    cy.get_cy("update-visibility-btn").click();
    cy.wait("@updateProjectKG");
    cy.get(".modal-body").should(
      "contain.text",
      "The visibility of the project has been modified"
    );

    // error updating visibility
    fixtures.updateProjectKG(
      "updateProjectKGerror",
      "project/error-update-visibility.json",
      400
    );
    cy.get(".btn-close").click();
    cy.wait("@getProjectKG");
    cy.get_cy("visibility-private").click();
    cy.get_cy("update-visibility-btn").click();
    cy.wait("@updateProjectKGerror");
    cy.get(".modal-body").should(
      "contain.text",
      "Internal is not allowed in a private group."
    );
  });

  it("displays project settings sessions", () => {
    fixtures.sessionServerOptions().resourcePoolsTest().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
  });

  it("displays project settings with cloud-storage enabled ", () => {
    fixtures.sessionServerOptions(true).resourcePoolsTest().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
  });

  it("displays project settings complete", () => {
    fixtures.sessionServerOptions().resourcePoolsTest().projectConfigShow();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectConfigShow");
    cy.contains("Number of CPUs").should("be.visible");
    cy.contains("Amount of Memory").should("be.visible");
    cy.contains("Amount of Storage").should("be.visible");
    cy.contains("Number of GPUs").should("be.visible");
    cy.get("button.active").contains("/lab").should("be.visible");
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
    cy.contains("2005")
      .should("be.visible")
      .should("have.prop", "tagName")
      .should("eq", "TH");
    // look for a markdown cell
    cy.contains("Historical Use Patterns")
      .should("be.visible")
      .should("have.prop", "tagName")
      .should("eq", "H1");
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
    fixtures.projectFiles().getSessions;
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

  it("displays project file > notebook > can start a session", () => {
    fixtures.projectFiles();
    cy.intercept("/ui-server/api/notebooks/servers*", {
      body: { servers: {} },
    }).as("getSessions");

    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("01-CountFlights.ipynb").scrollIntoView();
    cy.contains("01-CountFlights.ipynb").should("be.visible");
    cy.contains("01-CountFlights.ipynb").click();
    cy.wait("@getCountFlights");
    cy.get("[data-cy='check-notebook-icon']", { timeout: 10_000 })
      .should("be.visible")
      .children("a")
      .should(($a) => {
        expect($a.attr("href")).to.eq(
          "/projects/e2e/local-test-project/sessions/new?autostart=1&notebook=01-CountFlights.ipynb"
        );
      });
  });

  it("displays project file > notebook > anon user can start a session", () => {
    fixtures.userNone().projectFiles();
    cy.intercept("/ui-server/api/notebooks/servers*", {
      body: { servers: {} },
    }).as("getSessions");

    cy.visit("/projects/e2e/local-test-project/files");
    cy.wait("@getProjectFilesRoot");
    cy.contains("01-CountFlights.ipynb").scrollIntoView();
    cy.contains("01-CountFlights.ipynb").should("be.visible");
    cy.contains("01-CountFlights.ipynb").click();
    cy.wait("@getCountFlights");
    cy.get_cy("check-notebook-icon")
      .should("be.visible")
      .children("a")
      .should(($a) => {
        expect($a.attr("href")).to.eq(
          "/projects/e2e/local-test-project/sessions/new?autostart=1&notebook=01-CountFlights.ipynb"
        );
      });
  });

  it("delete a project", () => {
    fixtures.deleteProject();
    cy.visit("/projects/e2e/local-test-project/settings");

    cy.get_cy("project-settings-general-delete-project")
      .should("be.visible")
      .find("button")
      .contains("Delete project")
      .should("be.visible")
      .click();

    cy.contains("Are you absolutely sure?");
    cy.get("button").contains("Yes, delete this project").should("be.disabled");
    cy.get("input[name=project-settings-general-delete-confirm-box]").type(
      "e2e/local-test-project"
    );
    cy.get("button")
      .contains("Yes, delete this project")
      .should("be.enabled")
      .click();
    cy.wait("@deleteProject");

    cy.url().should("not.contain", "/projects");
    cy.get(".Toastify")
      .contains("Project e2e/local-test-project deleted")
      .should("be.visible");
  });

  it("delete a project - not allowed", () => {
    fixtures.userNone();
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.get_cy("settings-container").should("be.visible");
    cy.get_cy("project-settings-general-delete-project").should("not.exist");
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
