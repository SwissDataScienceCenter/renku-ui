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

import Fixtures from "../../support/renkulab-fixtures";
import "../../support/utils";

const findProject = (path, projects) => {
  return projects.find( result => result.response.body.path_with_namespace === path);
};

describe("dashboard", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
  });

  it("user does has not own projects and no projects recently visited", () => {
    fixtures.projects().entitySearch("getEntities", "kgSearch/emptySearch.json", "0")
      .getLastVisitedProjects("getLastVisitedProjects", "projects/empty-last-visited-projects.json")
      .noActiveProjects("getNoActiveProjects");

    cy.visit("/");
    cy.wait("@getUser");
    cy.wait("@getEntities");
    cy.wait("@getLastVisitedProjects");
    cy.wait("@getNoActiveProjects");

    cy.get_cy("dashboard-title").should("have.text", "Renku Dashboard - E2E User");
    cy.get_cy("project-alert").should("contain.text", "You do not have any projects yet");
    cy.get_cy("projects-container").should("contain.text", "You do not have any recently-visited projects");
    cy.get_cy("explore-other-projects-btn").should("be.visible");
    cy.get_cy("inactive-kg-project-alert").should("exist");
  });

  it("user does not have own project but has visited projects", () => {
    fixtures.projects()
      .entitySearch("getEntities", "kgSearch/emptySearch.json", "0")
      .getLastVisitedProjects();
    const files = {
      "lorenzo.cavazzi.tech/readme-file-dev": 30929,
      "e2e/nuevo-projecto": 44966,
      "e2e/testing-datasets": 43781,
      "e2e/local-test-project": 39646
    };
    // fixture landing page project data
    for (const filesKey in files)
      fixtures.project(filesKey, "projectLanding", `projects/project_${files[filesKey]}.json`, false);

    cy.visit("/");
    let projects;
    cy.wait("@getUser");
    cy.wait("@getLastVisitedProjects").then( result => projects = result.response.body.projects);
    cy.wait(["@projectLanding", "@projectLanding", "@projectLanding", "@projectLanding"])
      .then( (results) => {
        const firstProject = findProject(projects[0], results);
        const projectData = firstProject.response?.body;
        cy.get_cy("list-card-title").first().should("have.text", projectData.name);
        cy.get_cy("explore-other-projects-btn").should("be.visible");
        cy.get_cy("project-alert").should("contain.text", "You do not have any projects yet");
        cy.get_cy("inactive-kg-project-alert").should("not.exist");
      });
  });

  it("user has own projects and recently visited projects", () => {
    fixtures.projects()
      .entitySearch("getEntities", "kgSearch/search.json", "7")
      .getLastVisitedProjects("getLastVisitedProjects", "projects/last-visited-projects-5.json");
    const files = {
      "lorenzo.cavazzi.tech/readme-file-dev": 30929,
      "e2e/testing-datasets": 43781,
      "e2e/local-test-project": 39646,
      "e2e/nuevo-project": 44966,
      "e2e/local-test-project-2": 44967,
    };
    // fixture landing page project data
    for (const filesKey in files)
      fixtures.project(filesKey, "getProject", `projects/project_${files[filesKey]}.json`, false);

    cy.visit("/");
    let projects;
    cy.wait("@getUser");
    cy.wait("@getLastVisitedProjects").then( result => projects = result.response.body.projects);
    cy.wait(
      ["@getProject", "@getProject", "@getProject", "@getProject", "@getProject"])
      .then( (results) => {
        const firstProject = findProject(projects[0], results);
        const projectData = firstProject.response?.body;
        cy.get_cy("list-card-title").first().should("have.text", projectData.name);
        cy.get_cy("project-alert").should("not.exist");
        cy.get_cy("explore-other-projects-btn").should("not.exist");
        cy.get_cy("view-my-projects-btn").should("be.visible");
      });
  });
});
