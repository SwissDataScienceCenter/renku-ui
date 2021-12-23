/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { User, userToUsername } from "./user.interfaces";
const GITLAB_PROVIDER = Cypress.env("GITLAB_PROVIDER");

Cypress.Commands.add("gui_kc_login", (user: User, startFromHome = false) => {
  if (startFromHome) {
    cy.visit("/");
    cy.get("#login-button").click();
  }
  cy.get("#username").clear();
  cy.get("#username").type(user.email);
  cy.get("#password").clear();
  cy.get("#password").type(user.password, { log: false });
  cy.get("#kc-login").click();

  cy.url().then( (url) => {
    // User doesnt exist
    if (url.includes("auth/realms/Renku/login-actions/authenticate")) {
      cy.gui_kc_register(user);
    }
    else if (url.includes(`${GITLAB_PROVIDER}/auth/realms/Renku/protocol/openid-connect/auth`)) {
      // Next logging again in dev
      cy.gui_kc_login(user, false);
    }
    else if (url.includes(`${GITLAB_PROVIDER}/gitlab/oauth/authorize`)) {
      // Accept gitlab authorization
      cy.get("[data-qa-selector='authorization_button']").click();
      cy.gui_is_welcome_page_logged_user(user);
    }
    else {
      cy.gui_is_welcome_page_logged_user(user);
    }
  });

});

Cypress.Commands.add("gui_kc_register", (user: User) => {
  cy.visit("/");
  cy.get(".px-2.mt-3 > #login-button").click();
  cy.get("span > a").contains("Register").click();
  cy.get("#firstName").clear();
  cy.get("#firstName").type(user.firstname);
  cy.get("#lastName").clear();
  cy.get("#lastName").type(user.lastname);
  cy.get("#email").clear();
  cy.get("#email").type(user.email);
  cy.get("#password").clear();
  cy.get("#password").type(user.password);
  cy.get("#password-confirm").clear();
  cy.get("#password-confirm").type(user.password);
  cy.get("#kc-form-buttons > input").click();
});

Cypress.Commands.add("gui_is_welcome_page_logged_user", (user: User) => {
  cy.url().then( () => {
    const username = userToUsername(user);
    cy.url().should("be.equal", Cypress.config("baseUrl"));
    cy.get("[data-cy='username-home']").contains(`${username} @ Renku`);
  });
});

Cypress.Commands.add("gui_logout", () => {
  cy.visit("/");
  cy.get("#profile-dropdown > #userIcon").click();
  cy.get("#logout-link").click();
  cy.url().then( () => {
    cy.url().should("be.equal", Cypress.config("baseUrl"));
    cy.get("#login-button").contains("Login");
  });
});

