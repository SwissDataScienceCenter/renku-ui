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
const PROJECT_PATH = "/p/user1-uuid/test-2-v2-project";

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

function setupSubmitJobPage() {
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
    .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
    .listProjectV2Members()
    .sessionLaunchers({
      fixture: "projectV2/session-launchers-job.json",
    })
    .sessionServersEmptyV2()
    .sessionImage()
    .resourcePoolsTest()
    .getResourceClass();

  setupSubmitJobPrerequisites();
}

function visitProjectSessions() {
  cy.visit(PROJECT_PATH);
  cy.wait("@readProjectV2");
  cy.wait("@sessionLaunchers");
  cy.wait("@sessionServersEmptyV2");
}

function openSubmitJobModal() {
  cy.getDataCy("session-launcher-item")
    .first()
    .within(() => {
      cy.getDataCy("submit-job-button").click();
    });
  cy.wait("@readProjectV2ById");
  cy.getDataCy("submit-job-modal").should("be.visible");
}

function fillSubmissionId(submissionId: string) {
  cy.getDataCy("submit-job-nickname-input").clear().type(submissionId);
}

function confirmSubmitJob() {
  cy.getDataCy("submit-job-confirm-button").click();
}

function buildSubmitJobSuccessBody(
  session: Record<string, unknown>,
  submissionId: string,
) {
  return {
    ...session,
    submission_id: submissionId,
    session_type: "non_interactive",
    launcher_id: JOB_LAUNCHER_ID,
    project_id: JOB_PROJECT_ID,
  };
}

function createSubmitJobSuccessHandler(
  session: Record<string, unknown>,
  submissionId: string,
  options?: { command?: string[]; args?: string[] },
) {
  const { command, args } = options ?? {};

  return (req: {
    body: Record<string, unknown>;
    reply: (response: unknown) => void;
  }) => {
    expect(req.body.submission_id).to.eq(submissionId);
    expect(req.body.launcher_id).to.eq(JOB_LAUNCHER_ID);
    if (command != null) {
      expect(req.body.job_command_override).to.deep.eq(command);
    }
    if (args != null) {
      expect(req.body.job_args_override).to.deep.eq(args);
    }
    req.reply({
      body: buildSubmitJobSuccessBody(session, submissionId),
    });
  };
}

function createSubmitJobFailureThenSuccessHandler(
  session: Record<string, unknown>,
  submissionId: string,
  attempts: { count: number },
) {
  return (req: {
    body: Record<string, unknown>;
    reply: (response: unknown) => void;
  }) => {
    attempts.count += 1;
    expect(req.body.submission_id).to.eq(submissionId);
    expect(req.body.launcher_id).to.eq(JOB_LAUNCHER_ID);

    if (attempts.count === 1) {
      req.reply({
        statusCode: 500,
        body: { message: "Unable to submit job" },
      });
      return;
    }

    req.reply({
      body: buildSubmitJobSuccessBody(session, submissionId),
    });
  };
}

function interceptSubmitJobSuccess(
  submissionId: string,
  options?: {
    alias?: string;
    command?: string[];
    args?: string[];
  },
) {
  const { alias = "submitJob", command, args } = options ?? {};

  cy.fixture("sessions/sessionV2.json").then((session) => {
    cy.intercept(
      "POST",
      "/api/data/sessions",
      createSubmitJobSuccessHandler(session, submissionId, { command, args }),
    ).as(alias);
  });
}

function interceptSubmitJobFailureThenSuccess(
  submissionId: string,
  attempts: { count: number },
  alias = "submitJob",
) {
  cy.fixture("sessions/sessionV2.json").then((session) => {
    cy.intercept(
      "POST",
      "/api/data/sessions",
      createSubmitJobFailureThenSuccessHandler(session, submissionId, attempts),
    ).as(alias);
  });
}

describe("submit job from launcher", () => {
  beforeEach(() => {
    setupSubmitJobPage();
    visitProjectSessions();
  });

  describe("submit job form", () => {
    it("validates submission id and submits successfully", () => {
      openSubmitJobModal();

      cy.getDataCy("submit-job-launcher-name").should(
        "contain.text",
        "Job-custom",
      );
      cy.getDataCy("submit-job-args-input").should("be.visible");

      cy.getDataCy("submit-job-nickname-input").type("bad nick");
      confirmSubmitJob();
      cy.getDataCy("submit-job-nickname-input")
        .parent()
        .find(".invalid-feedback")
        .should("be.visible");

      fillSubmissionId("run01");
      interceptSubmitJobSuccess("run01");

      confirmSubmitJob();
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

      openSubmitJobModal();
      fillSubmissionId("run01");
      confirmSubmitJob();
      cy.getDataCy("submit-job-nickname-input")
        .parent()
        .find(".invalid-feedback")
        .should("contain.text", "already used");
    });

    it("sends command and args overrides in the request", () => {
      openSubmitJobModal();
      fillSubmissionId("run01");
      cy.getDataCy("submit-job-command-input").clear().type('["python3"]');
      cy.getDataCy("submit-job-args-input").clear().type('["--verbose"]');

      interceptSubmitJobSuccess("run01", {
        command: ["python3"],
        args: ["--verbose"],
      });

      confirmSubmitJob();
      cy.wait("@submitJob");
      cy.contains("Job run01 submitted successfully").should("be.visible");
    });

    it("retries after a failed submission", () => {
      const submitAttempts = { count: 0 };

      interceptSubmitJobFailureThenSuccess("run01", submitAttempts);

      openSubmitJobModal();
      fillSubmissionId("run01");

      confirmSubmitJob();
      cy.wait("@submitJob");
      cy.getDataCy("submit-job-modal").contains("Unable to submit job");

      confirmSubmitJob();
      cy.wait("@submitJob");
      cy.contains("Job run01 submitted successfully").should("be.visible");
      cy.wrap(submitAttempts).its("count").should("eq", 2);
    });
  });

  describe("launch prerequisites", () => {
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

      openSubmitJobModal();
      fillSubmissionId("run01");
      confirmSubmitJob();
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

      openSubmitJobModal();
      fillSubmissionId("run02");
      confirmSubmitJob();
      cy.getDataCy("session-secrets-modal").should("be.visible");
      cy.getDataCy("session-secrets-modal-skip-button").click();
      cy.getDataCy("session-secrets-modal").should("not.exist");
    });

    it("shows data connector validation when submitting the job", () => {
      fixtures
        .testCloudStorage()
        .listProjectDataConnectors()
        .getDataConnector()
        .dataConnectorSecrets({
          dataConnectorId: "ULID-1",
          fixture: "dataConnector/data-connector-secrets-empty.json",
        });

      cy.reload();
      cy.wait("@sessionLaunchers");
      cy.wait("@listProjectDataConnectors");

      openSubmitJobModal();
      fillSubmissionId("run03");
      interceptSubmitJobSuccess("run03");
      confirmSubmitJob();

      cy.getDataCy("job-data-connector-credentials-modal").should("be.visible");
      cy.getDataCy("job-data-connector-credentials-modal")
        .contains("Continue")
        .click();
      cy.getDataCy("job-data-connector-credentials-modal")
        .contains("Please provide")
        .should("be.visible");
      cy.getDataCy("job-data-connector-credentials-modal")
        .find("#access_key_id")
        .type("access key");
      cy.getDataCy("job-data-connector-credentials-modal")
        .find("#secret_access_key")
        .type("secret key");
      cy.getDataCy("job-data-connector-credentials-modal")
        .contains("Continue")
        .click();
      cy.wait("@testCloudStorage");
      cy.getDataCy("job-data-connector-credentials-modal").should("not.exist");
      cy.wait("@submitJob");
      cy.contains("Job run03 submitted successfully").should("be.visible");
    });
  });
});
