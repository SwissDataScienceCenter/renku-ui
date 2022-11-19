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
      cy.get_cy("log-tab").should("have.length", Object.keys(logs).length);
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

  it("display logs in fullscreen session", () => {
    cy.gui_open_session();
    fixtures.getLogs("getLogs-empty", "sessions/emptyLogs.json");
    cy.get_cy("resources-button").click();
    // empty logs
    cy.get_cy("logs-tab").click();
    cy.wait("@getLogs-empty");
    cy.get_cy("no-logs-message").should("exist");
    // clean logs
    fixtures.getLogs("getLogs-clean", "sessions/cleanLogs.json");
    cy.get_cy("retry-logs-body").click();
    cy.wait("@getLogs-clean");
    cy.get_cy("no-logs-message").should("exist");
    // logs with data
    fixtures.getLogs("getLogs-full", "sessions/logs.json");
    cy.get_cy("retry-logs-body").click();
    cy.wait("@getLogs-full").then( (result) => {
      const logs = result.response.body;
      // validate see logs and can download it
      // eslint-disable-next-line max-nested-callbacks
      const validLogs = Object.keys(logs).filter(key => logs[key].length > 0);
      cy.get_cy("log-tab").should("have.length", validLogs.length);
      cy.get_cy("session-log-download-button").should("be.enabled");
    });
  });

  it("display fullscreen session", () => {
    cy.gui_open_session();
    // open about modal info
    cy.get_cy("about-button").click();
    cy.get_cy("list-card-title").should("contain.text", "local-test-project");
    cy.get_cy("modal-header").find(".btn-close").click();
    // open resources modal
    cy.get_cy("resources-button").click();
    cy.get_cy("cheat-sheet-tab").should("exist");
    cy.get_cy("docs-tab").should("exist");
    cy.get_cy("logs-tab").should("exist");
    cy.get_cy("modal-header").find(".btn-close").click();
    // stop session
    cy.get_cy("stop-session-button").click();
    cy.get_cy("stop-session-modal-button").should("exist");

  });

  it("save session button -- no sidecar", () => {
    fixtures.getSidecarHealth(false);
    cy.gui_open_session();
    // save session
    cy.get_cy("save-session-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Save Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("It is not possible to offer a one-click save for this session.").should("be.visible");
  });

  it("save session button -- session clean", () => {
    fixtures.getSidecarHealth().getGitStatusClean();
    cy.gui_open_session();
    // save session
    cy.get_cy("save-session-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Save Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("Your session is up-to-date.").should("be.visible");
  });

  it("save session button -- session ahead", () => {
    fixtures.getSidecarHealth().getGitStatusDirty();
    cy.gui_open_session();
    // save session
    cy.get_cy("save-session-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Save Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("You have work in this session that has not yet been saved to the server.").should("be.visible");
  });

  it("pull changes button -- no sidecar", () => {
    fixtures.getSidecarHealth(false);
    cy.gui_open_session();
    // pull changes
    cy.get_cy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Refresh Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("It is not possible to offer a one-click refresh for this session.").should("be.visible");
  });

  it("pull changes button -- session clean", () => {
    fixtures.getSidecarHealth().getGitStatusClean();
    cy.gui_open_session();
    // pull changes
    cy.get_cy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Refresh Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("Your session is up-to-date.").should("be.visible");
  });

  it("pull changes button -- session behind", () => {
    fixtures.getSidecarHealth().getGitStatusBehind();
    cy.gui_open_session();
    // pull changes
    cy.get_cy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Refresh Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("This session is behind the server").should("be.visible");
  });

  it("pull changes button -- session diverged", () => {
    fixtures.getSidecarHealth().getGitStatusDiverged();
    cy.gui_open_session();
    // pull changes
    cy.get_cy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog").get("h5").contains("Refresh Session").should("be.visible");
    cy.get(".modal-dialog").get("div")
      .contains("Your session has diverged from the origin.").should("be.visible");
  });
});
