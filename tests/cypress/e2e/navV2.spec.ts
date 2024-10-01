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

  it("view help", () => {
    cy.getDataCy("help-dropdown").click();
    cy.getDataCy("help-link").click();
    cy.location("pathname").should("contain", "/v2/help");
  });

  it("create new group", () => {
    cy.get("#plus-dropdown").click();
    cy.getDataCy("navbar-group-new").click();
    cy.contains("New Group").should("be.visible");
  });

  it("create new project", () => {
    cy.get("#plus-dropdown").click();
    cy.getDataCy("navbar-project-new").click();
    cy.contains("New Project").should("be.visible");
  });
});
