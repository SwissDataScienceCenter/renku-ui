/// <reference types="cypress" />
/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

describe("display the home page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().userNone();
    cy.visit("/");
  });

  it("displays the home page intro text", () => {
    cy.get("h1").should("have.length", 1);
    cy.get("h1")
      .first()
      .should("have.text", "An open-source knowledge infrastructure for collaborative and reproducible data science");
  });
});

describe("404 page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().userNone();
    cy.visit("/xzy");
  });

  it("show error page", () => {
    cy.get("h3").should("contain.text", "Page not found");
  });
});

describe("display the maintenance page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().renkuDown();
    cy.visit("/");
  });

  it("displays an error when trying to get status page information", () => {
    // ! we plan to change this behavior and ignore statuspage info when unavailable #2283
    new Fixtures(cy).config().versions().renkuDown();
    cy.visit("/");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("RenkuLab Down").should("be.visible");
    cy.get(".alert-content").contains("Could not retrieve status information").should("be.visible");
  });

  it("displays status page information", () => {
    new Fixtures(cy).config().versions().getStatuspageInfo();
    cy.visit("/");
    cy.wait("@getStatuspageInfo");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("RenkuLab Down").should("be.visible");
    cy.get("h3").contains("RenkuLab Status").should("be.visible");
    cy.get("h4").contains("Scheduled Maintenance Details").should("be.visible");
  });
});
