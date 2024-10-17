/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

describe("Interact with Connected services", () => {
  beforeEach(() => {
    fixtures.versions().userTest();
    fixtures
      .listConnectedServicesProviders({ empty: true })
      .listConnectedServicesConnections({ empty: true });
  });

  it("Shows an empty page when no services are available", () => {
    cy.visit("/v2/connected-services");
    cy.getDataCy("connected-services-page").should(
      "contain.text",
      "There are currently no external services"
    );
  });

  it("Connect GitHub user", () => {
    fixtures.listConnectedServicesProviders();
    cy.visit("/v2/connected-services");
    cy.getDataCy("connected-services-card").should("have.length", 2);
    cy.getDataCy("connected-services-card").contains("GitHub.com");
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("Not connected");
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("a", "Connect");

    // ? Instead of clicking the Connect link, we just load the connection.
    fixtures.listConnectedServicesConnections();
    cy.reload();
    cy.visit("/v2/connected-services");
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("Connected");
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("a", "Reconnect");
  });

  it("GitHub user - check account", () => {
    fixtures
      .listConnectedServicesProviders()
      .listConnectedServicesConnections()
      .listConnectedServicesAccount()
      .listConnectedServicesInstallations({ empty: true });
    cy.visit("/v2/connected-services");

    cy.getDataCy("connected-services-card")
      .should("contain", "@my-github-user")
      .and("contain", "is not installed in any project");

    fixtures.listConnectedServicesInstallations({
      fixture: "connectedServicesV2/installationsSuspended.json",
    });
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("Check again")
      .click();

    cy.getDataCy("connected-services-card")
      .should("contain", "@my-github-user")
      .and("contain", "suspended")
      .and("contain", "not active in any project");

    fixtures.listConnectedServicesInstallations();
    cy.getDataCy("connected-services-card")
      .filter(`:contains("GitHub.com")`)
      .contains("Check again")
      .click();

    cy.getDataCy("connected-services-card")
      .should("contain", "@my-github-user")
      .and("contain", "is installed in");
  });
});
