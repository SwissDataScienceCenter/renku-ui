/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

describe("submit job from launcher", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user1-uuid",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .projects()
      .readGroupV2Namespace({ groupSlug: "user1-uuid" })
      .landingUserProjects()
      .readProjectV2()
      .readProjectV2WithoutDocumentation()
      .listProjectV2Members()
      .sessionLaunchers({
        fixture: "projectV2/session-launchers-job.json",
      })
      .sessionServersEmptyV2()
      .sessionImage()
      .resourcePoolsTest()
      .getResourceClass();

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@sessionServersEmptyV2");
  });

  it("submits a job with nickname as submission_id", () => {
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("submit-job-button").click();
      });

    cy.getDataCy("submit-job-modal").should("be.visible");
    cy.getDataCy("submit-job-launcher-name").should(
      "contain.text",
      "Job-custom",
    );
    cy.getDataCy("submit-job-command-input").should("be.visible");
    cy.getDataCy("submit-job-args-input").should("be.visible");

    cy.getDataCy("submit-job-nickname-input").type("bad nick");
    cy.getDataCy("submit-job-confirm-button").click();
    cy.getDataCy("submit-job-nickname-input")
      .parent()
      .find(".invalid-feedback")
      .should("be.visible");

    cy.getDataCy("submit-job-nickname-input").clear().type("run01");

    cy.fixture("sessions/sessionV2.json").then((session) => {
      cy.intercept("POST", "/api/data/sessions", (req) => {
        expect(req.body.submission_id).to.eq("run01");
        expect(req.body.launcher_id).to.eq("01HYJE99XEKWNKPYN8WRB6QA8Z");
        req.reply({
          body: {
            ...session,
            submission_id: "run01",
            session_type: "non_interactive",
            launcher_id: "01HYJE99XEKWNKPYN8WRB6QA8Z",
            project_id: "01HYJE5FR1JV4CWFMBFJQFQ4RM",
          },
        });
      }).as("submitJob");
    });

    cy.getDataCy("submit-job-confirm-button").click();
    cy.wait("@submitJob");
    cy.getDataCy("submit-job-success-nickname").should("contain.text", "run01");
  });

  it("rejects duplicate nicknames for the same launcher", () => {
    fixtures.getSessionsV2({
      fixture: "projectV2/sessions-with-submission-id.json",
      name: "getSessionsWithSubmission",
    });

    cy.reload();
    cy.wait("@sessionLaunchers");
    cy.wait("@getSessionsWithSubmission");

    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("submit-job-button").click();
      });

    cy.getDataCy("submit-job-nickname-input").type("run01");
    cy.getDataCy("submit-job-confirm-button").click();
    cy.getDataCy("submit-job-nickname-input")
      .parent()
      .find(".invalid-feedback")
      .should("contain.text", "already used");
  });
});
