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
import { DeepRequired, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Sessions
 */

export function NewSession<T extends FixturesConstructor>(Parent: T) {
  return class NewSessionFixtures extends Parent {
    newSessionPipelines(args?: NewSessionPipelinesArgs) {
      const {
        empty = false,
        fixture = "session/ci-pipelines.json",
        name = "getSessionPipelines",
        projectId = 39646,
        ref = "172a784d465a7bd45bacc165df2b64a591ac6b18",
      } = args ?? {};
      const response = empty ? [] : { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/projects/${projectId}/pipelines?sha=${ref}`,
        response
      ).as(name);
      return this;
    }

    newSessionJobs(args?: NewSessionJobsArgs) {
      const { failed = false, missing = false, running = false } = args ?? {};
      const defaultFixture = missing
        ? "session/ci-jobs-missing.json"
        : running
        ? "session/ci-jobs-running.json"
        : failed
        ? "session/ci-jobs-failed.json"
        : "session/ci-jobs.json";
      const {
        fixture = defaultFixture,
        name = "getSessionJobs",
        pipelineId = 182743,
        projectId = 39646,
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/projects/${projectId}/pipelines/${pipelineId}/jobs`,
        response
      ).as(name);
      return this;
    }

    newSessionImages(args?: NewSessionImagesArgs) {
      const {
        image: { missing },
      } = Cypress._.defaultsDeep({}, args, {
        image: { missing: false },
      }) as Pick<DeepRequired<NewSessionImagesArgs>, "image">;
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
      }) as DeepRequired<NewSessionImagesArgs>;

      const registryResponse = { fixture: registry.fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/projects/${projectId}/registry/repositories`,
        registryResponse
      ).as(registry.name);

      const imageResponse = {
        fixture: image.fixture,
        ...(missing ? { statusCode: 404 } : {}),
      };

      cy.intercept(
        "GET",
        `/ui-server/api/projects/${projectId}/registry/repositories/1/tags/${image.tag}`,
        imageResponse
      ).as(image.name);
      return this;
    }

    newLauncher(args?: SimpleFixture) {
      const { fixture = "", name = "newLauncher" } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept(
        "POST",
        "/ui-server/api/data/session_launchers",
        response
      ).as(name);
      return this;
    }

    editLauncher(args?: SimpleFixture) {
      const { fixture = "", name = "editLauncher" } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept(
        "PATCH",
        "/ui-server/api/data/session_launchers/*",
        response
      ).as(name);
      return this;
    }

    environments(args?: SimpleFixture) {
      const {
        fixture = "sessions/environments.json",
        name = "getEnvironments",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/ui-server/api/data/environments`, response).as(
        name
      );
      return this;
    }
  };
}

interface NewSessionPipelinesArgs extends SimpleFixture {
  empty?: boolean;
  projectId?: number;
  ref?: string;
}

interface NewSessionJobsArgs extends SimpleFixture {
  failed?: boolean;
  missing?: boolean;
  pipelineId?: number;
  projectId?: number;
  running?: boolean;
}

interface NewSessionImagesArgs {
  image?: SimpleFixture & {
    missing?: boolean;
    tag?: string;
  };
  registry?: SimpleFixture;
  projectId?: number;
}
