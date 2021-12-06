describe("render the home page", () => {
  it("renders correctly", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });

  it("login", () => {
    const userData = { email: "dalatinrofrau@gmail.com", password: "123456" };
    cy.gui_kc_login(userData);
  });


});
