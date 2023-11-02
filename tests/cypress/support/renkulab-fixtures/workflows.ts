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
import { SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for workflows
 */

export function Workflows<T extends FixturesConstructor>(Parent: T) {
  return class WorkflowsFixtures extends Parent {
    getWorkflows(args?: SimpleFixture) {
      const {
        fixture = "workflows/workflows-list-links-mappings.json",
        name = "getWorkflows",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/renku/*/workflow_plans.list?*",
        response
      ).as(name);
      return this;
    }

    getWorkflowDetails(args?: SimpleFixture) {
      const {
        fixture = "workflows/workflow-show-links-mappings.json",
        name = "getWorkflowDetails",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/renku/*/workflow_plans.show?*",
        response
      ).as(name);
      return this;
    }
  };
}
