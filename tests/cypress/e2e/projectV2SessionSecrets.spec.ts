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

  it("Shows configured session secrets", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
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

  it("Can add a new session secret slot", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.getDataCy("project-settings-session-secrets")
      .contains("button", "Add session secret")
      .should("be.visible")
      .click();

    cy.contains(".modal-content", "Add session secret")
      .should("be.visible")
      .as("modal");
    cy.get("@modal")
      .contains("label", "Slot name")
      .click()
      .type("A new secret");
    cy.get("@modal")
      .contains("label", "Description")
      .click()
      .type("This is a new secret.");
    cy.get("@modal").contains("label", "Filename").click().type("a_new_secret");

    fixtures.postSessionSecretSlot().sessionSecretSlots({
      fixture: "projectV2SessionSecrets/secret_slots_with_new_slot.json",
      name: "updatedSessionSecretSlots",
    });

    cy.get("@modal")
      .contains("button", "Add session secret slot")
      .should("be.visible")
      .click();
    cy.wait("@postSessionSecretSlot").wait("@updatedSessionSecretSlots");

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.contains(`[data-cy=session-secret-slot-item]`, "A new secret")
      .should("be.visible")
      .as("aNewSecret");
    cy.get("@aNewSecret")
      .contains(".badge", "Secret not provided")
      .should("be.visible");
    cy.get("@aNewSecret").contains("code", "a_new_secret").should("be.visible");
    cy.get("@aNewSecret")
      .contains("This is a new secret.")
      .should("be.visible");
  });

  it("Can edit a session secret slot", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret").contains(".badge", "Secret saved").should("be.visible");
    cy.get("@aSecret")
      .find("[data-cy=session-secret-actions]")
      .contains("button", "Edit")
      .click();

    cy.contains(".modal-content", "Edit session secret slot")
      .should("be.visible")
      .as("modal");
    cy.get("@modal")
      .contains("label", "Filename")
      .click()
      .type("{selectall}{backspace}")
      .type("updated_filename");

    fixtures.patchSessionSecretSlot().sessionSecretSlots({
      fixture: "projectV2SessionSecrets/patched_secret_slots.json",
      name: "updatedSessionSecretSlots",
    });

    cy.get("@modal")
      .contains("button", "Edit session secret slot")
      .should("be.visible")
      .click();
    cy.wait("@patchSessionSecretSlot").wait("@updatedSessionSecretSlots");

    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret").contains(".badge", "Secret saved").should("be.visible");
    cy.get("@aSecret")
      .contains("code", "updated_filename")
      .should("be.visible");
  });

  it("Can delete a session secret slot", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret").contains(".badge", "Secret saved").should("be.visible");
    cy.get("@aSecret")
      .find("[data-cy=session-secret-actions]")
      .find("[data-cy=button-with-menu-dropdown]")
      .click()
      .parentsUntil("[data-cy=button-with-menu-dropdown]")
      .contains("button", "Remove")
      .click();

    cy.contains(".modal-content", "Remove session secret slot")
      .should("be.visible")
      .as("modal");

    fixtures.deleteSessionSecretSlot().sessionSecretSlots({
      fixture: "projectV2SessionSecrets/shortened_secret_slots.json",
      name: "updatedSessionSecretSlots",
    });

    cy.get("@modal")
      .contains("button", "Remove session secret slot")
      .should("be.visible")
      .click();
    cy.wait("@deleteSessionSecretSlot").wait("@updatedSessionSecretSlots");

    cy.get("@aSecret").should("not.exist");
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

  it("Can provide a new secret value", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.contains(`[data-cy=session-secret-slot-item]`, "Another Secret")
      .should("be.visible")
      .as("anotherSecret");
    cy.get("@anotherSecret")
      .contains(".badge", "Secret not provided")
      .should("be.visible");
    cy.get("@anotherSecret")
      .find("[data-cy=session-secret-actions]")
      .contains("button", "Provide secret")
      .click();

    cy.contains(".modal-content", "Provide session secret")
      .should("be.visible")
      .as("modal");
    cy.get("@modal").contains("label", "Provide a new secret value").click();
    cy.get("@modal")
      .contains("label", "Secret value")
      .click()
      .type("my new secret value");

    fixtures
      .patchSessionSecrets({
        fixture: "projectV2SessionSecrets/patch_secrets_with_new_value.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/patched_secrets_with_new_value.json",
        name: "updatedSessionSecrets",
      });

    cy.get("@modal")
      .contains("button", "Save new secret")
      .should("be.visible")
      .click();
    cy.wait("@patchSessionSecrets").wait("@updatedSessionSecrets");

    cy.contains(`[data-cy=session-secret-slot-item]`, "Another Secret")
      .should("be.visible")
      .as("anotherSecret");
    cy.get("@anotherSecret")
      .contains(".badge", "Secret saved")
      .should("be.visible");
    cy.get("@anotherSecret")
      .contains("code", "another_secret")
      .should("be.visible");
  });

  it("Can provide an existing secret value", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.contains(`[data-cy=session-secret-slot-item]`, "Another Secret")
      .should("be.visible")
      .as("anotherSecret");
    cy.get("@anotherSecret")
      .contains(".badge", "Secret not provided")
      .should("be.visible");
    cy.get("@anotherSecret")
      .find("[data-cy=session-secret-actions]")
      .contains("button", "Provide secret")
      .click();

    fixtures.listSecrets({ numberOfSecrets: 1 });

    cy.contains(".modal-content", "Provide session secret")
      .should("be.visible")
      .as("modal");
    cy.get("@modal").contains("label", "Use an existing secret value").click();
    cy.wait("@listSecrets");
    cy.get("@modal").contains("label", "User secret").should("be.visible");
    cy.findReactSelectOptions(
      "session-secret-select-user-secret",
      "session-secret-select-user-secret"
    )
      .first()
      .click(); // click on first option

    fixtures
      .patchSessionSecrets({
        fixture: "projectV2SessionSecrets/patch_secrets_with_new_value.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/patched_secrets_with_new_value.json",
        name: "updatedSessionSecrets",
      });

    cy.get("@modal")
      .contains("button", "Use secret")
      .should("be.visible")
      .click();
    cy.wait("@patchSessionSecrets").wait("@updatedSessionSecrets");

    cy.contains(`[data-cy=session-secret-slot-item]`, "Another Secret")
      .should("be.visible")
      .as("anotherSecret");
    cy.get("@anotherSecret")
      .contains(".badge", "Secret saved")
      .should("be.visible");
    cy.get("@anotherSecret")
      .contains("code", "another_secret")
      .should("be.visible");
  });

  it("Can clear the secret from a slot", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").click();

    cy.getDataCy("project-settings-session-secrets")
      .contains("Session Secrets")
      .should("be.visible");
    cy.wait("@sessionSecretSlots").wait("@sessionSecrets");
    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret").contains(".badge", "Secret saved").should("be.visible");
    cy.get("@aSecret")
      .find("[data-cy=session-secret-actions]")
      .find("[data-cy=button-with-menu-dropdown]")
      .click()
      .parentsUntil("[data-cy=button-with-menu-dropdown]")
      .contains("button", "Clear secret")
      .click();

    cy.contains(".modal-content", "Clear session secret")
      .should("be.visible")
      .as("modal");

    fixtures
      .patchSessionSecrets({
        fixture: "projectV2SessionSecrets/patch_secrets_clear_value.json",
      })
      .sessionSecrets({
        fixture:
          "projectV2SessionSecrets/patched_secrets_with_cleared_value.json",
        name: "updatedSessionSecrets",
      });

    cy.get("@modal")
      .contains("button", "Clear session secret")
      .should("be.visible")
      .click();
    cy.wait("@patchSessionSecrets").wait("@updatedSessionSecrets");

    cy.contains(`[data-cy=session-secret-slot-item]`, "A Secret")
      .should("be.visible")
      .as("aSecret");
    cy.get("@aSecret")
      .contains(".badge", "Secret not provided")
      .should("be.visible");
    cy.get("@aSecret").contains("code", "a_secret").should("be.visible");
  });
});
