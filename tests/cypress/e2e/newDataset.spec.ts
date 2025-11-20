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

describe("Project new dataset", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project({ projectPath }).cacheProjectList();
    fixtures.projectKGDatasetList({ projectPath });
    fixtures.projectDatasetList();
    fixtures.addFileDataset();
    fixtures.projectTestContents({ coreServiceV8: { coreVersion: 9 } });
    fixtures.projectMigrationUpToDate({ queryUrl: "*" });
    fixtures.projectLockStatus();
    cy.visit(`projects/${projectPath}/datasets/new`);
    cy.wait("@getConfig");
    cy.wait("@getUser");
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.wait("@datasetList");
  });

  it("new dataset not supported", () => {
    cy.getDataCy("sunset-banner").should(
      "contain",
      "project and dataset creation are no longer available",
    );
  });
});
