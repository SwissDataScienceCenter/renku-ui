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
 * Fixtures for Projects
 */

interface MigrationCheckParams {
  fixtureName?: string;
  queryUrl?: string
}

function Projects<T extends FixturesConstructor>(Parent: T) {
  return class ProjectsFixtures extends Parent {
    landingUserProjects(name = "getLandingUserProjects", fixture = "landing-user-projects.json") {
      cy.intercept("/ui-server/api/graphql", {
        fixture
      }).as(name);
      return this;
    }

    getLastVisitedProjects(name = "getLastVisitedProjects", fixture = "projects/last-visited-projects.json") {
      cy.intercept("/ui-server/api/last-projects/*", {
        fixture
      }).as(name);
      return this;
    }

    projects(name = "getProjects", fixture = "projects.json") {
      cy.intercept(
        "/ui-server/api/projects?query=last_activity_at&per_page=100&starred=true&page=1",
        { fixture }
      ).as(name);
      return this;
    }

    projectsGraphQl(name = "getProjectsGraphQl", fixture = "projects.json") {
      cy.intercept(
        "/ui-server/api/graphql",
        { fixture }
      ).as(name);
      return this;
    }

    project(path = "", name = "getProject", result = "projects/project.json", statistics = true) {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(
        `/ui-server/api/projects/${encodeURIComponent(path)}?statistics=${statistics}&doNotTrack=*`,
        fixture
      ).as(name);
      return this;
    }

    projectFiles( names = {
      rootName: "getProjectFilesRoot",
      gitAttributesName: "getGitAttributes",
      countFlightsName: "getCountFlights",
      historicalUseNotebookName: "getHistoricalUseNotebook",
      latexNotebookName: "getLatexNotebook",
      randomPyFileName: "getRandomPyFile"
    }) {
      const { countFlightsName, gitAttributesName, historicalUseNotebookName, latexNotebookName, rootName, } = names;
      const { randomPyFileName } = names;
      cy.intercept(
        `/ui-server/api/projects/*/repository/tree?path=&recursive=false&per_page=100&page=1`,
        { fixture: "project/files/project-files-root.json" }
      ).as(rootName);
      cy.intercept(
        `/ui-server/api/projects/*/repository/files/.gitattributes/raw?ref=master`,
        { fixture: "project/files/project-files-git-attributes" }
      ).as(gitAttributesName);
      cy.intercept("/ui-server/api/projects/*/repository/files/01-CountFlights.ipynb?ref=master",
        { fixture: "project/files/01-CountFlights.json" }
      ).as(countFlightsName);
      cy.intercept("/ui-server/api/projects/*/repository/files/Historical-Use.ipynb?ref=master",
        { fixture: "project/files/Historical-Use.json" }
      ).as(historicalUseNotebookName);
      cy.intercept("/ui-server/api/projects/*/repository/files/latex-notebook.ipynb?ref=master",
        { fixture: "project/files/latex-notebook.json" }
      ).as(latexNotebookName);
      this.cy.intercept("/ui-server/api/projects/*/repository/files/random_py_file.py?ref=master",
        { fixture: "project/files/random_py_file.json" }
      ).as(randomPyFileName);
      return this;
    }

    errorProject(path = "", name = "getErrorProject") {
      const fixture = this.useMockedData ? { fixture: `projects/no-project.json`, statusCode: 404 } : undefined;
      cy.intercept(
        `/ui-server/api/projects/${encodeURIComponent(path)}?statistics=*`,
        fixture
      ).as(name);

      cy.intercept(
        "/ui-server/api/projects/null/repository/branches?per_page=100&page=1",
        { statusCode: 404 }
      ).as("getErrorProjectBranches");

      return this;
    }

    changeVisibility(path = "", name = "changeVisibility", result = "projects/change-visibility.json") {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept("/ui-server/api/projects/*/graph/webhooks", {
        body: { message: "Hook created" }
      });
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(path)}`,
        fixture
      ).as(name);
      return this;
    }

    cacheProjectList(name = "getCacheProjectList", result = "projects/cache-project-list.json") {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(
        `/ui-server/api/renku/cache.project_list`,
        fixture
      ).as(name);
      cy.intercept(
        `/ui-server/api/renku/*/cache.project_list`,
        fixture
      ).as(name);
      return this;
    }

    interceptMigrationCheck(name, fixture, queryUrl = null) {
      const coreUrl = "/ui-server/api/renku/cache.migrations_check";
      const defaultQuery = "git_url=https%3A%2F%2Fdev.renku.ch%2Fgitlab%2Fe2e%2Flocal-test-project.git&branch=master";
      cy.intercept(`${coreUrl}?${ queryUrl || defaultQuery}`, {
        fixture: fixture
      }).as(name);
      return this;
    }

    projectConfigShow({ error = false, legacyError = false } = {}) {
      let fixture = "project/config-show.json";
      if (error)
        fixture = "errors/core-error-2001.json";
      else if (legacyError)
        fixture = "errors/core-error-old.json";
      cy.intercept(
        "/ui-server/api/renku/*/config.show?git_url=*",
        { fixture }
      ).as("getProjectConfigShow");
      return this;
    }

    projectMigrationError(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "errors/core-error-2001.json",
        params.queryUrl
      );
      return this;
    }

    projectMigrationLegacyError(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "errors/core-error-old.json",
        params.queryUrl
      );
      return this;
    }

    projectMigrationUpToDate(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "project/test-project_migration_up-to-date.json",
        params.queryUrl
      );
      return this;
    }

    projectMigrationOptional(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "project/test-project_migration_update-optional.json",
        params.queryUrl
      );
      return this;
    }

    projectMigrationRecommended(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "project/test-project_migration_update-recommended.json",
        params.queryUrl
      );
      return this;
    }

    projectMigrationRequired(params: MigrationCheckParams = { queryUrl: null, fixtureName: "getMigration" }) {
      this.interceptMigrationCheck(
        params.fixtureName,
        "project/test-project_migration_update-required.json",
        params.queryUrl
      );
      return this;
    }

    projectLockStatus({ locked = false, error = false, legacyError = false } = {}) {
      const coreUrl = "/ui-server/api/renku/project.lock_status";
      const params = "git_url=*";
      const errorFixture = legacyError ? "errors/core-error-old.json" : "errors/core-error-2001.json";
      const data = error || legacyError ?
        { fixture: errorFixture } :
        { body: { result: { locked } } };
      cy.intercept(
        `${coreUrl}?${params}`,
        data
      ).as("getProjectLockStatus");
      return this;
    }

    projectTestContents(
      names = {
        configName: "getProjectConfig",
        coreServiceVersionName: "getCoreServiceVersion",
        coreService8VersionName: "getCoreService8Version",
        projectBranchesName: "getProjectBranches",
        projectCommitsName: "getProjectCommits",
        projectReadmeCommits: "getProjectReadmeCommits",
        readmeName: "getReadme",
        validationName: "getValidation"
      }, coreVersion = 8
    ) {
      const {
        configName,
        coreServiceVersionName,
        coreService8VersionName,
        projectBranchesName,
        projectCommitsName,
        readmeName
      } = names;
      const { projectReadmeCommits, validationName } = names;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/README.md/raw?ref=master",
        { fixture: "project/test-project-readme.md" }
      ).as(readmeName);
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=2&path=README.md&page=1",
        { fixture: "project/test-project-readme-commits.json" }
      ).as(projectReadmeCommits);
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=100&page=1",
        { fixture: "project/test-project-commits.json" }
      ).as(projectCommitsName);
      cy.intercept(
        "/ui-server/api/projects/*/repository/branches?per_page=100&page=1",
        { fixture: "project/test-project-branches.json" }
      ).as(projectBranchesName);
      cy.intercept("/ui-server/api/projects/*/graph/webhooks/validation", {
        body: { message: "Hook valid" }
      }).as(validationName);
      cy.intercept("/ui-server/api/projects/*/graph/status", {
        body: {
          activated: true,
          progress: { done: 5, total: 5, percentage: 100.0 },
          details: { status: "success", message: "triples store" }
        }
      });
      cy.intercept(`/ui-server/api/renku/${coreVersion}/version`, {
        body: {
          result: {
            latest_version: "0.16.2",
            supported_project_version: coreVersion
          }
        }
      }).as(coreService8VersionName);
      cy.intercept("/ui-server/api/renku/9/version", {
        body: {
          result: {
            latest_version: "1.0.4",
            supported_project_version: 9.0
          }
        }
      }).as(coreServiceVersionName);
      cy.intercept("/ui-server/api/renku/9/config.show?git_url=*",
        { fixture: "project/test-project_config.json" }
      ).as(configName);
      return this;
    }

    projectTest(
      names = {
        configName: "getProjectConfig",
        coreServiceVersionName: "getCoreServiceVersion",
        coreService8VersionName: "getCoreService8Version",
        projectBranchesName: "getProjectBranches",
        projectCommitsName: "getProjectCommits",
        projectName: "getProject",
        projectReadmeCommits: "getProjectReadmeCommits",
        readmeName: "getReadme",
        validationName: "getValidation",
        coreVersion: 8
      },
      overrides = {
        visibility: "public"
      }
    ) {
      const { projectName } = names;
      const { visibility } = overrides;
      cy.fixture("project/test-project.json").then((project) => {
        project["visibility"] = visibility;
        cy.intercept(
          "/ui-server/api/projects/e2e%2Flocal-test-project?statistics=true&doNotTrack=*",
          project
        ).as(projectName);
      });

      return this.projectTestContents(names);
    }

    projectTestObserver(
      names = {
        configName: "getProjectConfig",
        coreServiceVersionName: "getCoreServiceVersion",
        coreService8VersionName: "getCoreService8Version",
        projectBranchesName: "getProjectBranches",
        projectCommitsName: "getProjectCommits",
        projectName: "getProject",
        projectReadmeCommits: "getProjectReadmeCommits",
        readmeName: "getReadme",
        validationName: "getValidation"
      }
    ) {
      const { projectName } = names;
      cy.fixture("project/test-project.json").then((project) => {
        project.permissions.project_access.access_level = 10;
        cy.intercept(
          "GET",
          "/ui-server/api/projects/e2e%2Flocal-test-project?statistics=true&doNotTrack=*",
          project
        ).as(projectName);
      });
      return this.projectTestContents(names);
    }

    updateProject(path = "", name = "updateProject", result = "project/update-project.json") {
      const fixture = this.useMockedData ? { fixture: result, delay: 100 } : undefined;
      cy.intercept("/ui-server/api/projects/*/graph/webhooks", {
        body: { message: "Hook created" }
      });
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(path)}`,
        fixture
      ).as(name);
      return this;
    }

    updateAvatar(args = { projectId: 43781, name: "updateAvatar", result: "project/update-project.json" }) {
      const { projectId, name, result } = args;
      cy.fixture(result).then((project) => {
        project["avatar"] = "avatar-url";
        cy.intercept(
          "PUT",
          `/ui-server/api/projects/${projectId}`,
          project
        ).as(name);
      });

      return this;
    }

    getNamespace(namespace = "", name = "getNamespace", result = "projects/namespace-128.json") {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(
        `/ui-server/api/groups/${namespace}`,
        fixture
      ).as(name);
      return this;
    }

    getStatusProcessing(finished = false, name = "getStatusProcessing") {
      const result = finished ?
        "project/project-status-done.json" :
        "project/project-status-processing.json";
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/graph/status",
        fixture
      ).as(name);
      return this;
    }

    getProjectCommits(name = "getProjectCommits", fixture = "project/test-project-commits.json") {
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=100&page=1",
        { fixture }
      ).as(name);
    }
  };
}

export { Projects, MigrationCheckParams };
