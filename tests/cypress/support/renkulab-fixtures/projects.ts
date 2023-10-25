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
 * Fixtures for Projects
 */

// export interface MigrationCheckParams {
//   errorNumber?: number;
//   fixtureName?: string;
//   queryUrl?: string;
// }

export function Projects<T extends FixturesConstructor>(Parent: T) {
  return class ProjectsFixtures extends Parent {
    landingUserProjects(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "landing-user-projects.json",
        name: "getLandingUserProjects",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/graphql", response).as(name);
      return this;
    }

    getLastVisitedProjects(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "projects/last-visited-projects.json",
        name: "getLastVisitedProjects",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/last-projects/*", response).as(name);
      return this;
    }

    projects(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "projects.json",
        name: "getProjects",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(
        "/ui-server/api/projects?query=last_activity_at&per_page=100&starred=true&page=1",
        response
      ).as(name);
      return this;
    }

    projectsGraphQl(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "projects.json",
        name: "getProjectsGraphQl",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/graphql", response).as(name);
      return this;
    }

    projectById(args?: Partial<ProjectByIdArgs>) {
      const { fixture, name, projectId } = Cypress._.defaults({}, args, {
        fixture: "projects/project.json",
        name: "getProjectsById",
        projectId: 39646,
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(`/ui-server/api/projects/${projectId}`, response).as(name);
      return this;
    }

    project(args?: Partial<ProjectArgs>) {
      const { fixture, name, path, statistics } = Cypress._.defaults({}, args, {
        fixture: "projects/project.json",
        name: "getProject",
        path: "",
        statistics: true,
      });
      const url = `/ui-server/api/projects/${encodeURIComponent(
        path
      )}?statistics=${statistics}&doNotTrack=*`;
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(url, response).as(name);
      return this;
    }

    projectFiles(args?: DeepPartial<ProjectFilesArgs>) {
      const {
        root,
        gitAttributes,
        countFlights,
        historicalUseNotebook,
        latexNotebook,
        randomPyFile,
      } = Cypress._.defaultsDeep({}, args, {
        root: {
          fixture: "project/files/project-files-root.json",
          name: "getProjectFilesRoot",
        },
        gitAttributes: {
          fixture: "project/files/project-files-git-attributes",
          name: "getGitAttributes",
        },
        countFlights: {
          fixture: "project/files/01-CountFlights.json",
          name: "getCountFlights",
        },
        historicalUseNotebook: {
          fixture: "project/files/Historical-Use.json",
          name: "getHistoricalUseNotebook",
        },
        latexNotebook: {
          fixture: "project/files/latex-notebook.json",
          name: "getLatexNotebook",
        },
        randomPyFile: {
          fixture: "project/files/random_py_file.json",
          name: "getRandomPyFile",
        },
      }) as ProjectFilesArgs;

      const rootResponse = this.useMockedData
        ? { fixture: root.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/tree?path=&recursive=false&per_page=100&page=1",
        rootResponse
      ).as(root.name);

      const gitAttributesResponse = this.useMockedData
        ? { fixture: gitAttributes.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/.gitattributes/raw?ref=master",
        gitAttributesResponse
      ).as(gitAttributes.name);

      const countFlightsResponse = this.useMockedData
        ? { fixture: countFlights.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/01-CountFlights.ipynb?ref=master",
        countFlightsResponse
      ).as(countFlights.name);

      const historicalUseNotebookResponse = this.useMockedData
        ? { fixture: historicalUseNotebook.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/Historical-Use.ipynb?ref=master",
        historicalUseNotebookResponse
      ).as(historicalUseNotebook.name);

      const latexNotebookResponse = this.useMockedData
        ? { fixture: latexNotebook.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/latex-notebook.ipynb?ref=master",
        latexNotebookResponse
      ).as(latexNotebook.name);

      const randomPyFileResponse = this.useMockedData
        ? { fixture: randomPyFile.fixture }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/random_py_file.py?ref=master",
        randomPyFileResponse
      ).as(randomPyFile.name);

      return this;
    }

    errorProject(args?: DeepPartial<ErrorProjectArgs>) {
      const { branches, project } = Cypress._.defaultsDeep({}, args, {
        branches: { name: "getErrorProjectBranches", statusCode: 404 },
        project: {
          fixture: "projects/no-project.json",
          name: "getErrorProject",
          path: "",
          statusCode: 404,
        },
      }) as ErrorProjectArgs;

      const projectResponse = this.useMockedData
        ? { fixture: project.fixture, statusCode: project.statusCode }
        : undefined;
      cy.intercept(
        `/ui-server/api/projects/${encodeURIComponent(
          project.path
        )}?statistics=*`,
        projectResponse
      ).as(project.name);

      const branchesResponse = this.useMockedData
        ? { statusCode: branches.statusCode }
        : undefined;
      cy.intercept(
        "/ui-server/api/projects/null/repository/branches?per_page=100&page=1",
        branchesResponse
      ).as(branches.name);

      return this;
    }

    changeVisibility(args?: Partial<ChangeVisibilityArgs>) {
      const { fixture, name, path } = Cypress._.defaults({}, args, {
        fixture: "projects/change-visibility.json",
        name: "changeVisibility",
        path: "",
      });

      const webhookResponse = this.useMockedData
        ? { body: { message: "Hook created" } }
        : undefined;
      cy.intercept(
        "/ui-server/api/kg/webhooks/projects/*/webhooks",
        webhookResponse
      );

      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(path)}`,
        response
      ).as(name);

      return this;
    }

    cacheProjectList(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "projects/cache-project-list.json",
        name: "getCacheProjectList",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/renku/cache.project_list", response).as(
        name
      );
      cy.intercept("/ui-server/api/renku/*/cache.project_list", response).as(
        name
      );
      return this;
    }

    interceptMigrationCheck(args?: Partial<InterceptMigrationCheckArgs>) {
      const { fixture, name, queryUrl } = Cypress._.defaults({}, args, {
        fixture: "project/migrationStatus/level1-all-good.json",
        name: "migrationCheck",
        queryUrl: "",
      });
      const coreUrl = "/ui-server/api/renku/**/cache.migrations_check";
      const defaultQuery =
        "git_url=https%3A%2F%2Fdev.renku.ch%2Fgitlab%2Fe2e%2Flocal-test-project&branch=master";
      const url = `${coreUrl}?${queryUrl || defaultQuery}`;
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept(url, response).as(name);
      return this;
    }

    projectConfigShow(args?: Partial<ProjectConfigShowArgs>) {
      const { error, legacyError } = Cypress._.defaults({}, args, {
        error: false,
        legacyError: false,
      });
      const defaultFixture = error
        ? "errors/core-error-2001.json"
        : legacyError
        ? "errors/core-error-old.json"
        : "project/config-show.json";
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: defaultFixture,
        name: "getProjectConfigShow",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/renku/*/config.show?git_url=*", response).as(
        name
      );
      return this;
    }

    projectMigrationError(args?: Partial<ProjectMigrationErrorArgs>) {
      const errorNumber = args.errorNumber ?? 2001;
      const { fixture, name, queryUrl } = Cypress._.defaults({}, args, {
        fixture: `errors/core-error-${errorNumber}.json`,
        name: "getMigration",
        queryUrl: "",
      });
      this.interceptMigrationCheck({ fixture, name, queryUrl });
      return this;
    }

    projectMigrationUpToDate(args?: Partial<InterceptMigrationCheckArgs>) {
      const { fixture, name, queryUrl } = Cypress._.defaults({}, args, {
        fixture: "project/migrationStatus/level1-all-good.json",
        name: "getMigration",
        queryUrl: "",
      });
      this.interceptMigrationCheck({ fixture, name, queryUrl });
      return this;
    }

    projectLockStatus({
      locked = false,
      error = false,
      legacyError = false,
    } = {}) {
      const coreUrl = "/ui-server/api/renku/**/project.lock_status";
      const params = "git_url=*";
      const errorFixture = legacyError
        ? "errors/core-error-old.json"
        : "errors/core-error-2001.json";
      const data =
        error || legacyError
          ? { fixture: errorFixture }
          : { body: { result: { locked } } };
      cy.intercept(`${coreUrl}?${params}`, data).as("getProjectLockStatus");
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
        validationName: "getValidation",
      },
      coreVersion = 8
    ) {
      const {
        configName,
        coreServiceVersionName,
        coreService8VersionName,
        projectBranchesName,
        projectCommitsName,
        readmeName,
      } = names;
      const { projectReadmeCommits } = names;
      cy.intercept(
        "/ui-server/api/projects/*/repository/files/README.md/raw?ref=master",
        { fixture: "project/test-project-readme.md" }
      ).as(readmeName);
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=2&path=README.md&page=1",
        { fixture: "project/test-project-readme-commits.json" }
      ).as(projectReadmeCommits);
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&page=1&per_page=100",
        { fixture: "project/test-project-commits.json" }
      ).as(projectCommitsName);
      cy.intercept(
        "/ui-server/api/projects/*/repository/branches?page=1&per_page=100",
        { fixture: "project/test-project-branches.json" }
      ).as(projectBranchesName);
      // Intercepting with swapped pagination params is necessary because of the legacy API client
      cy.intercept(
        "/ui-server/api/projects/*/repository/branches?per_page=100&page=1",
        { fixture: "project/test-project-branches.json" }
      ).as(projectBranchesName);
      cy.intercept("/ui-server/api/kg/webhooks/projects/*/events/status", {
        fixture: "project/kgStatus/kgStatusIndexing.json",
      });
      cy.intercept(`/ui-server/api/renku/${coreVersion}/version`, {
        body: {
          result: {
            latest_version: "0.16.2",
            supported_project_version: coreVersion,
          },
        },
      }).as(coreService8VersionName);
      cy.intercept("/ui-server/api/renku/9/version", {
        body: {
          result: {
            latest_version: "1.0.4",
            supported_project_version: 9.0,
          },
        },
      }).as(coreServiceVersionName);
      cy.intercept("/ui-server/api/renku/10/config.show?git_url=*", {
        fixture: "project/test-project_config.json",
      }).as(configName);
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
        coreVersion: 8,
      },
      overrides = {
        visibility: "public",
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
        validationName: "getValidation",
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

    updateProject(
      path = "",
      name = "updateProject",
      result = "project/update-project.json",
      statusCode = 200
    ) {
      const fixture = this.useMockedData
        ? { fixture: result, statusCode }
        : undefined;
      cy.intercept("/ui-server/api/kg/webhooks/projects/*/webhooks", {
        body: { message: "Hook created" },
      });
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(path)}`,
        fixture
      ).as(name);
      return this;
    }

    updateProjectKG(
      name = "updateProjectKG",
      result = "project/update-project.json",
      statusCode = 200
    ) {
      const fixture = this.useMockedData
        ? { fixture: result, statusCode }
        : undefined;
      cy.intercept("PATCH", "/ui-server/api/kg/projects/**", fixture).as(name);
      return this;
    }

    deleteProject(name = "deleteProject", forbidden = false) {
      cy.intercept("DELETE", "/ui-server/api/kg/projects/**", {
        statusCode: forbidden ? 403 : 200,
      }).as(name);
      return this;
    }

    editProject(
      name = "editProject",
      result = "project/edit/edit-project-confirm.json"
    ) {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept("POST", "/ui-server/api/renku/**/project.edit", fixture).as(
        name
      );
      return this;
    }

    getProjectKG(params?: {
      name?: string;
      identifier?: string;
      result?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overrides?: any;
    }) {
      const {
        name = "getProjectKG",
        identifier = "**",
        result = "project/project-kg.json",
        overrides,
      } = params || {};
      const interceptUrl = `/ui-server/api/kg/projects/${identifier}`;
      if (overrides == null) {
        const fixture = { fixture: result };
        cy.intercept("GET", interceptUrl, fixture).as(name);
        return this;
      }
      cy.fixture(result).then((baseResult) => {
        const combinedResult = { ...baseResult, ...overrides };
        cy.intercept("GET", interceptUrl, {
          body: combinedResult,
        }).as(name);
      });
      return this;
    }

    updateAvatar(
      args = {
        projectId: 43781,
        name: "updateAvatar",
        result: "project/update-project.json",
      }
    ) {
      const { projectId, name, result } = args;
      cy.fixture(result).then((project) => {
        project["avatar"] = "avatar-url";
        cy.intercept("PUT", `/ui-server/api/projects/${projectId}`, project).as(
          name
        );
      });

      return this;
    }

    getNamespace(
      namespace = "",
      name = "getNamespace",
      result = "projects/namespace-128.json"
    ) {
      const fixture = this.useMockedData ? { fixture: result } : undefined;
      cy.intercept(`/ui-server/api/groups/${namespace}`, fixture).as(name);
      return this;
    }

    getKgStatus(
      fixture = "project/kgStatus/kgStatusIndexedSuccess.json",
      name = "getKgStatus"
    ) {
      cy.intercept("/ui-server/api/kg/webhooks/projects/*/events/status", {
        fixture,
      }).as(name);
      return this;
    }

    getProjectCommits(
      name = "getProjectCommits",
      fixture = "project/test-project-commits.json"
    ) {
      cy.intercept(
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=100&page=1",
        { fixture }
      ).as(name);
    }
  };
}

interface ProjectByIdArgs extends SimpleFixture {
  projectId: number;
}

interface ProjectArgs extends SimpleFixture {
  path: string;
  statistics: boolean;
}

interface ProjectFilesArgs {
  root: SimpleFixture;
  gitAttributes: SimpleFixture;
  countFlights: SimpleFixture;
  historicalUseNotebook: SimpleFixture;
  latexNotebook: SimpleFixture;
  randomPyFile: SimpleFixture;
}

interface ErrorProjectArgs {
  project: SimpleFixture & {
    path: string;
    statusCode: number;
  };

  branches: {
    name: string;
    statusCode: number;
  };
}

interface ChangeVisibilityArgs extends SimpleFixture {
  path: string;
}

interface InterceptMigrationCheckArgs extends SimpleFixture {
  queryUrl: string;
}

interface ProjectMigrationErrorArgs extends InterceptMigrationCheckArgs {
  errorNumber: number;
}

interface ProjectConfigShowArgs extends SimpleFixture {
  error: boolean;
  legacyError: boolean;
}
