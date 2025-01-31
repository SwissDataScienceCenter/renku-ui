/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

describe("Search V2", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
  });

  it("Load the page and search", () => {
    fixtures.searchV2ListProjects({ numberOfProjects: 5, numberOfUsers: 0 });
    cy.visit("/search");

    cy.getDataCy("search-input").type("test{enter}");
    cy.getDataCy("search-header").contains("5 results for");
    cy.getDataCy("search-card").should("have.length", 5);
  });

  it("Updates the search parameters", () => {
    fixtures.searchV2ListProjects({ numberOfProjects: 5, numberOfUsers: 2 });
    cy.visit("/search");
    cy.getDataCy("search-input").type("type:project test{enter}");

    cy.getDataCy("search-filter-type-project")
      .filter(":visible")
      .should("be.checked");
    cy.getDataCy("search-filter-type-user").should("not.be.checked");
    cy.getDataCy("search-card").should("have.length", 5);

    cy.getDataCy("search-filter-type-user").filter(":visible").click();
    cy.getDataCy("search-filter-type-user").should("be.checked");
    cy.getDataCy("search-card").should("have.length", 7);

    cy.getDataCy("search-filter-type-project").filter(":visible").click();
    cy.getDataCy("search-filter-type-project").should("not.be.checked");
    cy.getDataCy("search-card").should("have.length", 2);
  });

  it("Updates the search sorting", () => {
    fixtures.searchV2ListProjects();
    cy.visit("/search");
    cy.getDataCy("search-input").type("sort:name-asc test{enter}");
    cy.getDataCy("search-header").contains("sort:name-asc");

    cy.getDataCy("search-sorting-select").select("Newest");
    cy.getDataCy("search-header").contains("sort:created-desc");
  });
});
