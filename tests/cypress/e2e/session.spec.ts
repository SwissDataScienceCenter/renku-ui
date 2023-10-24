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

import fixtures from "../support/renkulab-fixtures";

describe("display a session", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    fixtures.getSessions();
    cy.visit("/projects/e2e/local-test-project/sessions");
  });

  it("display logs", () => {
    fixtures.getLogs();
    cy.wait("@getSessions");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.openLogs();
    cy.wait("@getLogs").then((result) => {
      const logs = result.response.body;
      // validate see logs and can download it
      cy.getDataCy("log-tab")
        .filter(":visible")
        .should("have.length", Object.keys(logs).length);
      cy.getDataCy("session-log-download-button").should("be.enabled");
    });
  });

  it("display error logs", () => {
    fixtures.getLogs("getLogs", "");
    cy.wait("@getSessions");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.openLogs();
    // validate show a warning when there is an error loading the logs
    cy.getDataCy("logs-unavailable-message").should("be.visible");
    cy.getDataCy("session-log-download-button").should("be.disabled");
  });

  it("display logs in fullscreen session", () => {
    cy.openSession();
    fixtures.getLogs("getLogs-empty", "sessions/emptyLogs.json");
    cy.getDataCy("resources-button").click();
    // empty logs
    cy.getDataCy("logs-tab").click();
    cy.wait("@getLogs-empty");
    cy.getDataCy("no-logs-message").should("exist");
    // clean logs
    fixtures.getLogs("getLogs-clean", "sessions/cleanLogs.json");
    cy.getDataCy("retry-logs-body").click();
    cy.wait("@getLogs-clean");
    cy.getDataCy("no-logs-message").should("exist");
    // logs with data
    fixtures.getLogs("getLogs-full", "sessions/logs.json");
    cy.getDataCy("retry-logs-body").click();
    cy.wait("@getLogs-full").then((result) => {
      const logs = result.response.body;
      // validate see logs and can download it
      // eslint-disable-next-line max-nested-callbacks
      const validLogs = Object.keys(logs).filter((key) => logs[key].length > 0);
      cy.getDataCy("log-tab").should("have.length", validLogs.length);
      cy.getDataCy("session-log-download-button").should("be.enabled");
    });
  });

  it("display fullscreen session", () => {
    cy.openSession();
    // open about modal info
    cy.getDataCy("about-button").click();
    cy.getDataCy("list-card-title").should(
      "contain.text",
      "local-test-project"
    );
    cy.getDataCy("modal-header").find(".btn-close").click();
    // open resources modal
    cy.getDataCy("resources-button").click();
    cy.getDataCy("cheat-sheet-tab").should("exist");
    cy.getDataCy("docs-tab").should("exist");
    cy.getDataCy("logs-tab").should("exist");
    cy.getDataCy("modal-header").find(".btn-close").click();
    // stop session
    cy.getDataCy("pause-session-button").should("be.visible").click();
    cy.getDataCy("pause-session-modal-button")
      .should("be.visible")
      .and("be.enabled");
  });

  it("save session button -- no sidecar", () => {
    fixtures.getSidecarHealth(false);
    cy.openSession();
    // save session
    cy.getDataCy("save-session-button").click();
    cy.wait("@getSidecarHealth");
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Save Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains(
        "It is not possible to offer a one-click save for this session."
      )
      .should("be.visible");
  });

  it("save session button -- session clean", () => {
    fixtures.getSidecarHealth().getGitStatusClean();
    cy.openSession();
    // save session
    cy.getDataCy("save-session-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Save Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains("Your session is up-to-date.")
      .should("be.visible");
  });

  it("save session button -- session ahead", () => {
    fixtures.getSidecarHealth().getGitStatusDirty();
    cy.openSession();
    // save session
    cy.getDataCy("save-session-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Save Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains(
        "You have work in this session that has not yet been saved to the server."
      )
      .should("be.visible");
  });

  it("pull changes button -- no sidecar", () => {
    fixtures.getSidecarHealth(false);
    cy.openSession();
    // pull changes
    cy.getDataCy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Refresh Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains(
        "It is not possible to offer a one-click refresh for this session."
      )
      .should("be.visible");
  });

  it("pull changes button -- sidecar error", () => {
    fixtures.getSidecarHealth().getGitStatusError();
    cy.openSession();
    // pull changes
    cy.getDataCy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Refresh Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains(
        "It is not possible to offer a one-click refresh for this session."
      )
      .should("be.visible");
  });

  it("pull changes button -- session clean", () => {
    fixtures.getSidecarHealth().getGitStatusClean();
    cy.openSession();
    // pull changes
    cy.getDataCy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Refresh Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains("Your session is up-to-date.")
      .should("be.visible");
  });

  it("pull changes button -- session behind", () => {
    fixtures.getSidecarHealth().getGitStatusBehind();
    cy.openSession();
    // pull changes
    cy.getDataCy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Refresh Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains("This session is behind the server")
      .should("be.visible");
  });

  it("pull changes button -- session diverged", () => {
    fixtures.getSidecarHealth().getGitStatusDiverged();
    cy.openSession();
    // pull changes
    cy.getDataCy("pull-changes-button").click();
    cy.get(".modal-dialog").should("exist");
    cy.get(".modal-dialog")
      .get("h5")
      .contains("Refresh Session")
      .should("be.visible");
    cy.get(".modal-dialog")
      .get("div")
      .contains("Your session has diverged from the origin.")
      .should("be.visible");
  });
});

describe("display a session with error", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    fixtures.getSessionsError();
    cy.visit("/projects/e2e/local-test-project/sessions");
  });

  it("display error in sessions page", () => {
    fixtures.getLogs("getLogs", "");
    cy.wait("@getSessionsError");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.getDataCy("pause-session-button").should("be.visible");
  });
});

describe("display a session when session is being stopped", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
    fixtures.getSessionsStopping();
    cy.visit("/projects/e2e/local-test-project/sessions");
  });

  it("display main action disabled", () => {
    fixtures.getLogs("getLogs", "");
    cy.wait("@getSessionsStopping");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3500, { log: false }); // necessary because request the job status is called in a interval
    cy.getDataCy("stopping-btn").should("be.disabled");
    cy.getDataCy("stopping-btn").should("be.visible");
  });
});
