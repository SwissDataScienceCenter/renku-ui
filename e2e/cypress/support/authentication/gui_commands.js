Cypress.Commands.add('gui_kc_login', ({ name, email, password }, startFromHome = false) => {
  if (startFromHome) {
    cy.visit("/");
    cy.get('.rk-pt-s > #login-button').click();
  }
  cy.get('#username').clear();
  cy.get('#username').type(email);
  cy.get('#password').clear();
  cy.get('#password').type(password);
  cy.get('#kc-login').click();

  cy.url().then( (url) => {
    // User doesnt exist
    if (url.includes("auth/realms/Renku/login-actions/authenticate")) {
      cy.gui_kc_register({ name, email, password });
    }
    else if (url.includes("dev.renku.ch/auth/realms/Renku/protocol/openid-connect/auth")) {
      // Next logging again in dev
      cy.gui_kc_login({ name, email, password }, false);
    }
    else if (url.includes("dev.renku.ch/gitlab/oauth/authorize")) {
      // Accept gitlab autorization
      cy.get("[data-qa-selector='authorization_button']").click();
      cy.gui_is_welcome_page_logged_user(name);
    }
    else {
      cy.gui_is_welcome_page_logged_user(name);
    }
  });

});

Cypress.Commands.add('gui_kc_register', ({ name, email, password }) => {
  cy.visit('/');
  cy.get('.px-2.mt-3 > #login-button').click();
  cy.get('span > a').contains("Register").click();
  cy.get('#firstName').clear();
  cy.get('#firstName').type(name);
  cy.get('#lastName').clear();
  cy.get('#lastName').type('User');
  cy.get('#email').clear();
  cy.get('#email').type(email);
  cy.get('#password').clear();
  cy.get('#password').type(password);
  cy.get('#password-confirm').clear();
  cy.get('#password-confirm').type(password);
  cy.get('#kc-form-buttons > input').click();
});

Cypress.Commands.add('gui_is_welcome_page_logged_user', (username) => {
  cy.url().then( (url) => {
    cy.url().should('be.equal', Cypress.config('baseUrl'));
    cy.get("[data-cy='username-home']").contains(`${username} @ Renku`);
  });
});

Cypress.Commands.add('gui_loggout', () => {
  cy.visit('/');
  cy.get('#profile-dropdown > #userIcon').click();
  cy.get('#logout-link').click();
  cy.url().then( (url) => {
    // redirect to home takes 5 second
    cy.wait(5000);
    cy.url().should('be.equal', Cypress.config('baseUrl'));
    cy.get('.rk-pt-s > #login-button').contains("Login");
  });
});

