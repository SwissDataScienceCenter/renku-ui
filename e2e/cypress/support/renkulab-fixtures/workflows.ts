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
 * Fixtures for workflows
 */

function Workflows<T extends FixturesConstructor>(Parent: T) {
  return class WorkflowsFixtures extends Parent {
    getWorkflows(resultFile = "workflows/workflows-list-links-mappings.json") {
      cy.intercept(
        "/ui-server/api/renku/*/workflow_plans.list?*",
        { fixture: resultFile }
      ).as("getWorkflows");
      return this;
    }

    getWorkflowDetails(resultFile = "workflows/workflow-show-links-mappings.json") {
      cy.intercept(
        "/ui-server/api/renku/*/workflow_plans.show?*",
        { fixture: resultFile }
      ).as("getWorkflowDetails");
      return this;
    }

    // TODO: add single workflow
  };
}

export { Workflows };
