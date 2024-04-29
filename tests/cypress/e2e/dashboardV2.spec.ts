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
      .getSessions({ fixture: "sessions/sessionsV2.json" })
      .projects()
      .landingUserProjects()
      .listManyGroupV2()
      .listManyProjectV2()
      .readProjectV2ById();
    cy.visit("/v2");
  });

  it("view dashboard", () => {
    cy.contains("Sessions").should("be.visible");
    cy.contains("Projects").should("be.visible");
    cy.contains("Groups").should("be.visible");
  });

  it("view sessions", () => {
    cy.contains("Sessions").should("be.visible");
    cy.getDataCy("dashboard-session-list")
      .get("[data-cy=list-session]")
      .should("have.length", 1)
      .contains("Open")
      .should("be.visible")
      .click();
    cy.location("pathname").should(
      "contain",
      "/v2/projects/user1-uuid/test-2-v2-project/sessions/show/renku-2-86688c93091df68dffdc594bfd022ce3"
    );
  });

  it("view projects", () => {
    cy.contains("Projects").should("be.visible");
    cy.getDataCy("dashboard-project-list")
      .get("[data-cy=list-project]")
      .should("have.length", 5);
    cy.getDataCy("list-project-link").first().click();
    cy.location("pathname").should(
      "contain",
      "/v2/projects/user1-uuid/test-0-v2-project"
    );
  });

  it("view groups", () => {
    cy.contains("Groups").should("be.visible");
    cy.getDataCy("dashboard-group-list")
      .get("[data-cy=list-group]")
      .should("have.length", 5);
    cy.getDataCy("list-group-link").first().click();
    cy.location("pathname").should("contain", "/v2/groups/test-0-group-v2");
  });

  it("list groups", () => {
    cy.contains("List Groups").should("not.exist");
    cy.contains("View all my groups").should("be.visible").click();
    cy.contains("List Groups").should("be.visible");
  });

  it("list projects", () => {
    cy.contains("List Projects (V2)").should("not.exist");
    cy.contains("View all my projects").should("be.visible").click();
    cy.contains("List Projects (V2)").should("be.visible");
  });
});
