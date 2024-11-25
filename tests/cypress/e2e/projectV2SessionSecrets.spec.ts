/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

describe("Project Session Secrets", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .readProjectV2()
      .getProjectV2Permissions();
  });

  it("Shows the session secrets section", () => {
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
  });

  it.only("Shows configured session secrets", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots");
    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret").contains(".badge", "Secret saved").should("be.visible");
    cy.get("@aSecret").contains("code", "a_secret").should("be.visible");
    cy.contains(`[data-cy=session-secret-slot-item]`, "Another Secret")
      .should("be.visible")
      .as("anotherSecret");
    cy.get("@anotherSecret")
      .contains(".badge", "Secret not provided")
      .should("be.visible");
    cy.get("@anotherSecret")
      .contains("code", "another_secret")
      .should("be.visible");
  });
});
