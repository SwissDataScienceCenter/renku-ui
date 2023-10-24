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

function workflowsChangeSorting(target: string) {
  cy.getDataCy("workflows-ordering").should("exist").click();
  cy.get("button.dropdown-item").contains(target).click();
}

function workflowsChangeSortOrder() {
  cy.getDataCy("workflows-order-direction").should("exist").click();
}

export default function registerWorkflowsCommands() {
  Cypress.Commands.add("workflowsChangeSorting", workflowsChangeSorting);
  Cypress.Commands.add("workflowsChangeSortOrder", workflowsChangeSortOrder);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      workflowsChangeSorting: typeof workflowsChangeSorting;
      workflowsChangeSortOrder: typeof workflowsChangeSortOrder;
    }
  }
}
