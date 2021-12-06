Cypress.Commands.add('gui_kc_login', ({ email, password }) => {
  cy.visit('/');
  cy.get('.rk-pt-s > #login-button').click();
  cy.get('#username').clear();
  cy.get('#username').type(email);
  cy.get('#password').clear();
  cy.get('#password').type(password);
  cy.get('#kc-login').click();

  cy.url().then( (url) => {
    if (url.includes("auth/realms/Renku/login-actions/authenticate")) {
      // register user
      cy.gui_kc_register({ email, password });
    } else {
      console.log("successfull logged?");
      cy.visit('/');
      cy.url().should(
        'be.equal',
        Cypress.config('baseUrl')
      );
    }
  });

});

Cypress.Commands.add('gui_kc_register', ({ email, password }) => {
  cy.visit('/');
  cy.get('.px-2.mt-3 > #login-button').click();
  cy.get('span > a').contains("Register").click();
  cy.get('#firstName').clear();
  cy.get('#firstName').type('E2E');
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

