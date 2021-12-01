describe("render the home page", () => {
  it("renders correctly", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });

  it("login", () => {
    cy.visit("/");
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.px-2.mt-3 > #login-button').click();
    cy.get('span > a').click();
    cy.get('#firstName').clear();
    cy.get('#firstName').type('jhon');
    cy.get('#lastName').clear();
    cy.get('#lastName').type('doe');
    cy.get('#email').clear();
    cy.get('#email').type('andrea.cordoba@sdcs.ethz.ch');
    cy.get('#password').clear();
    cy.get('#password').type('123456');
    cy.get('#password-confirm').clear();
    cy.get('#password-confirm').type('123456');
    cy.get('#kc-form-buttons > input').click();
    cy.get('#username').clear();
    cy.get('#username').type('andrea.cordoba@sdcs.ethz.ch');
    cy.get('#password').clear();
    cy.get('#password').type('123456');
    cy.get('#kc-login').click();
    /* ==== End Cypress Studio ==== */
  });
});
