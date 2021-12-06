describe("render the home page", () => {
  it("renders correctly", () => {
    cy.log(process.env.RENKU_RELEASE);
    cy.visit("/");
    cy.get("body").should("exist");
  });

  it("login", () => {
    const userData = { name: "e2e", email: "e2e@renku.ch", password: "123456" };
    cy.gui_kc_login(userData, true);
  });

  it("logout", () => {
    const userData = { name: "e2e", email: "e2e@renku.ch", password: "123456" };
    cy.gui_kc_login(userData, true);
    cy.gui_loggout();
  });

});
