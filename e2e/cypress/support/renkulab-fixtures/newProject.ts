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

import { FixturesConstructor } from "./fixtures";

/**
 * Fixtures for New Project
 */

function NewProject<T extends FixturesConstructor>(Parent: T) {
  return class NewProjectFixtures extends Parent {
    createProject(name = "createProject", result = "project/create-project.json") {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(
        "/ui-server/api/renku/templates.create_project",
        fixture
      ).as(name);
      return this;
    }
  };
}

export { NewProject };
