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
import { DeepPartial, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Sessions
 */

export function NewSession<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    newSessionPipelines(args?: Partial<NewSessionPipelinesArgs>) {
      const { empty, fixture, name, projectId, ref } = Cypress._.defaults(
        {},
        args,
        {
          empty: false,
          fixture: "session/ci-pipelines.json",
          name: "getSessionPipelines",
          projectId: 39646,
          ref: "172a784d465a7bd45bacc165df2b64a591ac6b18",
        }
      );
      const response = empty ? [] : { fixture };
      cy.intercept(
        `/ui-server/api/projects/${projectId}/pipelines?sha=${ref}`,
        response
      ).as(name);
      return this;
    }

    newSessionJobs(args?: Partial<NewSessionJobsArgs>) {
      const { failed, missing, running } = Cypress._.defaults({}, args, {
        failed: false,
        missing: false,
        running: false,
      });
      const defaultFixture = missing
        ? "session/ci-jobs-missing.json"
        : running
        ? "session/ci-jobs-running.json"
        : failed
        ? "session/ci-jobs-failed.json"
        : "session/ci-jobs.json";
      const { fixture, name, pipelineId, projectId } = Cypress._.defaults(
        {},
        args,
        {
          fixture: defaultFixture,
          name: "getSessionJobs",
          pipelineId: 182743,
          projectId: 39646,
        }
      );
      const response = { fixture };
      cy.intercept(
        `/ui-server/api/projects/${projectId}/pipelines/${pipelineId}/jobs`,
        response
      ).as(name);
      return this;
    }

    newSessionImages(args?: DeepPartial<NewSessionImagesArgs>) {
      const {
        image: { missing },
      } = Cypress._.defaultsDeep({}, args, {
        image: { missing: false },
      }) as NewSessionImagesArgs;
      const defaultImageFixture = missing
        ? "session/ci-image-missing.json"
        : "session/ci-image.json";
      const { image, projectId, registry } = Cypress._.defaultsDeep({}, args, {
        image: {
          fixture: defaultImageFixture,
          name: "getSessionImage",
          tag: "172a784",
        },
        projectId: 39646,
        registry: {
          fixture: "session/ci-registry.json",
          name: "getSessionRegistries",
        },
      }) as NewSessionImagesArgs;

      const registryResponse = { fixture: registry.fixture };
      cy.intercept(
        `/ui-server/api/projects/${projectId}/registry/repositories`,
        registryResponse
      ).as(registry.name);

      const imageResponse = {
        fixture: image.fixture,
        ...(missing ? { statusCode: 404 } : {}),
      };

      cy.intercept(
        `/ui-server/api/projects/${projectId}/registry/repositories/1/tags/${image.tag}`,
        imageResponse
      ).as(image.name);
      return this;
    }
  };
}

interface NewSessionPipelinesArgs extends SimpleFixture {
  empty: boolean;
  projectId: number;
  ref: string;
}

interface NewSessionJobsArgs extends SimpleFixture {
  failed: boolean;
  missing: boolean;
  pipelineId: number;
  projectId: number;
  running: boolean;
}

interface NewSessionImagesArgs {
  image: SimpleFixture & {
    missing: boolean;
    tag: string;
  };
  registry: SimpleFixture;
  projectId: number;
}
