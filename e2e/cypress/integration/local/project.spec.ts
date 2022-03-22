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

import Fixtures from "../../support/renkulab-fixtures";

describe("display a project", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays the project overview page", () => {
    cy.wait("@getReadme");
    // Check that the project header is shown
    cy.get("[data-cy='project-header']").should(
      "contain.text",
      "local-test-project Public"
    );
    // Check that the readme is shown
    cy.get("h1").first().should("contain.text", "local test project");
  });

  it("displays project settings", () => {
    fixtures.sessionServerOptions();
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.contains("Number of CPUs").should("be.visible");
  });

  it("displays project settings with cloud-storage enabled ", () => {
    fixtures.sessionServerOptions(true);
    cy.visit("/projects/e2e/local-test-project/settings/sessions");
    cy.wait("@getSessionServerOptions");
    cy.wait("@getProjectLockStatus");
    cy.contains("Number of CPUs").should("be.visible");
  });
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
    cy.contains("This project is using the latest version of renku.").should(
      "be.visible"
    );
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
    cy.contains(
      "Updating to the latest version of renku is highly recommended."
    ).should("be.visible");
  });

  it("displays required migration", () => {
    fixtures.projectMigrationRequired();
    cy.visit("/projects/e2e/local-test-project/overview/status");
    // Check that the migration suggestion is shown
    cy.contains("This project is not compatible with the RenkuLab UI").should(
      "be.visible"
    );
  });
});

describe("display lock status", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectMigrationUpToDate();
    fixtures.projectLockStatus();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("displays nothing for non-locked project", () => {
    fixtures.projectLockStatus();
    cy.visit("/projects/e2e/local-test-project/");
    cy.contains("currently being modified").should("not.exist");
  });

  it("displays messages for locked project", () => {
    fixtures.projectLockStatus(true);
    cy.visit("/projects/e2e/local-test-project/");
    cy.contains("currently being modified").should("be.visible");
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
    cy.wait("@getProjectLockStatus");
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
