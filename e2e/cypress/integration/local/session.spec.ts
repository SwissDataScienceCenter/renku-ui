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

import Fixtures from "../../support/renkulab-fixtures";
import "../../support/utils";
import "../../support/sessions/gui_commands";

describe("display a session", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = Cypress.env("USE_FIXTURES") === true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.getSessions();
    cy.visit("/projects/e2e/local-test-project/sessions");
  });

  it("display logs", () => {
    fixtures.getLogs();
    cy.wait("@getSessions");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.gui_open_logs();
    cy.wait("@getLogs").then( (result) => {
      const logs = result.response.body;
      // validate see logs and can download it
      cy.get_cy("logs-tab").should("have.length", Object.keys(logs).length);
      cy.get_cy("session-log-download-button").should("be.enabled");
    });
  });

  it("display error logs", () => {
    fixtures.getLogs("getLogs", "");
    cy.wait("@getSessions");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.gui_open_logs();
    // validate show a warning when there is an error loading the logs
    cy.get_cy("no-logs-available").should("exist");
    cy.get_cy("session-log-download-button").should("be.disabled");
  });
});
