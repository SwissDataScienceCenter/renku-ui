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

describe("Add dataset to project", () => {
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
  });

  it("Should not allow adding a dataset to an existing project", () => {
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.wait("@getConfig");
    cy.wait("@getUser");
    cy.getDataCy("sunset-banner").should(
      "contain",
      "Project creation no longer available"
    );
  });
});

describe("No legacy support", () => {
  beforeEach(() => {
    fixtures.config({ fixture: "config-no-legacy.json" }).versions().userTest();
    fixtures
      .projects()
      .landingUserProjects({ fixture: "projects/member-projects.json" });
  });

  it("displays warning when dataset doesn't exist", () => {
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    cy.visit(`datasets/${datasetIdentifier}/add`);
    cy.contains("Legacy not supported").should("be.visible");
  });
});
