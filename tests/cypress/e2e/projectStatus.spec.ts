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

import Fixtures from "../support/renkulab-fixtures";

describe("display KG status information", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("Metadata indexed", () => {
    fixtures.getKgStatus();
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@getKgStatus");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Project indexing")
      .should("exist");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Metadata indexing in progress")
      .should("not.exist");
    cy.getDataCy("kg-status-section-close").should("not.exist");
    cy.getDataCy("kg-status-section-open").should("exist").click();
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Everything indexed")
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("exist");
    cy.getDataCy("kg-status-section-open").should("not.exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("Metadata processed with KG indexing failure", () => {
    fixtures.getKgStatus("project/kgStatus/kgStatusIndexedFailure.json");
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@getKgStatus");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Project indexing")
      .should("exist");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Metadata indexing in progress")
      .should("not.exist");
    cy.getDataCy("kg-status-section-close").should("not.exist");
    cy.getDataCy("kg-status-section-open").should("exist").click();
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Everything indexed*")
      .should("exist");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("An error was raised while processing the metadata")
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("exist");
    cy.getDataCy("kg-status-section-open").should("not.exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("Metadata indexing", () => {
    fixtures.getKgStatus("project/kgStatus/kgStatusIndexing.json");
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.wait("@getKgStatus");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Metadata indexing in progress...")
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("not.exist");
    cy.getDataCy("kg-status-section-open").should("exist").click();
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Processing status: 40%")
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("exist");
    cy.getDataCy("kg-status-section-open").should("not.exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("Metadata not indexed", () => {
    fixtures.getKgStatus("project/kgStatus/kgStatus404.json");
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.wait("@getKgStatus");
    cy.getDataCy("project-settings-knowledge-graph")
      .contains("Activate indexing")
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("not.exist");
    cy.getDataCy("kg-status-section-open").should("exist").click();
    cy.getDataCy("project-settings-knowledge-graph")
      .contains(
        "Indexing must be activated to use this project from the RenkuLab web interface"
      )
      .should("exist");
    cy.getDataCy("kg-status-section-close").should("exist");
    cy.getDataCy("kg-status-section-open").should("not.exist");
    cy.getDataCy("project-status-icon-element").should("exist");
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

  it("displays level 1 migration: up-to-date", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level1-all-good.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project up to date")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("not.exist");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("This project uses the latest")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("You are using the latest version")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 2 migration: up-to-date but template potentially missing", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level2-template-core-cache.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project up to date*")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("not.exist");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("This project uses the latest")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("We could not find updates ")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 3 migration: template can be migrated", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level3-only-template.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update available")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("not.be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("This project uses the latest")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("There is a new version of the template ")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update template")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 3 migration: minor version update", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level3-version-minor-and-template.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update available")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("not.be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("it should be safe on this project since it is a minor update")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("There is a new version of the template ")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update template")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 4 migration: old updatable", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level4-old-updatable.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update required")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("not.be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains(
        "project metadata is still on version 9 while the latest version is 10"
      )
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("An upgrade is necessary to support the project")
      .should("not.exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("exist");
  });

  it("displays level 5 migration: old updatable", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level5-old-updatable.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update required")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("not.be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains(
        "project metadata is still on version 8 while the latest version is 10"
      )
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("An upgrade is necessary to support the project")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("exist");
  });

  it("displays level 5 migration: very old manual update", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level5-old-version.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update required")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains(
        "project metadata is still on version 5 while the latest version is 10"
      )
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("An upgrade is necessary to support the project")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("not.exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("exist");
  });

  it("displays level X migration: unknown", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/levelX-too-new.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Unknown project status")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("not.exist");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("Details are not available for this unknown version ")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("not.exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("exist");
  });
});

describe("display migration information for non maintainer", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userNone();
    fixtures.projects().landingUserProjects().projectTestObserver();
    fixtures.namespaces();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays level 1 migration: up-to-date", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level1-all-good.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project up to date")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("not.exist");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("This project uses the latest")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("You are using the latest version")
      .should("exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 3 migration: minor version update", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level3-version-minor-and-template.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update available")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains("it should be safe on this project since it is a minor update")
      .should("not.exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("There is a new")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("not.exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("There is a new version of the template ")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update template")
      .should("not.exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("not.exist");
  });

  it("displays level 5 migration: old updatable", () => {
    fixtures.interceptMigrationCheck(
      "migrationCheck",
      "project/migrationStatus/level5-old-updatable.json"
    );
    cy.visit("/projects/e2e/local-test-project/settings");
    cy.url().should("include", "/projects/e2e/local-test-project/settings");
    cy.wait("@migrationCheck");
    cy.getDataCy("project-settings-migration-status")
      .contains("Project update required")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .get("#button-update-projectMigrationStatus")
      .should("exist")
      .should("be.disabled");
    cy.getDataCy("project-version-section-close").should("not.exist");
    cy.getDataCy("project-version-section-open").should("exist").click();
    cy.getDataCy("project-settings-migration-status")
      .contains(
        "project metadata is still on version 8 while the latest version is 10"
      )
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("An upgrade is necessary to support the project")
      .should("exist");
    cy.getDataCy("project-settings-migration-status")
      .contains("button", "Update version")
      .should("not.exist");
    cy.getDataCy("project-version-section-open").should("not.exist");
    cy.getDataCy("project-version-section-close").should("exist");
    cy.getDataCy("project-status-icon-element").should("exist");
  });
});
