/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

describe("handle project with repo and image references to internal GitLab", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .projects()
      .landingUserProjects()
      .sessionServersEmptyV2()
      .readProjectV2({
        overrides: {
          repositories: [
            "https://gitlab.renkulab.io/ns/gitlab-project-slug",
            "https://github.com/ns/github-project-slug",
          ],
        },
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers-with-renkulab-gitlab.json",
      });
  });

  it("show warning to editor for repo and image reference", () => {
    fixtures.getProjectV2Permissions();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.contains("You must take action").should("be.visible");
    cy.getDataCy("session-gitlab-warning")
      .contains("Migration needed")
      .should("be.visible");
    cy.getDataCy("repo-gitlab-warning")
      .contains("Migration needed")
      .should("be.visible");
  });

  it("not show warning to observer for repo and image reference", () => {
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.contains("You must take action").should("not.exist");
  });
});

describe("handle project with repo references to internal GitLab", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .projects()
      .landingUserProjects()
      .sessionServersEmptyV2()
      .readProjectV2({
        overrides: {
          repositories: ["https://gitlab.renkulab.io/ns/gitlab-project-slug"],
        },
      })
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      });
  });

  it("show warning to editor for repo reference", () => {
    fixtures.getProjectV2Permissions();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.getDataCy("repo-gitlab-warning")
      .contains("Migration needed")
      .should("be.visible");
  });

  it("not show warning to observer for repo and image reference", () => {
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.contains("You must take action").should("not.exist");
    cy.getDataCy("repo-gitlab-warning")
      .contains("Migration needed")
      .should("not.exist");
  });
});

describe("handle project with launcher references to internal GitLab", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .projects()
      .landingUserProjects()
      .sessionServersEmptyV2()
      .readProjectV2()
      .sessionLaunchers({
        fixture: "projectV2/session-launchers-with-renkulab-gitlab.json",
      });
  });

  it("show warning to editor for launcher reference", () => {
    fixtures.getProjectV2Permissions();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.contains("You must take action").should("be.visible");
    cy.getDataCy("session-gitlab-warning")
      .contains("Migration needed")
      .should("be.visible");
  });

  it("not show warning to observer for repo and image reference", () => {
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description",
    );
    cy.contains("You must take action").should("not.exist");
    cy.getDataCy("session-gitlab-warning")
      .contains("Migration needed")
      .should("not.exist");
  });
});
