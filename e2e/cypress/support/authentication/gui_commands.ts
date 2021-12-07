import { User } from "./user.interfaces";

Cypress.Commands.add("gui_kc_login", (user: User, startFromHome = false) => {
  if (startFromHome) {
    cy.visit("/");
    cy.get(".rk-pt-s > #login-button").click();
  }
  cy.get("#username").clear();
  cy.get("#username").type(user.email);
  cy.get("#password").clear();
  cy.get("#password").type(user.password);
  cy.get("#kc-login").click();

  cy.url().then( (url) => {
    // User doesnt exist
    if (url.includes("auth/realms/Renku/login-actions/authenticate")) {
      cy.gui_kc_register(user);
    }
    else if (url.includes("dev.renku.ch/auth/realms/Renku/protocol/openid-connect/auth")) {
      // Next logging again in dev
      cy.gui_kc_login(user, false);
    }
    else if (url.includes("dev.renku.ch/gitlab/oauth/authorize")) {
      // Accept gitlab authorization
      cy.get("[data-qa-selector='authorization_button']").click();
      cy.gui_is_welcome_page_logged_user(user.firstname);
    }
    else {
      cy.gui_is_welcome_page_logged_user(user.firstname);
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

Cypress.Commands.add("gui_is_welcome_page_logged_user", (username: string) => {
  cy.url().then( () => {
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
    cy.get(".rk-pt-s > #login-button").contains("Login");
  });
});

