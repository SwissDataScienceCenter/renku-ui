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

function Session<T extends FixturesConstructor>(Parent: T) {
  return class SessionFixtures extends Parent {
    renkuIni(name = "getRenkuIni") {
      cy.intercept(
        // eslint-disable-next-line max-len
        "/ui-server/api/projects/e2e%2Flocal-test-project/repository/files/.renku%2Frenku.ini/raw?ref=172a784d465a7bd45bacc165df2b64a591ac6b18",
        {
          fixture: "session/renku.ini"
        }
      ).as(name);
      return this;
    }

    sessionAutosave(name = "getSessionAutosave") {
      cy.intercept(
        "/ui-server/api/notebooks/e2e%2Flocal-test-project/autosave",
        {
          body: {
            autosaves: [],
            pvsSupport: true
          }
        }
      ).as(name);
      return this;
    }

    sessionPipelines(
      names = {
        sessionPipelineJobsName: "sessionPipelineJobsName",
        sessionPipelinesName: "getSessionPipelines"
      }
    ) {
      const { sessionPipelineJobsName, sessionPipelinesName } = names;
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/pipelines?sha=172a784d465a7bd45bacc165df2b64a591ac6b18",
        {
          fixture: "session/pipelines.json"
        }
      ).as(sessionPipelinesName);
      cy.intercept(
        "/ui-server/api/projects/e2e%2Flocal-test-project/pipelines/182743/jobs",
        {
          fixture: "session/pipeline-jobs.json"
        }
      ).as(sessionPipelineJobsName);
      return this;
    }

    sessionServersEmpty(name = "getSessionServers") {
      cy.intercept(
        //"/ui-server/api/notebooks/servers?namespace=e2e&project=local-test-project",
        "/ui-server/api/notebooks/servers?namespace=e2e&project=local-test-project*",
        {
          body: { servers: {} }
        }
      ).as(name);
      return this;
    }

    sessionServerOptions(cloudStorage?, name = "getSessionServerOptions") {
      cy.fixture("session/server-options.json").then((options) => {
        if (cloudStorage == null) delete options["s3mounts"];
        else if (!cloudStorage) options["s3mounts"] = false;

        cy.intercept(
          "GET",
          "/ui-server/api/notebooks/server_options",
          options
        ).as(name);
      });
      return this;
    }
  };
}

export { Session };
