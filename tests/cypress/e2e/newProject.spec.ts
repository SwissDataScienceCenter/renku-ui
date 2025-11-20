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

describe("Add new project", () => {
  const slug = "new-project";
  const newProjectPath = `e2e/${slug}`;

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects();
    cy.visit("/v1/projects/new");
  });

  it("Creating a new project is no longer supported", () => {
    fixtures
      .templates()
      .createProject()
      .project({
        name: "getNewProject",
        projectPath: newProjectPath,
        statistics: false,
      })
      .updateProject({ projectPath: newProjectPath });
    cy.getDataCy("sunset-banner").should(
      "contain",
      "project and dataset creation are no longer available",
    );
  });
});
