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

const PROJECT_PATH = "/p/user1-uuid/test-2-v2-project";

function setupProjectSessionsPage({
  launchersFixture = "projectV2/session-launchers.json",
  permissionsFixture,
}: {
  launchersFixture?: string;
  permissionsFixture?: string;
} = {}) {
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
    .sessionLaunchers({ fixture: launchersFixture })
    .sessionServersEmptyV2()
    .sessionImage()
    .resourcePoolsTest()
    .getResourceClass()
    .getRepositoryMetadata({
      repositoryUrl: "https://domain.name/repo1.git",
    })
    .sessionSecretSlots({
      fixture: "projectV2SessionSecrets/empty_list.json",
    })
    .sessionSecrets({
      fixture: "projectV2SessionSecrets/empty_list.json",
    });

  if (permissionsFixture) {
    fixtures.getProjectV2Permissions({
      fixture: permissionsFixture,
    });
  }
}

function visitProjectSessions() {
  cy.visit(PROJECT_PATH);
  cy.wait("@readProjectV2WithoutDocumentation");
  cy.wait("@sessionLaunchers");
}

function withinFirstSessionLauncher(callback: () => void) {
  cy.getDataCy("session-launcher-item").first().within(callback);
}

function assertLaunchButtonShowsText(text: string) {
  cy.getDataCy("start-session-button").should("contain.text", text);
}

function assertLaunchButtonShowsLaunch() {
  assertLaunchButtonShowsText("Launch");
}

function openDropdownMenu() {
  cy.getDataCy("button-with-menu-dropdown").click();
}

function assertDropdownHasItems() {
  cy.get(".dropdown-menu.show .dropdown-item").should("have.length.gte", 1);
}

function openDropdownAndAssertNotEmpty() {
  openDropdownMenu();
  assertDropdownHasItems();
}

function assertLaunchButtonDisabled() {
  cy.getDataCy("start-session-button").should("have.class", "disabled");
}

function setupRunningSessionOnLauncher(launcherId: string) {
  cy.fixture("sessions/sessionsV2.json").then((sessions) => {
    cy.intercept("GET", "/api/data/sessions*", {
      body: [
        {
          ...sessions[0],
          launcher_id: launcherId,
        },
      ],
    }).as("getSessionsV2");
    cy.reload();
    cy.wait("@sessionLaunchers");
    cy.wait("@getSessionsV2");
  });
}

function setupBuildLauncherIntercept() {
  cy.fixture("projectV2/session-launchers.json").then((launchers) => {
    const launcher = {
      ...launchers[0],
      environment: {
        ...launchers[0].environment,
        environment_image_source: "build",
      },
    };
    cy.intercept("GET", "/api/data/projects/*/session_launchers", {
      body: [launcher],
    }).as("sessionLaunchers");
    cy.intercept(
      "GET",
      `/api/data/environments/${launcher.environment.id}/builds`,
      {
        body: [
          {
            id: "build-in-progress",
            status: "in_progress",
            created_at: "2024-05-23T09:59:59Z",
          },
        ],
      },
    ).as("environmentBuilds");
  });
}

function clickDropdownMenuIfPresent() {
  cy.getDataCy("button-with-menu-dropdown").then(($toggle) => {
    if ($toggle.length > 0) {
      cy.wrap($toggle).click();
      assertDropdownHasItems();
    }
  });
}

function clickSubmitJobButton() {
  cy.getDataCy("submit-job-button").should("contain.text", "Submit").click();
}

function assertSubmitJobButtonEnabled() {
  cy.getDataCy("submit-job-button").should("not.be.disabled");
}

function setupRunningJob() {
  cy.intercept("GET", "/api/data/sessions*", {
    body: [
      {
        name: "job-run-1",
        project_id: "01HYJE5FR1JV4CWFMBFJQFQ4RM",
        launcher_id: "01HYJE99XEKWNKPYN8WRB6QA9Z",
        session_type: "non-interactive",
        status: { state: "running" },
      },
    ],
  }).as("getSessionsV2");
  cy.reload();
  cy.wait("@sessionLaunchers");
  cy.wait("@getSessionsV2");
}

describe("launcher card actions", () => {
  describe("session launcher", () => {
    beforeEach(() => {
      setupProjectSessionsPage();
      visitProjectSessions();
    });

    it("shows launch on card", () => {
      withinFirstSessionLauncher(assertLaunchButtonShowsLaunch);
    });

    it("shows custom launch in dropdown", () => {
      withinFirstSessionLauncher(openDropdownMenu);
      cy.getDataCy("start-custom-session-button").should(
        "contain.text",
        "Custom launch",
      );
    });

    it("never shows an empty dropdown menu", () => {
      withinFirstSessionLauncher(openDropdownAndAssertNotEmpty);
    });

    it("disables launch when a session is already running", () => {
      setupRunningSessionOnLauncher("01HYJE99XEKWNKPYN8WRB6QA8Z");
      withinFirstSessionLauncher(assertLaunchButtonDisabled);
    });

    it("shows launch when build is in progress but container image is accessible", () => {
      fixtures.getProjectV2Permissions();
      setupBuildLauncherIntercept();

      cy.intercept("GET", "/api/data/sessions/images?image_url=*", {
        body: { accessible: true },
      }).as("sessionImage");

      withinFirstSessionLauncher(assertLaunchButtonShowsLaunch);
    });

    it("does not show an empty dropdown when launch is unavailable during build", () => {
      setupBuildLauncherIntercept();

      cy.intercept("GET", "/api/data/sessions/images?image_url=*", {
        body: { accessible: false },
      }).as("sessionImage");

      withinFirstSessionLauncher(clickDropdownMenuIfPresent);
    });
  });

  describe("job launcher", () => {
    beforeEach(() => {
      setupProjectSessionsPage({
        launchersFixture: "projectV2/session-launchers-job.json",
        permissionsFixture: "projectV2/projectV2-permissions-editor.json",
      });
      visitProjectSessions();
      cy.wait("@getProjectV2Permissions");
    });

    it("shows submit button on card (stub — no modal)", () => {
      withinFirstSessionLauncher(clickSubmitJobButton);
      cy.getDataCy("submit-job-modal").should("not.exist");
    });

    it("allows submit when a job is already running", () => {
      setupRunningJob();
      withinFirstSessionLauncher(assertSubmitJobButtonEnabled);
    });
  });
});

describe("read-only user on job launcher", () => {
  beforeEach(() => {
    setupProjectSessionsPage({
      launchersFixture: "projectV2/session-launchers-job.json",
      permissionsFixture: "projectV2/projectV2-permissions-viewer.json",
    });
    visitProjectSessions();
    cy.wait("@getSessionsV2");
  });

  it("shows submit only without management dropdown", () => {
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("submit-job-button").should("be.visible");
        cy.getDataCy("button-with-menu-dropdown").should("not.exist");
      });
  });
});

describe("launcher panel actions", () => {
  it("shows force launch on main button for inaccessible external image", () => {
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
      .sessionServersEmptyV2()
      .resourcePoolsTest()
      .getResourceClass()
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo1.git",
      })
      .sessionSecretSlots({
        fixture: "projectV2SessionSecrets/empty_list.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/empty_list.json",
      });

    cy.fixture("projectV2/session-launchers.json").then((launchers) => {
      const launcher = {
        ...launchers[0],
        environment: {
          ...launchers[0].environment,
          environment_image_source: "image",
        },
      };
      cy.intercept("GET", "/api/data/projects/*/session_launchers", {
        body: [launcher],
      }).as("sessionLaunchers");
    });

    cy.intercept("GET", "/api/data/sessions/images?image_url=*", {
      body: { accessible: false },
    }).as("sessionImage");

    cy.visit(PROJECT_PATH);
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@sessionLaunchers");
    cy.wait("@sessionImage");

    cy.getDataCy("session-launcher-item").first().click();
    cy.getDataCy("start-session-button").should("contain.text", "Force launch");
  });

  it("shows submit only in job launcher panel", () => {
    setupProjectSessionsPage({
      launchersFixture: "projectV2/session-launchers-job.json",
    });
    visitProjectSessions();

    cy.getDataCy("session-launcher-item").first().click();
    cy.getDataCy("submit-job-button").should("be.visible");
    cy.getDataCy("button-with-menu-dropdown").should("not.exist");
  });
});
