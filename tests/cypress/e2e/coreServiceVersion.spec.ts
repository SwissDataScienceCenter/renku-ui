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

/**
 * Fix the core service version to specific values and test a few calls
 */
import fixtures from "../support/renkulab-fixtures";

const config = {
  overrides: {
    CORE_API_VERSION_CONFIG: {
      coreApiVersion: "2.0",
      overrides: {
        "9": "1.0",
      },
    },
  },
};

describe("display a project", () => {
  beforeEach(() => {
    fixtures.config(config).versions().userTest();
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
    cy.getDataCy("header-project").should("be.visible");
    cy.getDataCy("project-readme")
      .should("be.visible")
      .should("contain.text", "local test project");
    cy.getDataCy("project-title")
      .should("be.visible")
      .should("contain.text", "local-test-project");
  });

  it("displays lock correctly", () => {
    fixtures.projectLockStatus({ locked: true });
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.getDataCy("settings-navbar")
      .contains("a", "Sessions")
      .should("exist")
      .click();
    cy.getDataCy("settings-container")
      .contains("project is currently being modified")
      .should("exist");
  });
});

describe("Project dataset", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config(config).versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList({ path: projectPath });
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
      });
  });
});
