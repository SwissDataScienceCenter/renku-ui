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
import { NameOnlyFixture, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Sessions
 */

export function Sessions<T extends FixturesConstructor>(Parent: T) {
  return class SessionsFixtures extends Parent {
    getSessions(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "sessions/sessions.json",
        name: "getSessions",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/notebooks/servers*", response).as(name);

      return this;
    }

    getSessionsError(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "sessions/sessionError.json",
        name: "getSessionsError",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/notebooks/servers", response).as(name);
      return this;
    }

    getSessionsStopping(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "sessions/sessionStopping.json",
        name: "getSessionsStopping",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/notebooks/servers", response).as(name);
      return this;
    }

    getLogs(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "sessions/logs.json",
        name: "getLogs",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/notebooks/logs/*", response).as(name);
      return this;
    }

    getGitStatusBehind(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getGitStatus",
      });
      const response = this.useMockedData
        ? {
            body: {
              result: {
                clean: true,
                ahead: 0,
                behind: 1,
                branch: "local-behind",
                commit: "d705881",
                status:
                  "# branch.oid d705881\n" +
                  "# branch.head local-behind\n" +
                  "# branch.upstream origin/local-behind\n# branch.ab +0 -1\n",
              },
              id: 0,
              jsonrpc: "2.0",
            },
          }
        : undefined;
      cy.intercept("/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusClean(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getGitStatus",
      });
      const response = this.useMockedData
        ? {
            body: {
              result: {
                clean: true,
                ahead: 0,
                behind: 0,
                branch: "local-behind",
                commit: "d705881",
                status:
                  "# branch.oid d705881\n" +
                  "# branch.head local-behind\n" +
                  "# branch.upstream origin/local-behind\n# branch.ab +0 -0\n",
              },
              id: 0,
              jsonrpc: "2.0",
            },
          }
        : undefined;
      cy.intercept("/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusDirty(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getGitStatus",
      });
      const response = this.useMockedData
        ? {
            body: {
              result: {
                clean: false,
                ahead: 0,
                behind: 0,
                branch: "master",
                commit: "7bede1a",
                status:
                  "# branch.oid 7bede1a\n" +
                  "# branch.head master\n" +
                  "# branch.upstream origin/master\n" +
                  "# branch.ab +0 -0\n? bar.txt\n",
              },
              id: 0,
              jsonrpc: "2.0",
            },
          }
        : undefined;

      cy.intercept("/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusDiverged(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getGitStatus",
      });
      const response = this.useMockedData
        ? {
            body: {
              result: {
                clean: true,
                ahead: 1,
                behind: 1,
                branch: "local-behind",
                commit: "d705881",
                status:
                  "# branch.oid d705881\n" +
                  "# branch.head local-behind\n" +
                  "# branch.upstream origin/local-behind\n# branch.ab +1 -1\n",
              },
              id: 0,
              jsonrpc: "2.0",
            },
          }
        : undefined;

      cy.intercept("/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getSidecarHealth(args?: Partial<GetSidecarHealthArgs>) {
      const { name, isRunning } = Cypress._.defaults({}, args, {
        name: "getSidecarHealth",
        isRunning: true,
      });
      const response = this.useMockedData
        ? {
            body: { status: isRunning ? "running" : "down" },
          }
        : undefined;
      cy.intercept("/sessions/*/sidecar/health*", response).as(name);
      return this;
    }

    getGitStatusError(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getGitStatus",
      });
      const response = this.useMockedData
        ? {
            body: {
              error: {
                code: -32000,
                // eslint-disable-next-line max-len
                message:
                  "Running a git command failed with the error: fatal: could not read Username for 'https://gitlab.dev.renku.ch': No such device or address\n",
              },
              id: 0,
              jsonrpc: "2.0",
            },
          }
        : undefined;
      cy.intercept("/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    renkuIni(args?: Partial<RenkuIniArgs>) {
      const { fixture, name, projectId, ref } = Cypress._.defaults({}, args, {
        fixture: "session/renku.ini",
        name: "getRenkuIni",
        projectId: 39646,
        ref: "172a784d465a7bd45bacc165df2b64a591ac6b18",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(
        // eslint-disable-next-line max-len
        `/ui-server/api/projects/${projectId}/repository/files/.renku%2Frenku.ini/raw?ref=${ref}`,
        response
      ).as(name);
      return this;
    }

    sessionAutosave(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getSessionAutosave",
      });
      const response = this.useMockedData
        ? {
            body: {
              autosaves: [],
              pvsSupport: true,
            },
          }
        : undefined;
      cy.intercept(
        "/ui-server/api/notebooks/e2e%2Flocal-test-project/autosave",
        response
      ).as(name);
      return this;
    }

    sessionServersEmpty(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "getSessionServers",
      });
      const response = this.useMockedData
        ? { body: { servers: {} } }
        : undefined;
      cy.intercept("/ui-server/api/notebooks/servers", response).as(name);
      return this;
    }

    sessionServerOptions(args?: Partial<SessionServerOptionsArgs>) {
      const { cloudStorage, fixture, name } = Cypress._.defaults({}, args, {
        cloudStorage: null,
        fixture: "session/server-options.json",
        name: "getSessionServerOptions",
      });

      if (!this.useMockedData) {
        cy.intercept("/ui-server/api/notebooks/server_options").as(name);
        return this;
      }

      cy.fixture(fixture).then((response) => {
        if (cloudStorage == null) {
          delete response["cloudstorage"];
        } else if (!cloudStorage) {
          response["cloudstorage"]["s3"] = false;
        }
        cy.intercept("/ui-server/api/notebooks/server_options", response).as(
          name
        );
      });
      return this;
    }
  };
}

interface GetSidecarHealthArgs {
  name: string;
  isRunning: boolean;
}

interface RenkuIniArgs extends SimpleFixture {
  projectId: number;
  ref: string;
}

interface SessionServerOptionsArgs extends SimpleFixture {
  cloudStorage: boolean | null;
}
