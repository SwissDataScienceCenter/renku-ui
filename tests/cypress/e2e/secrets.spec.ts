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

describe("Secrets", () => {
  beforeEach(() => {
    fixtures.config().versions();
  });

  it("Load and empty secrets page", () => {
    fixtures.userTest().listSecrets();
    cy.visit("/secrets");

    cy.get("#new-secret-button").should("be.visible");
    cy.getDataCy("secrets-list").should("not.exist");
  });

  it("Cannot load secrets when logged out", () => {
    fixtures.userNone().listSecrets();
    cy.visit("/secrets");

    cy.getDataCy("secrets-list").should("not.exist");
    cy.getDataCy("secrets-page")
      .contains("Only authenticated users")
      .should("be.visible");
    cy.getDataCy("secrets-page").contains("Log in").should("be.visible");
  });

  it("Load page with secrets and create a new one", () => {
    fixtures.userTest().listSecrets({ numberOfSecrets: 5 }).newSecret();
    cy.visit("/secrets");

    cy.get("#new-secret-button").should("be.visible");
    cy.getDataCy("secrets-list").should("exist");
    cy.getDataCy("secrets-list-item").should("have.length", 5);
    cy.getDataCy("secrets-list").first().contains("secret_0").click();

    cy.get("#new-secret-button").should("be.visible").click();
    cy.getDataCy("secrets-new-add-button").should("be.visible").click();

    cy.getDataCy("secrets-new-form")
      .contains("Please provide a name.")
      .should("be.visible");
    cy.getDataCy("secrets-new-form")
      .contains("Please provide a value.")
      .should("be.visible");

    cy.get("#new-secret-name").type("new secret");
    cy.getDataCy("secrets-new-form")
      .contains("Please provide a name.")
      .should("not.exist");
    cy.getDataCy("secrets-new-form")
      .contains("Only letters, numbers,")
      .should("be.visible");
    cy.get("#new-secret-name").clear().type("new_secret");

    cy.get("#new-secret-value").type("new_value");
    cy.getDataCy("secrets-new-form")
      .contains("Please provide a value.")
      .should("not.exist");

    cy.getDataCy("secrets-new-add-button").should("be.enabled").click();
    cy.getDataCy("secrets-new-form").should("not.be.visible");
  });

  it("Edit secret", () => {
    fixtures.userTest().listSecrets({ numberOfSecrets: 2 }).editSecret();
    cy.visit("/secrets");

    cy.getDataCy("secrets-list").first().contains("secret_0").click();
    cy.getDataCy("secrets-list")
      .find('[data-cy="secret-edit-button"]')
      .first()
      .click();

    cy.getDataCy("secrets-edit-form").should("be.visible");
    cy.get("#edit-secret-value").type("new_value");
    cy.getDataCy("secrets-edit-edit-button").should("be.enabled").click();
    cy.getDataCy("secrets-edit-form").should("not.be.visible");
  });

  it("Delete secret", () => {
    fixtures.userTest().listSecrets({ numberOfSecrets: 2 }).deleteSecret();
    cy.visit("/secrets");

    cy.getDataCy("secrets-list").first().contains("secret_0").click();
    cy.getDataCy("secrets-list")
      .find('[data-cy="secret-delete-button"]')
      .first()
      .click();

    cy.getDataCy("secrets-delete-delete-button").should("be.enabled").click();
    cy.getDataCy("secrets-delete-delete-button").should("not.be.visible");
  });
});
