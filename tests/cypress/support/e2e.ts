/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import "./projects/gui_commands";
import "cypress-file-upload";
import { Dataset } from "./datasets/gui_commands";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      get_cy(element: string): Chainable;
      gui_logout(): void;
      gui_new_dataset(newDataset: Dataset): void;
      gui_open_logs(): void;
      gui_open_session(): void;
      gui_workflows_change_sorting(target: string): void;
      gui_workflows_change_sort_order(): void;
      gui_create_project(title: string): void;
      gui_create_project_add_dataset(
        title: string,
        path: string,
        fixtures
      ): void;
      gui_select_project_autosuggestion_list(
        project: string,
        fixtures,
        migrationCheckResult
      ): void;
    }
  }
}

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from failing the test
  return false;
});
