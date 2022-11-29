/// <reference types="cypress" />
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

describe("display the home page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().userNone();
    cy.visit("/");
  });

  it("displays the home page intro text", () => {
    cy.get("h1").should("have.length", 1);
    cy.get("h1")
      .first()
      .should("have.text", "An open-source knowledge infrastructure for collaborative and reproducible data science");
  });
});

describe("display the landing page", () => {
  const fixtures = new Fixtures(cy);
  fixtures.useMockedData = true;
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().getLastVisitedProjects().landingUserProjects();
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
  });

  it("displays the landing page header", () => {
    let projects;
    cy.wait("@getUser");
    cy.wait("@getProjects");
    cy.wait("@getLastVisitedProjects").then( result => projects = result.response.body.projects);

    const findProject = (path, projects) => {
      return projects.find( result => result.response.body.path_with_namespace === path);
    };

    cy.get("h3").first().should("have.text", "e2e @ Renku");
    cy.wait(["@projectLanding", "@projectLanding", "@projectLanding", "@projectLanding"])
      .then( (results) => {
        const firstProject = findProject(projects[0], results);
        const projectData = firstProject.response?.body;
        cy.get_cy("list-card-title").first().should("have.text", projectData.name);
      });
  });
});

describe("404 page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().userNone();
    cy.visit("/xzy");
  });

  it("show error page", () => {
    cy.get("h3").should("contain.text", "Page not found");
  });
});

describe("display the maintenance page", () => {
  beforeEach(() => {
    new Fixtures(cy).config().versions().renkuDown();
    cy.visit("/");
  });

  it.only("displays status page information", () => {
    cy.get("h1").should("have.length", 1);
    cy.get("h1")
      .first()
      .should("have.text", " RenkuLab Down"); // The space in the string is necessary
    cy.get("h3")
      .first()
      .should("have.text", "RenkuLab Status");
  });
});
