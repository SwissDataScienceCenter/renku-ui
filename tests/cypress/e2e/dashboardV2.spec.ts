/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

describe("View v2 landing page", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures
      .getSessionsV2({ fixture: "sessions/sessionsV2.json" })
      .projects()
      .landingUserProjects()
      .listManyGroupV2()
      .listManyProjectV2()
      .readProjectV2ById();
    cy.visit("/");
  });

  it("view dashboard", () => {
    cy.contains("My sessions").should("be.visible");
    cy.contains("My projects").should("be.visible");
    cy.contains("My groups").should("be.visible");
  });

  it("view sessions", () => {
    cy.contains("My sessions").should("be.visible");
    cy.getDataCy("dashboard-session-list")
      .find("[data-cy=dashboard-session-list-item]")
      .contains("THEPROJECTULID26CHARACTERS")
      .should("be.visible");

    cy.wait("@readProjectV2ById");
    cy.getDataCy("dashboard-session-list")
      .find("[data-cy=dashboard-session-list-item]")
      .first()
      .find("a.btn")
      .contains("Open")
      .should("be.visible")
      .click();
    cy.location("pathname").should(
      "contain",
      "/p/user1-uuid/test-2-v2-project/sessions/show/renku-2-86688c93091df68dffdc594bfd022ce3"
    );
  });

  it("view projects", () => {
    cy.contains("My projects").should("be.visible");
    cy.getDataCy("dashboard-project-list").children().should("have.length", 5);
    cy.getDataCy("dashboard-project-list").children().first().click();
    cy.location("pathname").should(
      "contain",
      "/p/user1-uuid/test-0-v2-project"
    );
  });

  it("view groups", () => {
    cy.contains("My groups").should("be.visible");
    cy.getDataCy("dashboard-group-list").children().should("have.length", 5);
    cy.getDataCy("group-item").first().click();
    cy.location("pathname").should("contain", "/g/test-0-group-v2");
  });

  it("list groups", () => {
    cy.contains("View other groups").should("not.exist");
    cy.contains("View all my 50 groups").should("be.visible").click();
    cy.contains("Renku 2.0 Search").should("be.visible");
    cy.getDataCy("search-filter-role-owner").should("be.checked");
    cy.getDataCy("search-filter-role-editor").should("be.checked");
    cy.getDataCy("search-filter-role-viewer").should("be.checked");
    cy.getDataCy("search-filter-type-group").should("be.checked");
  });

  it("list projects", () => {
    cy.contains("View other projects").should("not.exist");
    cy.contains("View all my 50 projects").should("be.visible").click();
    cy.contains("Renku 2.0 Search").should("be.visible");
    cy.getDataCy("search-filter-role-owner").should("be.checked");
    cy.getDataCy("search-filter-role-editor").should("be.checked");
    cy.getDataCy("search-filter-role-viewer").should("be.checked");
    cy.getDataCy("search-filter-type-project").should("be.checked");
  });
});

describe("View v2 landing page empty", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().readProjectV2ById();
    cy.visit("/");
  });

  it("view dashboard", () => {
    cy.contains("My sessions").should("be.visible");
    cy.contains("My projects").should("be.visible");
    cy.contains("My groups").should("be.visible");
  });

  it("list groups", () => {
    cy.contains("View all my groups").should("not.exist");
    cy.contains("Create my first group").should("be.visible");
  });

  it("list projects", () => {
    cy.contains("View all my projects").should("not.exist");
    cy.contains("Create my first project").should("be.visible");
    cy.contains("View existing projects").should("be.visible").click();
    cy.contains("Renku 2.0 Search").should("be.visible");
    cy.getDataCy("search-filter-role-owner").should("be.not.checked");
    cy.getDataCy("search-filter-role-editor").should("be.not.checked");
    cy.getDataCy("search-filter-role-viewer").should("be.not.checked");
    cy.getDataCy("search-filter-type-project").should("be.checked");
  });
});
