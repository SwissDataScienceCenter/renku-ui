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

import "cypress-file-upload";

import registerDatasetsCommands from "./commands/datasets";
import registerGeneralCommands from "./commands/general";
import registerProjectsCommands from "./commands/projects";
import registerReactSelectCommands from "./commands/react-select";
import registerSessionsCommands from "./commands/sessions";
import registerWorkflowsCommands from "./commands/workflows";

registerDatasetsCommands();
registerGeneralCommands();
registerProjectsCommands();
registerReactSelectCommands();
registerSessionsCommands();
registerWorkflowsCommands();

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from failing the test
  return false;
});
