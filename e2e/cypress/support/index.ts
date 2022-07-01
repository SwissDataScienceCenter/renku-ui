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

import "./authentication/gui_commands";
import { User } from "./authentication/user.interfaces";
import "./projects/gui_commands";
import "cypress-file-upload";
import { Dataset } from "./datasets/gui_commands";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      get_cy(element: string): Chainable
      gui_kc_login(user: User, startFromHome: boolean): void,
      gui_kc_register(user: User): void,
      gui_is_welcome_page_logged_user(user: User): void,
      gui_logout(): void
      gui_search_dataset(datasetName: string, fixtures, resultFile): void
      gui_new_dataset(newDataset: Dataset): void
      gui_open_logs(): void
      gui_create_project(title: string): void
      gui_create_project_add_dataset(title: string, path: string, fixtures): void
      gui_select_project_autosuggestion_list(project: string, fixtures, migrationCheckResult): void
    }
  }
}

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from failing the test
  return false;
});
