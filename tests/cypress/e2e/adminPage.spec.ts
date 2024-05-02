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

describe("admin page", () => {
  beforeEach(() => {
    fixtures.config().versions();
  });

  it("should not show the link to the admin page to an anonymous user", () => {
    fixtures.userNone();
    cy.visit("/");
    cy.wait("@getUser");

    cy.visit("/admin");

    cy.contains("404").should("be.visible");
    cy.contains("Page not found").should("be.visible");
  });

  it("should not show the admin page to a regular user", () => {
    fixtures.userTest();
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getKeycloakUser");

    cy.visit("/admin");

    cy.contains("404").should("be.visible");
    cy.contains("Page not found").should("be.visible");
  });

  it("should not show the link to the admin page to a regular user", () => {
    fixtures.userTest();
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getKeycloakUser");

    cy.get("#profile-dropdown").should("be.visible").click();

    cy.get("#profile-dropdown")
      .siblings(".dropdown-menu")
      .should("be.visible")
      .contains("Account");

    cy.get("#profile-dropdown")
      .siblings(".dropdown-menu")
      .contains("Admin Panel")
      .should("not.exist");
  });

  it("should show the admin page", () => {
    fixtures.userAdmin();
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getKeycloakUser");

    cy.visit("/admin");

    cy.get("h1").contains("Admin Panel").should("be.visible");
  });

  it("should show the link to the admin page", () => {
    fixtures.userAdmin();
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getKeycloakUser");

    cy.get("#profile-dropdown").should("be.visible").click();

    cy.get("#profile-dropdown")
      .siblings(".dropdown-menu")
      .should("be.visible")
      .contains("Account");

    cy.get("#profile-dropdown")
      .siblings(".dropdown-menu")
      .find("a")
      .contains("Admin Panel")
      .should("be.visible")
      .and("have.attr", "href", "/admin");
  });

  it("should show compute resources", () => {
    fixtures
      .userAdmin()
      .resourcePoolsTest()
      .adminResourcePoolUsers()
      .adminKeycloakUser();
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getKeycloakUser");

    cy.visit("/admin");

    cy.get("h1").contains("Admin Panel").should("be.visible");

    // Check the "Add Resource Pool" button
    cy.get("button").contains("Add Resource Pool").should("be.visible").click();
    cy.get(".modal")
      .contains(".modal-title", "Add resource pool")
      .should("be.visible");
    cy.get(".modal").contains("button", "Close").should("be.visible").click();

    // check public resource pool
    cy.get(".card")
      .contains("button", "Public pool")
      .should("be.visible")
      .click();
    cy.get(".card")
      .contains(".card", "Public pool")
      .contains("Maximum Session Idle Time:1d")
      .should("be.visible");
    cy.get(".card")
      .contains(".card", "Public pool")
      .contains("Maximum Session Hibernation Time:1d")
      .should("be.visible");

    // Check one of the private pools
    cy.get(".card")
      .contains("button", "Special GPU pool")
      .should("be.visible")
      .click();

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("Private pool")
      .should("be.visible");

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("Quota")
      .siblings()
      .contains("500 GPUs")
      .should("be.visible");

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("Maximum Session Idle Time:1d, 10h, 18m")
      .should("be.visible");
    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("Maximum Session Hibernation Time:1w, 4d, 10h, 21m")
      .should("be.visible");
    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("button", "Update Resource Pool Thresholds")
      .should("be.visible");

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("button", "Add Class")
      .should("be.visible")
      .click();
    cy.get(".modal")
      .contains(".modal-title", "Add resource class to Special GPU pool")
      .should("be.visible");
    cy.get(".modal").contains("button", "Close").should("be.visible").click();

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("High-GPU class 1")
      .should("be.visible");
    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("li", "High-GPU class 1")
      .contains("button", "Delete")
      .should("be.visible");

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("button", "Add User")
      .should("be.visible")
      .click();
    cy.get(".modal")
      .contains(".modal-title", "Add User to Resource Pool: Special GPU pool")
      .should("be.visible");
    cy.get(".modal").contains("button", "Close").should("be.visible").click();

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("user1@renku.ch")
      .should("be.visible");
    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("li", "user1@renku.ch")
      .contains("button", "Remove")
      .should("be.visible");

    cy.get(".card")
      .contains(".card", "Special GPU pool")
      .contains("button", "Delete")
      .last()
      .should("be.visible")
      .click();
    cy.get(".modal")
      .contains(
        "Please confirm that you want to delete the High-GPU class 1 resource class from the Special GPU pool resource pool."
      )
      .should("be.visible");
    cy.get(".modal").contains("button", "Cancel").should("be.visible").click();
  });
});
