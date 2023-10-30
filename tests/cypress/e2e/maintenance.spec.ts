/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

describe("display the maintenance page", () => {
  // e of the resources on RenkuLab are t
  it("Shows the standard error when UI is down but no maintenance is set", () => {
    fixtures.config();
    cy.visit("/");
    cy.get("h1").first().should("contain.text", "RenkuLab Down");
    cy.visit("/projects");
    cy.get("h1").first().should("contain.text", "RenkuLab Down");
    cy.get("h1").first().should("not.contain.text", "Maintenance ongoing");
  });

  it("Keep showing the maintenance page on every URL", () => {
    fixtures.config({
      name: "getConfigMaintenance",
      fixture: "config_maintenance.json",
    });
    cy.visit("/");
    cy.get("h1").first().should("contain.text", "Maintenance ongoing");
    cy.visit("/projects");
    cy.get("h1").first().should("contain.text", "Maintenance ongoing");
    cy.get("h1").first().should("not.contain.text", "RenkuLab Down");
  });
});

describe("display the maintenance page when there is no user response", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions();
  });

  it("displays an error when trying to get status page information", () => {
    new Fixtures(cy).renkuDown().statuspageDown();
    cy.visit("/");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("RenkuLab Down").should("be.visible");
    cy.get(".alert-content")
      .contains("Could not retrieve status information")
      .should("be.visible");
  });

  it("displays status page information", () => {
    // if the call to get the user fails (e.g., no .userNone() fixture)
    // then show the status page
    new Fixtures(cy).getStatuspageInfo();
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("RenkuLab Down").should("be.visible");
    cy.get("h3").contains("RenkuLab Status").should("be.visible");
    cy.get("h4").contains("Scheduled Maintenance Details").should("be.visible");
  });
});

describe("display the status page", () => {
  it("Shows no banner if there is no incident or maintenance", () => {
    fixtures.config().versions().userNone().getStatuspageInfo();
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get(".alert").should("not.exist");
  });

  it("Shows the banner on the home page if there is a major incident", () => {
    fixtures
      .config()
      .versions()
      .userNone()
      .getStatuspageInfo({ fixture: "statuspage/statuspage-outage.json" });
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get(".alert").contains("RenkuLab is unstable").should("be.visible");
  });

  it("Shows the banner everywhere if there is a major incident", () => {
    fixtures
      .config()
      .versions()
      .userTest()
      .getStatuspageInfo({ fixture: "statuspage/statuspage-outage.json" });
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get(".alert").contains("RenkuLab is unstable").should("be.visible");
    cy.contains("Search").click();
    cy.get(".alert").contains("RenkuLab is unstable").should("be.visible");
    cy.get(".btn-close").should("not.exist");
  });

  it("Shows the banner only on the dashboard if there is a minor incident", () => {
    fixtures
      .config()
      .versions()
      .userTest()
      .getStatuspageInfo({
        overrides: {
          status: {
            indicator: "minor",
            description: "Everything is a little slow, but working",
          },
        },
      });
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get(".alert").contains("RenkuLab is unstable").should("be.visible");
    cy.get(".btn-close").should("be.visible");
    cy.contains("Search").click();
    cy.get(".alert").should("not.exist");
  });
});
