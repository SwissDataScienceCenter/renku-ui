describe("render the home page", () => {
  const userData = { firstname: "e2e", lastname: "", email: "e2e@renku.ch", password: "123456" };

  it("renders correctly", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });

  it("login", () => {
    cy.gui_kc_login(userData, true);
  });

  it("logout", () => {
    cy.gui_kc_login(userData, true);
    cy.gui_logout();
  });

});
