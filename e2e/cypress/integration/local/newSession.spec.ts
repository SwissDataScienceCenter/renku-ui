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

describe("launch sessions", () => {
  const fixtures = new Fixtures(cy);
  beforeEach(() => {
    fixtures.config().versions().projects().landingUserProjects();
    fixtures.projectTest().projectMigrationUpToDate();
    fixtures.sessionAutosave().sessionServersEmpty().renkuIni().sessionServerOptions().projectLockStatus();
    cy.visit("/projects/e2e/local-test-project");
  });

  it("new session page - anonymous - success", () => {
    fixtures.userNone();
    fixtures.newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start session").should("be.visible").should("be.enabled");
    cy.get("form").contains("Start with base image").should("not.exist");
  });

  it("new session page - logged - success", () => {
    fixtures.userTest();
    fixtures.newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start session").should("be.visible").should("be.enabled");
    cy.get("form").contains("Start with base image").should("not.exist");
  });

  it("new session page - logged - missing pipeline", () => {
    fixtures.userTest();
    fixtures.newSessionPipelines(true).newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionPipelines", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.contains("No Docker image found").should("be.visible");
    cy.contains("building the branch image").should("be.visible");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - anonymous - missing image", () => {
    fixtures.userNone();
    fixtures.newSessionPipelines().newSessionJobs().newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - logged - missing image", () => {
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs().newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
  });

  it("new session page - logged - missing job", () => {
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs(true).newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJobs", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
    cy.get("#image_build").should("be.visible");
    cy.get("#image_build_again").should("not.exist");
    cy.get("#image_check_pipeline").should("not.exist");
  });

  it("new session page - logged - running job", () => {
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs(false, true).newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJob", { timeout: 15000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.get(".badge").contains("building").should("be.visible");
    cy.get("#image_build").should("not.exist");
    cy.get("#image_build_again").should("not.exist");
    cy.get("#image_check_pipeline").should("be.visible");
  });

  it("new session page - logged - failed job", () => {
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs(false, false, true).newSessionImages(true);
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionJobs", { timeout: 10000 });
    cy.get("form").contains("Start with base image").should("be.visible");
    cy.get("form").contains("Start session").should("be.visible").should("be.disabled");
    cy.get(".badge").contains("not available").should("be.visible");
    cy.get("#image_build").should("not.exist");
    cy.get("#image_build_again").should("be.visible");
    cy.get("#image_check_pipeline").should("be.visible");
  });

  it("new session page - show cloud storage options", () => {
    fixtures.sessionServerOptions(true);
    fixtures.userTest();
    fixtures.newSessionPipelines().newSessionJobs().newSessionImages();
    cy.visit("/projects/e2e/local-test-project/sessions/new");
    cy.wait("@getSessionImage", { timeout: 10000 });
    cy.contains("Configure Cloud Storage").should("be.visible").click();
    cy.contains("Object Store Configuration").should("be.visible");
  });

});
