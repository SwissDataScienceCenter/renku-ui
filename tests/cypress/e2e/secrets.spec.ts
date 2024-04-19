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
    fixtures.config().versions().userTest();
  });

  it("Load and empty secrets page", () => {
    fixtures.listSecrets();
    cy.visit("/secrets");

    cy.get("#new-secret-button").should("be.visible");
    cy.getDataCy("secrets-list").should("not.exist");
  });

  it("Load page with secrets", () => {
    fixtures.listSecrets({ numberOfSecrets: 5 });
    cy.visit("/secrets");

    cy.get("#new-secret-button").should("be.visible");
    cy.getDataCy("secrets-list").should("exist");
    cy.getDataCy("secrets-list-item").should("have.length", 5);
    cy.getDataCy("secrets-list")
      .find('[data-cy="secrets-list-item"] button')
      .first()
      .contains("secret_0")
      .click();
    cy.getDataCy("secrets-list")
      .find('[data-cy="secrets-list-item"]')
      .first()
      .contains("id_0");
  });

  it("Edit secret", () => {
    fixtures.listSecrets({ numberOfSecrets: 2 }).editSecret();
    cy.visit("/secrets");

    cy.getDataCy("secrets-list")
      .find('[data-cy="secrets-list-item"] button')
      .first()
      .contains("secret_0")
      .click();
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
    fixtures.listSecrets({ numberOfSecrets: 2 }).deleteSecret();
    cy.visit("/secrets");

    cy.getDataCy("secrets-list")
      .find('[data-cy="secrets-list-item"] button')
      .first()
      .contains("secret_0")
      .click();
    cy.getDataCy("secrets-list")
      .find('[data-cy="secret-delete-button"]')
      .first()
      .click();

    cy.getDataCy("secrets-delete-delete-button").should("be.enabled").click();
    cy.getDataCy("secrets-delete-delete-button").should("not.be.visible");
  });

  // ! TODO: finish test and inspect delay issue
  // it("Create secret", () => {
  //   fixtures.listSecrets();
  //   cy.visit("/secrets");
  //   cy.wait("@listSecrets");

  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(500); // ! something's off with showing the modal
  //   cy.get("#new-secret-button").should("be.visible").click();
  //   // cy.get("#new-secret-button").should("be.visible").click();

  //   // cy.getDataCy("secrets-list")
  //   //   .find('[data-cy="secrets-list-item"] button')
  //   //   .first()
  //   //   .contains("secret_0")
  //   //   .click();
  //   // cy.getDataCy("secrets-list")
  //   //   .find('[data-cy="secret-edit-button"]')
  //   //   .first()
  //   //   .click();

  //   // cy.getDataCy("secrets-edit-form").should("be.visible");
  //   // cy.get("#edit-secret-value").type("new_value");
  //   // cy.getDataCy("secrets-edit-edit-button").should("be.enabled").click();
  //   // cy.getDataCy("secrets-edit-form").should("not.be.visible");
  // });
});
