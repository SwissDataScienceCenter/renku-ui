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
      .should("have.text", "Connecting people, data, and insights");
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
    cy.wait("@getUser");
    cy.wait("@getProjects");
    cy.wait("@getLastVisitedProjects");

    cy.get("h3").first().should("have.text", "e2e @ Renku");
    cy.wait(["@projectLanding", "@projectLanding", "@projectLanding", "@projectLanding"])
      .then( (result) => {
        const firstProject = result[0].response?.body;
        cy.get_cy("list-card-title").first().should("have.text", firstProject.name);
      });
  });
});
