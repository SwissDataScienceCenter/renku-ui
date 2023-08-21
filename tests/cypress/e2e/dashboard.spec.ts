/// <reference types="cypress" />
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

import Fixtures from "../support/renkulab-fixtures";
import {
  DISMISSIBLE_SIMPLE_INFO_MESSAGE_FIXTURE,
  NON_DISMISSIBLE_READ_MORE_SUCCESS_MESSAGE_FIXTURE,
} from "../support/renkulab-fixtures/dashboard";
import "../support/utils";

const findProject = (path, projects) => {
  console.log({ path, projects });
  return projects.find(
    (result) => result.response.body.path_with_namespace === path
  );
};

describe("dashboard", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
  });

  it("user does has not own projects and no projects recently visited", () => {
    fixtures
      .projects()
      .entitySearch("getEntities", "kgSearch/emptySearch.json", "0")
      .getRecentlyViewedEntities(
        "getRecentlyViewedEntities",
        "kgSearch/no-recently-viewed-entities.json"
      )
      .noActiveProjects("getNoActiveProjects");

    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getEntities");
    cy.wait("@getRecentlyViewedEntities");
    cy.wait("@getNoActiveProjects");

    cy.get_cy("dashboard-title")
      .should("be.visible")
      .and("have.text", "Renku Dashboard - E2E User");
    cy.get_cy("project-alert")
      .should("be.visible")
      .and("contain.text", "You do not have any projects yet");
    cy.get_cy("projects-container")
      .should("be.visible")
      .and("contain.text", "You do not have any recently-visited projects");
    cy.get_cy("explore-other-projects-btn").should("be.visible");
    cy.get_cy("inactive-kg-project-alert").should("be.visible");
  });

  it("user does not have own project but has visited projects", () => {
    fixtures
      .projects()
      .entitySearch("getEntities", "kgSearch/emptySearch.json", "0")
      .getRecentlyViewedEntities();
    const files = {
      "e2e/nuevo-projecto": 44966,
      "e2e/testing-datasets": 43781,
      "e2e/local-test-project": 39646,
    };
    // fixture landing page project data
    for (const filesKey in files) {
      fixtures.getProjectRTK(
        filesKey,
        "getProject",
        `projects/project_${files[filesKey]}.json`
      );
    }

    cy.visit("/");
    let projects;
    cy.wait("@getUser");
    cy.wait("@getRecentlyViewedEntities").then(
      (result) => (projects = result.response.body)
    );
    cy.wait(Object.keys(files).map((_) => "@getProject")).then((results) => {
      const firstProject = findProject(projects[0].slug, results);
      const projectData = firstProject.response?.body;
      cy.get_cy("projects-container")
        .find('[data-cy="list-card-title"]')
        .first()
        .should("be.visible")
        .and("have.text", projectData.name);
      cy.get_cy("explore-other-projects-btn").should("be.visible");
      cy.get_cy("project-alert")
        .should("be.visible")
        .and("contain.text", "You do not have any projects yet");
      cy.get_cy("inactive-kg-project-alert").should("not.exist");
    });
  });

  it("user has own projects and recently visited projects", () => {
    fixtures
      .projects()
      .entitySearch("getEntities", "kgSearch/search.json", "7")
      .getRecentlyViewedEntities();
    const files = {
      "e2e/nuevo-projecto": 44966,
      "e2e/testing-datasets": 43781,
      "e2e/local-test-project": 39646,
    };
    // fixture landing page project data
    for (const filesKey in files) {
      fixtures.getProjectRTK(
        filesKey,
        "getProject",
        `projects/project_${files[filesKey]}.json`
      );
    }

    cy.visit("/");
    let projects;
    cy.wait("@getUser");
    cy.wait("@getRecentlyViewedEntities").then(
      (result) => (projects = result.response.body)
    );
    cy.wait(Object.keys(files).map((_) => "@getProject")).then((results) => {
      const firstProject = findProject(projects[0].slug, results);
      const projectData = firstProject.response?.body;
      cy.get_cy("projects-container")
        .find('[data-cy="list-card-title"]')
        .first()
        .should("be.visible")
        .and("have.text", projectData.name);
      cy.get_cy("project-alert").should("not.exist");
      cy.get_cy("explore-other-projects-btn").should("not.exist");
      cy.get_cy("view-my-projects-btn").should("be.visible");
    });
  });

  it("user has sessions to display in dashboard", () => {
    fixtures
      .projects()
      .entitySearch("getEntities", "kgSearch/search.json", "7")
      .getRecentlyViewedEntities()
      .getSessions("getSessions", "*", "sessions/sessionsWithError.json")
      .getProjectCommits();
    const files = {
      "dalatinrofrau/flights-usa": 55402,
      "dalatinrofrau/corrupted-project-session-error": 78277,
      "lorenzo.cavazzi.tech/readme-file-dev": 30929,
      "e2e/testing-datasets": 43781,
      "e2e/local-test-project": 39646,
      "e2e/nuevo-project": 44966,
      "e2e/local-test-project-2": 44967,
    };
    // fixture landing page project data
    for (const filesKey in files) {
      fixtures.project(
        filesKey,
        "getProject",
        `projects/project_${files[filesKey]}.json`,
        false
      );
    }

    fixtures.project(
      "lorenzo.cavazzi.tech/readme-file-dev",
      "getFirstProject",
      "projects/project_30929.json",
      true
    );
    cy.visit("projects/lorenzo.cavazzi.tech/readme-file-dev/sessions");
    cy.wait("@getFirstProject");

    cy.wait("@getUser");
    cy.wait("@getSessions");
    cy.get_cy("session-container").should("be.visible");
    cy.get_cy("link-home").click({ force: true }); // eslint-disable-line cypress/no-force
    cy.wait("@getRecentlyViewedEntities");
    cy.get_cy("container-session").should("have.length", 2);
    cy.get_cy("container-session").should("have.length", 2);
    cy.get_cy("container-session")
      .first()
      .find(".session-time")
      .should("be.visible")
      .and("contain.text", "Error");
    cy.get_cy("container-session")
      .first()
      .find(".session-info")
      .should("be.visible")
      .and("contain.text", "master");
    cy.get_cy("container-session")
      .first()
      .find(".session-icon")
      .should("be.visible")
      .and("have.text", "Error");
    cy.get_cy("container-session")
      .first()
      .find(".entity-action")
      .find("button")
      .first()
      .should("be.visible")
      .and("contain.text", "Stop");
  });
});

describe("dashboard message", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures
      .versions()
      .userTest()
      .projects()
      .entitySearch("getEntities", "kgSearch/emptySearch.json", "0")
      .getRecentlyViewedEntities(
        "getRecentlyViewedEntities",
        "kgSearch/no-recently-viewed-entities.json"
      )
      .noActiveProjects("getNoActiveProjects");
  });

  const visitDashboardPage = () => {
    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getEntities");
    cy.wait("@getRecentlyViewedEntities");
    cy.wait("@getNoActiveProjects");
  };

  it("does not display a message when disabled", () => {
    fixtures.config();
    visitDashboardPage();

    cy.get_cy("dashboard-message").should("not.exist");
  });

  it("displays a dissmissible simple info message", () => {
    fixtures.configWithDashboardMessage({
      fixture: DISMISSIBLE_SIMPLE_INFO_MESSAGE_FIXTURE,
    });
    visitDashboardPage();

    cy.get_cy("dashboard-message")
      .should("be.visible")
      .and("have.class", "alert")
      .and("have.class", "alert-info")
      .and("have.class", "alert-dismissible")
      .and("include.text", "Welcome to Renku!")
      .and("include.text", "This is an example welcome message");

    cy.get_cy("dashboard-message")
      .find(".alert-icon")
      .find('img[alt="info icon"]')
      .should("be.visible");

    cy.get_cy("dashboard-message")
      .find("button.btn-close")
      .should("be.visible")
      .click();

    // The message is removed on dismissal
    cy.get_cy("dashboard-message").should("not.exist");

    // The message stays removed after dismissal
    cy.get("#link-search").click();
    cy.get("#link-dashboard").click();
    cy.get_cy("dashboard-message").should("not.exist");
  });

  it("displays a non-dissmissible success message with a read more section", () => {
    fixtures.configWithDashboardMessage({
      fixture: NON_DISMISSIBLE_READ_MORE_SUCCESS_MESSAGE_FIXTURE,
    });
    visitDashboardPage();

    cy.get_cy("dashboard-message")
      .should("be.visible")
      .and("have.class", "alert")
      .and("have.class", "alert-success")
      .and("not.have.class", "alert-dismissible")
      .and("include.text", "Welcome to Renku!")
      .and("include.text", "This is an example welcome message");

    cy.get_cy("dashboard-message")
      .find(".alert-icon")
      .find('img[alt="success icon"]')
      .should("be.visible");

    cy.get_cy("dashboard-message").find("button.btn-close").should("not.exist");

    // Expand and collapse the "Read more" section
    cy.get_cy("dashboard-message")
      .find("a")
      .contains("Read more")
      .should("be.visible")
      .click();
    cy.get_cy("dashboard-message")
      .contains("This is some more text")
      .should("exist")
      .and("be.visible");
    cy.get_cy("dashboard-message")
      .find("a")
      .contains("Read more")
      .should("be.visible")
      .click();
    cy.get_cy("dashboard-message")
      .contains("This is some more text")
      .should("exist")
      .and("not.be.visible");

    // The message stays visible
    cy.get("#link-search").click();
    cy.get("#link-dashboard").click();
    cy.get_cy("dashboard-message").should("be.visible");
  });
});
