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

function Sessions<T extends FixturesConstructor>(Parent: T) {
  return class SessionsFixtures extends Parent {

    getSessions(name = "getSessions", namespace = "*", resultFile = "sessions/sessions.json") {
      const fixtureA = this.useMockedData ? { fixture: "sessions/sessionsV2.json" } : undefined;
      const fixtureB = this.useMockedData ? { fixture: resultFile } : undefined;

      // intercept: different times to get different results
      cy.intercept(
        "/ui-server/api/notebooks/servers?namespace=" + namespace,
        fixtureA
      ).as(name);
      cy.intercept(
        "/ui-server/api/notebooks/servers?namespace=" + namespace,
        { times: 4 }, fixtureB
      ).as(name);
      cy.intercept(
        "/ui-server/api/notebooks/servers?namespace=" + namespace,
        { times: 4 }, fixtureA
      ).as(name);
      cy.intercept(
        "/ui-server/api/notebooks/servers?namespace=" + namespace,
        { times: 4 }, fixtureB
      ).as(name);
      return this;
    }

    getLogs(name = "getLogs", resultFile = "sessions/logs.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/notebooks/logs/*",
        fixture
      ).as(name);
      return this;
    }

    getGitStatusBehind(name = "getGitStatus") {
      const fixture = this.useMockedData ? {
        body: {
          "result": {
            "clean": true,
            "ahead": 0,
            "behind": 1,
            "branch": "local-behind",
            "commit": "d705881",
            "status": "# branch.oid d705881\n" +
              "# branch.head local-behind\n" +
              "# branch.upstream origin/local-behind\n# branch.ab +0 -1\n"
          },
          "id": 0,
          "jsonrpc": "2.0"
        } } : undefined;

      cy.intercept(
        "/sessions/*/sidecar/jsonrpc",
        fixture
      ).as(name);
      return this;
    }

    getGitStatusClean(name = "getGitStatus") {
      const fixture = this.useMockedData ? {
        body: {
          "result": {
            "clean": true,
            "ahead": 0,
            "behind": 0,
            "branch": "local-behind",
            "commit": "d705881",
            "status": "# branch.oid d705881\n" +
              "# branch.head local-behind\n" +
              "# branch.upstream origin/local-behind\n# branch.ab +0 -0\n"
          },
          "id": 0,
          "jsonrpc": "2.0"
        } } : undefined;

      cy.intercept(
        "/sessions/*/sidecar/jsonrpc",
        fixture
      ).as(name);
      return this;
    }

    getGitStatusDirty(name = "getGitStatus") {
      const fixture = this.useMockedData ? {
        body: {
          "result": {
            "clean": false,
            "ahead": 0,
            "behind": 0,
            "branch": "master",
            "commit": "7bede1a",
            "status": "# branch.oid 7bede1a\n" +
              "# branch.head master\n" +
              "# branch.upstream origin/master\n" +
              "# branch.ab +0 -0\n? bar.txt\n"
          },
          "id": 0,
          "jsonrpc": "2.0"
        } } : undefined;

      cy.intercept(
        "/sessions/*/sidecar/jsonrpc",
        fixture
      ).as(name);
      return this;
    }

    getGitStatusDiverged(name = "getGitStatus") {
      const fixture = this.useMockedData ? {
        body: {
          "result": {
            "clean": true,
            "ahead": 1,
            "behind": 1,
            "branch": "local-behind",
            "commit": "d705881",
            "status": "# branch.oid d705881\n" +
              "# branch.head local-behind\n" +
              "# branch.upstream origin/local-behind\n# branch.ab +1 -1\n"
          },
          "id": 0,
          "jsonrpc": "2.0"
        } } : undefined;

      cy.intercept(
        "/sessions/*/sidecar/jsonrpc",
        fixture
      ).as(name);
      return this;
    }

    getSidecarHealth(isRunning = true, name = "getSidecarHealth") {
      const status = isRunning ? "running" : "down";
      const fixture = this.useMockedData ? { body: {
        "status": status
      } } : undefined;
      cy.intercept(
        "/sessions/*/sidecar/health*",
        fixture
      ).as(name);
      return this;
    }
  };

}

export { Sessions };
