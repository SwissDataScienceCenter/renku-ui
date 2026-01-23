import fixtures from "../support/renkulab-fixtures";

describe("Cookie component", () => {
  beforeEach(() => {
    fixtures.config({ fixture: "config_privacy_banner.json" }).userTest();
  });

  it("Shows default cookies message when privacy banner is enabled", () => {
    cy.visit("/");

    cy.getDataCy("privacy-policy-link").should("be.visible");
    cy.getDataCy("cookie-consent").contains("requires cookies");
  });
});
