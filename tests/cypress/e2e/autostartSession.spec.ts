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

describe("launch autostart sessions", () => {
  const projectUrl = "/projects/e2e/local-test-project";
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures
      .sessionServersEmpty()
      .renkuIni()
      .sessionServerOptions()
      .projectLockStatus()
      .resourcePoolsTest()
      .newSessionImages();
    fixtures.userTest();
  });

  it("autostart session - not found custom values branch", () => {
    const invalidBranch = "no-valid-branch";
    cy.visit(`${projectUrl}/sessions/new?autostart=1&branch=${invalidBranch}`);
    const alertMessage = `The session could not start because the branch ${invalidBranch} does not exist. Please select another branch to start a session.`;
    cy.wait("@getProjectBranches");
    cy.wait("@getSessionServerOptions", { timeout: 10000 });
    cy.get(".alert-danger").should("contain.text", alertMessage);
  });

  it("autostart session - not found custom values commit", () => {
    const invalidCommit = "no-valid-commit";
    cy.visit(
      `${projectUrl}/sessions/new?autostart=1&commit=${invalidCommit}&branch=master`
    );
    const alertMessage = `The session could not start because the commit ${invalidCommit} does not exist. Please select another commit to start a session.`;
    cy.wait("@getProjectCommits");
    cy.wait("@getSessionServerOptions", { timeout: 10000 });
    cy.get(".alert-danger").should("contain.text", alertMessage);
  });
});

describe("launch autostart session for migrated project", () => {
  const projectUrl = "/projects/e2e/local-test-project";
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures
      .sessionServersEmpty()
      .renkuIni()
      .sessionServerOptions()
      .projectLockStatus()
      .resourcePoolsTest()
      .newSessionImages()
      .namespaces()
      .readProjectV2();
    fixtures.userTest();
  });

  it("autostart session redirects to migrated project for viewer", () => {
    fixtures.readProjectV1Migration().readProjectV2();
    cy.visit(`${projectUrl}/sessions/new?autostart=1`);
    cy.wait("@readProjectV1Migration");
    cy.contains("Checking if project has been migrated").should("be.visible");
    cy.url().should("contain", "/p/user1-uuid/test-2-v2-project");
    cy.contains("Welcome to the New Renku!").should("be.visible");
    cy.contains("To launch a session").should("be.visible");
  });

  it("autostart session redirects to migrated project for owner", () => {
    fixtures.readProjectV1Migration().readProjectV2().getProjectV2Permissions();
    cy.visit(`${projectUrl}/sessions/new?autostart=1`);
    cy.wait("@readProjectV1Migration");
    cy.contains("Checking if project has been migrated").should("be.visible");
    cy.url().should("contain", "/p/user1-uuid/test-2-v2-project");
    cy.contains("Welcome to the New Renku!").should("be.visible");
    cy.contains("You can generate new autostart links").should("be.visible");
  });

  it("autostart session unchanged for non-migrated project", () => {
    fixtures.readProjectV1MigrationError();
    cy.visit(`${projectUrl}/sessions/new?autostart=1`);
    cy.contains("Checking if project has been migrated").should("be.visible");
    cy.wait("@readProjectV1Migration");
    cy.contains("Preparing session").should("be.visible");
  });
});

describe("launch autostart sessions without legacy support", () => {
  const projectUrl = "/projects/e2e/local-test-project";
  beforeEach(() => {
    fixtures
      .config({ fixture: "config-no-legacy.json" })
      .versions()
      .projects()
      .landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures
      .sessionServersEmpty()
      .renkuIni()
      .sessionServerOptions()
      .projectLockStatus()
      .resourcePoolsTest()
      .newSessionImages();
    fixtures.userTest();
  });

  it("autostart session redirects to migrated project", () => {
    fixtures
      .urlRedirect({
        sourceUrl: encodeURIComponent(projectUrl),
        targetUrl: "/p/THEPROJECTULID26CHARACTERS",
      })
      .readProjectV2ById()
      .readProjectV2();
    cy.visit(`${projectUrl}/sessions/new?autostart=1`);
    cy.contains("Checking for redirect").should("be.visible");
    cy.wait("@getUrlRedirect");
    cy.wait("@readProjectV2ById");
    cy.url().should(
      "contain",
      "/p/user1-uuid/test-2-v2-project?autostartRedirect=true"
    );
  });

  it("autostart session shows not supported for non-migrated project", () => {
    fixtures.urlRedirect({
      sourceUrl: encodeURIComponent(projectUrl),
      targetUrl: null,
    });
    cy.visit(`${projectUrl}/sessions/new?autostart=1`);
    cy.contains("Checking for redirect").should("be.visible");
    cy.wait("@getUrlRedirect");
    cy.contains("Legacy not supported").should("be.visible");
  });
});
