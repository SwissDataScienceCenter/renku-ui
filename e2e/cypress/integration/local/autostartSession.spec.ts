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

import Fixtures from "../../support/renkulab-fixtures";
import "../../support/utils";
import "../../support/sessions/gui_commands";

describe("launch autostart sessions", () => {
  const fixtures = new Fixtures(cy);
  const projectUrl = "/projects/e2e/local-test-project";
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures.sessionAutosave().sessionServersEmpty().renkuIni().sessionServerOptions().projectLockStatus();
    cy.visit(projectUrl);
  });

  it("autostart session - not found custom values branch and commit", () => {
    fixtures.userTest();
    fixtures.newSessionImages();
    const invalidCommit = "no-valid-commit";
    const invalidBranch = "no-valid-branch";
    cy.visit(`${projectUrl}/sessions/new?autostart=1&commit=${invalidCommit}&branch=${invalidBranch}`);
    const alertMessage = `A session on the branch ${invalidBranch} and the commit ${invalidCommit} could not be started
        because it does not exist in the repository. The branch has been set to the default
        master.
        You can change that and other options down below.`;
    cy.wait("@getProjectCommits");
    cy.wait("@getSessionServerOptions");
    cy.get(".alert-warning").should("contain.text", alertMessage);
  });

  it("autostart session - not found custom values commit", () => {
    fixtures.userTest();
    fixtures.newSessionImages();
    const invalidCommit = "no-valid-commit";
    cy.visit(`${projectUrl}/sessions/new?autostart=1&commit=${invalidCommit}&branch=master`);
    const alertMessage = `A session for the reference ${invalidCommit} could not be started
        because it does not exist in the repository. The branch has been set to the default
        master.
        You can change that and other options down below.`;
    cy.wait("@getProjectCommits");
    cy.wait("@getSessionServerOptions");
    cy.get(".alert-warning").should("contain.text", alertMessage);
  });

});
