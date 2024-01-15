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

describe("launch sessions", () => {
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures
      .sessionAutosave()
      .sessionServersEmpty()
      .sessionsVersion()
      .renkuIni()
      .sessionServerOptions()
      .resourcePoolsTest()
      .projectConfigShow()
      .projectLockStatus()
      .cloudStorage();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("new session page - anonymous - success", () => {
    fixtures.userNone();
    fixtures.newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.enabled");
    cy.get("form").contains("Start with base image").should("not.exist");
  });

  it("new session page - logged - success", () => {
    fixtures.userTest();
    fixtures.newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.enabled");
    cy.get("form").contains("Start with base image").should("not.exist");
  });

  it("new session page - logged - missing pipeline", () => {
    fixtures.userTest();
    fixtures
      .newSessionPipelines({ empty: true })
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionPipelines", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.contains("No Docker image found").should("be.visible");
    cy.contains("building the branch image").should("be.visible");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - anonymous - missing image", () => {
    fixtures.userNone();
    fixtures
      .newSessionPipelines()
      .newSessionJobs()
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - logged - missing image", () => {
    fixtures.userTest();
    fixtures
      .newSessionPipelines()
      .newSessionJobs()
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - logged - missing job", () => {
    fixtures.userTest();
    fixtures
      .newSessionPipelines()
      .newSessionJobs({ missing: true })
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJobs", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
    cy.get("#imageBuild").should("be.visible");
    cy.get("#imageBuildAgain").should("not.exist");
    cy.get("#imageCheckPipeline").should("not.exist");
  });

  it("new session page - logged - running job", () => {
    fixtures.userTest();
    fixtures
      .newSessionPipelines()
      .newSessionJobs({ running: true })
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJobs", { timeout: 15000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.get(".badge").contains("building").should("be.visible");
    cy.get("#imageBuild").should("not.exist");
    cy.get("#imageBuildAgain").should("not.exist");
    cy.get("#imageCheckPipeline").should("be.visible");
  });

  it("new session page - logged - failed job", () => {
    fixtures.userTest();
    fixtures
      .newSessionPipelines()
      .newSessionJobs({ failed: true })
      .newSessionImages({ image: { missing: true } });
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJobs", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form")
      .contains("Start Session")
      .should("be.visible")
      .should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
    cy.get("#imageBuild").should("not.exist");
    cy.get("#imageBuildAgain").should("be.visible");
    cy.get("#imageCheckPipeline").should("be.visible");
  });

  it("new session page - show cloud storage options", () => {
    fixtures.sessionServerOptions({ cloudStorage: true });
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs().newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get(".form-label").contains("Cloud Storage").should("be.visible");

    cy.getDataCy("cloud-storage-item")
      .contains("example-storage")
      .should("be.visible");
    cy.getDataCy("cloud-storage-item")
      .contains("mount/path")
      .should("be.visible");
    cy.getDataCy("cloud-storage-item")
      .contains("s3/Other")
      .should("be.visible");
    cy.getDataCy("cloud-storage-item")
      .contains("mount/path")
      .should("be.visible");

    cy.getDataCy("cloud-storage-details-toggle").should("be.visible").click();
    cy.getDataCy("cloud-storage-details-section")
      .contains("https://s3.example.com")
      .should("be.visible");

    cy.get("#cloud-storage-example-storage-active").should("be.checked");
  });
});
