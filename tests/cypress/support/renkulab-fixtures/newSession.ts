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
    newSessionPipelines(
      empty = false,
      projectId = 39646,
      ref = "172a784d465a7bd45bacc165df2b64a591ac6b18"
    ) {
      const data = empty ? [] : { fixture: "session/ci-pipelines.json" };
      cy.intercept(
        `/ui-server/api/projects/${projectId}/pipelines?sha=${ref}`,
        data
      ).as("getSessionPipelines");
      return this;
    }
    newSessionJobs(
      missing = false,
      running = false,
      failed = false,
      projectId = 39646,
      pipelineId = 182743
    ) {
      let fixture = "session/ci-jobs.json";
      if (missing) fixture = "session/ci-jobs-missing.json";
      else if (running) fixture = "session/ci-jobs-running.json";
      else if (failed) fixture = "session/ci-jobs-failed.json";
      cy.intercept(
        `/ui-server/api/projects/${projectId}/pipelines/${pipelineId}/jobs`,
        { fixture }
      ).as("getSessionJobs");
      return this;
    }
    newSessionImages(missing = false, projectId = 39646, imageTag = "172a784") {
      const registryFixture = "session/ci-registry.json";
      let imageFixture = "session/ci-image.json";
      if (missing) imageFixture = "session/ci-image-missing.json";
      cy.intercept(
        `/ui-server/api/projects/${projectId}/registry/repositories`,
        { fixture: registryFixture }
      ).as("getSessionRegistries");
      cy.intercept(
        `/ui-server/api/projects/${projectId}/registry/repositories/1/tags/${imageTag}`,
        { fixture: imageFixture, ...(missing ? { statusCode: 404 } : {}) }
      ).as("getSessionImage");
      return this;
    }
  };
}

export { NewSession };
