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

const JOB_PROJECT_ID = "01HYJE5FR1JV4CWFMBFJQFQ4RM";
const JOB_LAUNCHER_ID = "01HYJE99XEKWNKPYN8WRB6QA8Z";

function setupSubmitJobPrerequisites() {
  fixtures
    .readProjectV2ById({
      projectId: JOB_PROJECT_ID,
      overrides: { id: JOB_PROJECT_ID },
    })
    .getRepositoryMetadata({
      repositoryUrl: "https://domain.name/repo1.git",
    })
    .getRepositoryMetadata({
      repositoryUrl: "https://domain.name/repo2.git",
    })
    .listProjectDataConnectors({
      projectId: JOB_PROJECT_ID,
      fixture: "projectV2/empty-data-connector-links.json",
    })
    .sessionSecretSlots({
      fixture: "projectV2SessionSecrets/empty_list.json",
    })
    .sessionSecrets({
      fixture: "projectV2SessionSecrets/empty_list.json",
    });
}

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

    setupSubmitJobPrerequisites();

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

    cy.wait("@readProjectV2ById");
    cy.getDataCy("submit-job-modal").should("be.visible");
    cy.getDataCy("submit-job-launcher-name").should(
      "contain.text",
      "Job-custom",
    );
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
        expect(req.body.launcher_id).to.eq(JOB_LAUNCHER_ID);
        req.reply({
          body: {
            ...session,
            submission_id: "run01",
            session_type: "non_interactive",
            launcher_id: JOB_LAUNCHER_ID,
            project_id: JOB_PROJECT_ID,
          },
        });
      }).as("submitJob");
    });

    cy.getDataCy("submit-job-confirm-button").click();
    cy.wait("@submitJob");
    cy.contains("Job run01 submitted successfully").should("be.visible");
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

    cy.wait("@readProjectV2ById");
    cy.getDataCy("submit-job-nickname-input").type("run01");
    cy.getDataCy("submit-job-confirm-button").click();
    cy.getDataCy("submit-job-nickname-input")
      .parent()
      .find(".invalid-feedback")
      .should("contain.text", "already used");
  });

  it("shows repository validation when submitting the job", () => {
    fixtures
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo1.git",
        fixture: "repositories/repository-metadata-requestintegration.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
        fixture: "repositories/repository-metadata-requestintegration.json",
      });

    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("submit-job-button").click();
      });

    cy.wait("@readProjectV2ById");
    cy.getDataCy("submit-job-modal").should("be.visible");
    cy.getDataCy("submit-job-nickname-input").type("run01");
    cy.getDataCy("submit-job-confirm-button").click();
    cy.getDataCy("session-repositories-modal").should("be.visible");
    cy.getDataCy("session-repositories-modal-continue").click();
    cy.getDataCy("session-repositories-modal").should("not.exist");
  });

  it("shows session secrets validation when submitting the job", () => {
    fixtures
      .sessionSecretSlots({
        fixture: "projectV2SessionSecrets/secret_slots.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/empty_list.json",
      });

    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("submit-job-button").click();
      });

    cy.wait("@readProjectV2ById");
    cy.getDataCy("submit-job-modal").should("be.visible");
    cy.getDataCy("submit-job-nickname-input").type("run02");
    cy.getDataCy("submit-job-confirm-button").click();
    cy.getDataCy("session-secrets-modal").should("be.visible");
    cy.getDataCy("session-secrets-modal-skip-button").click();
    cy.getDataCy("session-secrets-modal").should("not.exist");
  });
});
