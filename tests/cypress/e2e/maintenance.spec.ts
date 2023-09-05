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

import Fixtures from "../support/renkulab-fixtures";
import "../support/utils";

describe("display the maintenance page", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;

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
