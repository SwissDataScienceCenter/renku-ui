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
 * Fixtures for Sessions
 */

function NewSession<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    newSessionPipelines() {
      const fixture = "session/ci-pipelines.json";
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/pipelines?sha=172a784d465a7bd45bacc165df2b64a591ac6b18",
        { fixture }
      ).as("getSessionPipelines");
      return this;
    }
    newSessionJobs(missing = false, running = false, failed = false) {
      let fixture = "session/ci-jobs.json";
      if (missing)
        fixture = "session/ci-jobs-missing.json";
      else if (running)
        fixture = "session/ci-jobs-running.json";
      else if (failed)
        fixture = "session/ci-jobs-failed.json";
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/pipelines/182743/jobs",
        { fixture }
      ).as("getSessionJobs");
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/jobs/195001",
        { fixture }
      ).as("getSessionJob");
      return this;
    }
    newSessionImages(missing = false) {
      const registryFixture = "session/ci-registry.json";
      let imageFixture = "session/ci-image.json";
      if (missing)
        imageFixture = "session/ci-image-missing.json";
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/registry/repositories",
        { fixture: registryFixture }
      ).as("getSessionRegistries");
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/registry/repositories/1/tags/172a784",
        { fixture: imageFixture }
      ).as("getSessionImage");
      return this;
    }
  };
}

export { NewSession };
