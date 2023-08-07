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

import Fixtures from "../support/renkulab-fixtures";
import "../support/utils";
import "../support/sessions/gui_commands";

describe("launch autostart sessions", () => {
  const fixtures = new Fixtures(cy);
  const projectUrl = "/projects/e2e/local-test-project";
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();

    fixtures
      .sessionServersEmpty()
      .renkuIni()
      .sessionServerOptions()
      .projectLockStatus()
      .resourcePoolsTest();
    fixtures.userTest().newSessionImages();
  });

  it("autostart session - not found custom values branch", () => {
    const invalidBranch = "no-valid-branch";
    cy.visit(`${projectUrl}/sessions/new?autostart=1&branch=${invalidBranch}`);
    const alertMessage = `The session could not start because the branch ${invalidBranch} does not exist. Please select another branch to start a session.`;
    cy.wait("@getProjectCommits");
    cy.wait("@getSessionServerOptions", { timeout: 10000 });
    cy.get(".alert-danger").should("contain.text", alertMessage);
  });

  it("autostart session - not found custom values commit", () => {
    const invalidCommit = "no-valid-commit";
    cy.visit(
      `${projectUrl}/sessions/new?autostart=1&commit=${invalidCommit}&branch=master`
    );
    const alertMessage = `The session could not start because the commit ${invalidCommit} does not exist. Please select another commit to start a session.`;
    cy.wait("@getProjectCommits");
    cy.wait("@getSessionServerOptions", { timeout: 10000 });
    cy.get(".alert-danger").should("contain.text", alertMessage);
  });
});
