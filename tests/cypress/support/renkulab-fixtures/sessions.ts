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
    getSessions(args?: SimpleFixture) {
      const { fixture = "sessions/sessions.json", name = "getSessions" } =
        args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/notebooks/servers*", response).as(
        name
      );
      return this;
    }

    getSessionsError(args?: SimpleFixture) {
      const {
        fixture = "sessions/sessionError.json",
        name = "getSessionsError",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/notebooks/servers", response).as(
        name
      );
      return this;
    }

    getSessionsStopping(args?: SimpleFixture) {
      const {
        fixture = "sessions/sessionStopping.json",
        name = "getSessionsStopping",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/notebooks/servers", response).as(
        name
      );
      return this;
    }

    getLogs(args?: SimpleFixture) {
      const { fixture = "sessions/logs.json", name = "getLogs" } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/notebooks/logs/*", response).as(name);
      return this;
    }

    getGitStatusBehind(args?: NameOnlyFixture) {
      const { name = "getGitStatus" } = args ?? {};
      const response = {
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
      };
      cy.intercept("POST", "/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusClean(args?: NameOnlyFixture) {
      const { name = "getGitStatus" } = args ?? {};
      const response = {
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
      };

      cy.intercept("POST", "/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusDirty(args?: NameOnlyFixture) {
      const { name = "getGitStatus" } = args ?? {};
      const response = {
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
      };
      cy.intercept("POST", "/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getGitStatusDiverged(args?: NameOnlyFixture) {
      const { name = "getGitStatus" } = args ?? {};
      const response = {
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
      };
      cy.intercept("POST", "/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    getSidecarHealth(args?: Partial<GetSidecarHealthArgs>) {
      const { name = "getSidecarHealth", isRunning = true } = args ?? {};
      const response = {
        body: { status: isRunning ? "running" : "down" },
      };
      cy.intercept("GET", "/sessions/*/sidecar/health*", response).as(name);
      return this;
    }

    getGitStatusError(args?: NameOnlyFixture) {
      const { name = "getGitStatus" } = args ?? {};
      const response = {
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
      };
      cy.intercept("POST", "/sessions/*/sidecar/jsonrpc", response).as(name);
      return this;
    }

    renkuIni(args?: Partial<RenkuIniArgs>) {
      const {
        fixture = "session/renku.ini",
        name = "getRenkuIni",
        projectId = 39646,
        ref = "172a784d465a7bd45bacc165df2b64a591ac6b18",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        // eslint-disable-next-line max-len
        `/ui-server/api/projects/${projectId}/repository/files/.renku%2Frenku.ini/raw?ref=${ref}`,
        response
      ).as(name);
      return this;
    }

    sessionAutosave(args?: NameOnlyFixture) {
      const { name = "getSessionAutosave" } = args ?? {};
      const response = {
        body: {
          autosaves: [],
          pvsSupport: true,
        },
      };
      cy.intercept(
        "GET",
        "/ui-server/api/notebooks/e2e%2Flocal-test-project/autosave",
        response
      ).as(name);
      return this;
    }

    sessionServersEmpty(args?: NameOnlyFixture) {
      const { name = "getSessionServers" } = args ?? {};
      const response = { body: { servers: {} } };
      cy.intercept("GET", "/ui-server/api/notebooks/servers", response).as(
        name
      );
      return this;
    }

    sessionServerOptions(args?: SessionServerOptionsArgs) {
      const {
        cloudStorage = null,
        fixture = "session/server-options.json",
        name = "getSessionServerOptions",
      } = args ?? {};
      cy.fixture(fixture).then((response) => {
        if (cloudStorage == null) {
          delete response["cloudstorage"];
        } else if (!cloudStorage) {
          response["cloudstorage"]["s3"] = false;
        }
        cy.intercept(
          "GET",
          "/ui-server/api/notebooks/server_options",
          response
        ).as(name);
      });
      return this;
    }
  };
}

interface GetSidecarHealthArgs {
  name?: string;
  isRunning?: boolean;
}

interface RenkuIniArgs extends SimpleFixture {
  projectId?: number;
  ref?: string;
}

interface SessionServerOptionsArgs extends SimpleFixture {
  cloudStorage?: boolean | null;
}
