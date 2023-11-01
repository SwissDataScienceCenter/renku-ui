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
import {
  DeepRequired,
  FixtureWithOverrides,
  NameOnlyFixture,
  SimpleFixture,
} from "./fixtures.types";

/**
 * Fixtures for Projects
 */

export function Projects<T extends FixturesConstructor>(Parent: T) {
  return class ProjectsFixtures extends Parent {
    landingUserProjects(args?: SimpleFixture) {
      const {
        fixture = "landing-user-projects.json",
        name = "getLandingUserProjects",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("POST", "/ui-server/api/graphql", response).as(name);
      return this;
    }

    getLastVisitedProjects(args?: SimpleFixture) {
      const {
        fixture = "projects/last-visited-projects.json",
        name = "getLastVisitedProjects",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/last-projects/*", response).as(name);
      return this;
    }

    projects(args?: SimpleFixture) {
      const { fixture = "projects.json", name = "getProjects" } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects?query=last_activity_at&per_page=100&starred=true&page=1",
        response
      ).as(name);
      return this;
    }

    projectsGraphQl(args?: SimpleFixture) {
      const { fixture = "projects.json", name = "getProjectsGraphQl" } =
        args ?? {};
      const response = { fixture };
      cy.intercept("POST", "/ui-server/api/graphql", response).as(name);
      return this;
    }

    projectById(args?: ProjectByIdArgs) {
      const {
        fixture = "projects/project.json",
        name = "getProjectsById",
        projectId = 39646,
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/ui-server/api/projects/${projectId}`, response).as(
        name
      );
      return this;
    }

    project(args?: Partial<ProjectArgs>) {
      const {
        fixture = "projects/project.json",
        name = "getProject",
        projectPath = "",
        statistics = true,
      } = args ?? {};
      const url = `/ui-server/api/projects/${encodeURIComponent(
        projectPath
      )}?statistics=${statistics}&doNotTrack=*`;
      const response = { fixture };
      cy.intercept("GET", url, response).as(name);
      return this;
    }

    projectFiles(args?: ProjectFilesArgs) {
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
      }) as DeepRequired<ProjectFilesArgs>;

      const rootResponse = { fixture: root.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/tree?path=&recursive=false&per_page=100&page=1",
        rootResponse
      ).as(root.name);

      const gitAttributesResponse = { fixture: gitAttributes.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/.gitattributes/raw?ref=master",
        gitAttributesResponse
      ).as(gitAttributes.name);

      const countFlightsResponse = { fixture: countFlights.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/01-CountFlights.ipynb?ref=master",
        countFlightsResponse
      ).as(countFlights.name);

      const historicalUseNotebookResponse = {
        fixture: historicalUseNotebook.fixture,
      };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/Historical-Use.ipynb?ref=master",
        historicalUseNotebookResponse
      ).as(historicalUseNotebook.name);

      const latexNotebookResponse = { fixture: latexNotebook.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/latex-notebook.ipynb?ref=master",
        latexNotebookResponse
      ).as(latexNotebook.name);

      const randomPyFileResponse = { fixture: randomPyFile.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/random_py_file.py?ref=master",
        randomPyFileResponse
      ).as(randomPyFile.name);

      return this;
    }

    errorProject(args?: ErrorProjectArgs) {
      const { branches, project } = Cypress._.defaultsDeep({}, args, {
        branches: { name: "getErrorProjectBranches", statusCode: 404 },
        project: {
          fixture: "projects/no-project.json",
          name: "getErrorProject",
          projectPath: "",
          statusCode: 404,
        },
      }) as DeepRequired<ErrorProjectArgs>;

      const projectResponse = {
        fixture: project.fixture,
        statusCode: project.statusCode,
      };
      cy.intercept(
        "GET",
        `/ui-server/api/projects/${encodeURIComponent(
          project.path
        )}?statistics=*`,
        projectResponse
      ).as(project.name);

      const branchesResponse = { statusCode: branches.statusCode };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/null/repository/branches?per_page=100&page=1",
        branchesResponse
      ).as(branches.name);

      return this;
    }

    changeVisibility(args?: ChangeVisibilityArgs) {
      const {
        fixture = "projects/change-visibility.json",
        name = "changeVisibility",
        projectPath = "",
      } = args ?? {};

      const webhookResponse = { body: { message: "Hook created" } };
      cy.intercept(
        "POST",
        "/ui-server/api/kg/webhooks/projects/*/webhooks",
        webhookResponse
      );

      const response = { fixture };
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(projectPath)}`,
        response
      ).as(name);

      return this;
    }

    cacheProjectList(args?: SimpleFixture) {
      const {
        fixture = "projects/cache-project-list.json",
        name = "getCacheProjectList",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/renku/cache.project_list",
        response
      ).as(name);
      cy.intercept(
        "GET",
        "/ui-server/api/renku/*/cache.project_list",
        response
      ).as(name);
      return this;
    }

    interceptMigrationCheck(args?: InterceptMigrationCheckArgs) {
      const {
        fixture = "project/migrationStatus/level1-all-good.json",
        name = "migrationCheck",
        queryUrl = "",
      } = args ?? {};
      const coreUrl = "/ui-server/api/renku/**/cache.migrations_check";
      const defaultQuery =
        "git_url=https%3A%2F%2Fdev.renku.ch%2Fgitlab%2Fe2e%2Flocal-test-project&branch=master";
      const url = `${coreUrl}?${queryUrl || defaultQuery}`;
      const response = { fixture };
      cy.intercept("GET", url, response).as(name);
      return this;
    }

    projectConfigShow(args?: ProjectConfigShowArgs) {
      const { error = false, legacyError = false } = args ?? {};
      const defaultFixture = error
        ? "errors/core-error-2001.json"
        : legacyError
        ? "errors/core-error-old.json"
        : "project/config-show.json";
      const { fixture = defaultFixture, name = "getProjectConfigShow" } =
        args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/renku/*/config.show?git_url=*",
        response
      ).as(name);
      return this;
    }

    projectMigrationError(args?: ProjectMigrationErrorArgs) {
      const { errorNumber = 2001 } = args ?? {};
      const {
        fixture = `errors/core-error-${errorNumber}.json`,
        name = "getMigration",
        queryUrl = "",
      } = args ?? {};
      this.interceptMigrationCheck({ fixture, name, queryUrl });
      return this;
    }

    projectMigrationUpToDate(args?: InterceptMigrationCheckArgs) {
      const {
        fixture = "project/migrationStatus/level1-all-good.json",
        name = "getMigration",
        queryUrl = "",
      } = args ?? {};
      this.interceptMigrationCheck({ fixture, name, queryUrl });
      return this;
    }

    projectLockStatus(args?: ProjectLockStatusArgs) {
      const { error = false, legacyError = false, locked = false } = args ?? {};
      const defaultFixture = error
        ? "errors/core-error-2001.json"
        : legacyError
        ? "errors/core-error-old.json"
        : null;
      const { fixture = defaultFixture, name = "getProjectLockStatus" } =
        args ?? {};
      const coreUrl = "/ui-server/api/renku/**/project.lock_status";
      const params = "git_url=*";
      const url = `${coreUrl}?${params}`;
      const response = fixture ? { fixture } : { body: { result: { locked } } };
      cy.intercept("GET", url, response).as(name);
      return this;
    }

    projectTestContents(args?: ProjectTestContentsArgs) {
      const {
        config,
        coreServiceVersion,
        coreServiceV8,
        projectBranches,
        projectCommits,
        projectReadmeCommits,
        readme,
        kgStatusIndexing,
      } = Cypress._.defaultsDeep({}, args, {
        config: {
          fixture: "project/test-project_config.json",
          name: "getProjectConfig",
        },
        coreServiceVersion: {
          name: "getCoreServiceVersion",
        },
        coreServiceV8: {
          name: "getCoreService8Version",
          coreVersion: 8,
        },
        projectBranches: {
          fixture: "project/test-project-branches.json",
          name: "getProjectBranches",
        },
        projectCommits: {
          fixture: "project/test-project-commits.json",
          name: "getProjectCommits",
        },
        projectReadmeCommits: {
          fixture: "project/test-project-readme-commits.json",
          name: "getProjectReadmeCommits",
        },
        readme: {
          fixture: "project/test-project-readme.md",
          name: "getReadme",
        },
        kgStatusIndexing: {
          fixture: "project/kgStatus/kgStatusIndexing.json",
          name: "getKgStatusIndexing",
        },
      }) as DeepRequired<ProjectTestContentsArgs>;

      const configResponse = { fixture: config.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/renku/10/config.show?git_url=*",
        configResponse
      ).as(config.name);

      const coreServiceVersionResponse = {
        body: {
          result: {
            latest_version: "1.0.4",
            supported_project_version: 9.0,
          },
        },
      };

      cy.intercept(
        "GET",
        "/ui-server/api/renku/9/version",
        coreServiceVersionResponse
      ).as(coreServiceVersion.name);

      const coreServiceV8Response = {
        body: {
          result: {
            latest_version: "0.16.2",
            supported_project_version: coreServiceV8.coreVersion,
          },
        },
      };

      cy.intercept(
        "GET",
        `/ui-server/api/renku/${coreServiceV8.coreVersion}/version`,
        coreServiceV8Response
      ).as(coreServiceV8.name);

      const projectBranchesResponse = { fixture: projectBranches.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/branches?page=1&per_page=100",
        projectBranchesResponse
      ).as(projectBranches.name);
      // Intercepting with swapped pagination params is necessary because of the legacy API client
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/branches?per_page=100&page=1",
        projectBranchesResponse
      ).as(projectBranches.name);

      const projectCommitsResponse = { fixture: projectCommits.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/commits?ref_name=master&page=1&per_page=100",
        projectCommitsResponse
      ).as(projectCommits.name);

      const projectReadmeCommitsResponse = {
        fixture: projectReadmeCommits.fixture,
      };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=2&path=README.md&page=1",
        projectReadmeCommitsResponse
      ).as(projectReadmeCommits.name);

      const readmeCommitsResponse = { fixture: readme.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/files/README.md/raw?ref=master",
        readmeCommitsResponse
      ).as(readme.name);

      const kgStatusIndexingResponse = { fixture: kgStatusIndexing.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/kg/webhooks/projects/*/events/status",
        kgStatusIndexingResponse
      ).as(kgStatusIndexing.name);

      return this;
    }

    projectTest(args?: ProjectTestArgs) {
      const { project, overrides } = Cypress._.defaultsDeep({}, args, {
        project: {
          fixture: "project/test-project.json",
          name: "getProject",
        },
        overrides: {
          visibility: "public",
        },
      }) as Pick<DeepRequired<ProjectTestArgs>, "project" | "overrides">;

      cy.fixture(project.fixture).then((response) => {
        response["visibility"] = overrides.visibility;
        cy.intercept(
          "/ui-server/api/projects/e2e%2Flocal-test-project?statistics=true&doNotTrack=*",
          response
        ).as(project.name);
      });

      return this.projectTestContents(args);
    }

    projectTestObserver(args?: ProjectTestObserverArgs) {
      const { project } = Cypress._.defaultsDeep({}, args, {
        project: {
          fixture: "project/test-project.json",
          name: "getProject",
        },
      }) as Pick<DeepRequired<ProjectTestObserverArgs>, "project">;

      cy.fixture(project.fixture).then((response) => {
        response.permissions.project_access.access_level = 10;
        cy.intercept(
          "GET",
          "/ui-server/api/projects/e2e%2Flocal-test-project?statistics=true&doNotTrack=*",
          response
        ).as(project.name);
      });

      return this.projectTestContents(args);
    }

    updateProject(args?: UpdateProjectArgs) {
      const {
        fixture = "project/update-project.json",
        name = "updateProject",
        projectPath = "",
        statusCode = 200,
      } = args ?? {};

      const webhookResponse = { body: { message: "Hook created" } };
      cy.intercept(
        "POST",
        "/ui-server/api/kg/webhooks/projects/*/webhooks",
        webhookResponse
      );

      const response = { fixture, statusCode };
      cy.intercept(
        "PUT",
        `/ui-server/api/projects/${encodeURIComponent(projectPath)}`,
        response
      ).as(name);

      return this;
    }

    updateProjectKG(args?: UpdateProjectKGArgs) {
      const {
        fixture = "project/update-project.json",
        name = "updateProjectKG",
        statusCode = 200,
      } = args ?? {};
      const response = { fixture, statusCode };
      cy.intercept("PATCH", "/ui-server/api/kg/projects/**", response).as(name);
      return this;
    }

    deleteProject(args?: DeleteProjectArgs) {
      const { forbidden = false, name = "deleteProject" } = args ?? {};
      const response = { statusCode: forbidden ? 403 : 200 };
      cy.intercept("DELETE", "/ui-server/api/kg/projects/**", response).as(
        name
      );
      return this;
    }

    editProject(args?: SimpleFixture) {
      const {
        fixture = "project/edit/edit-project-confirm.json",
        name = "editProject",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("POST", "/ui-server/api/renku/**/project.edit", response).as(
        name
      );
      return this;
    }

    getProjectKG(args?: GetProjectKGArgs) {
      const {
        fixture = "project/project-kg.json",
        identifier = "**",
        name = "getProjectKG",
        overrides = null,
      } = args ?? {};
      const interceptUrl = `/ui-server/api/kg/projects/${identifier}`;

      if (overrides == null) {
        const response = { fixture };
        cy.intercept("GET", interceptUrl, response).as(name);
        return this;
      }

      cy.fixture(fixture).then((baseResult) => {
        const combinedResult = { ...baseResult, ...overrides };
        const response = { body: combinedResult };
        cy.intercept("GET", interceptUrl, response).as(name);
      });

      return this;
    }

    updateAvatar(args?: UpdateAvatarArgs) {
      const {
        fixture = "project/update-project.json",
        name = "updateAvatar",
        projectId = 43781,
      } = args ?? {};

      cy.fixture(fixture).then((response) => {
        response["avatar"] = "avatar-url";
        cy.intercept(
          "PUT",
          `/ui-server/api/projects/${projectId}`,
          response
        ).as(name);
      });
      return this;
    }

    getNamespace(args?: GetNamespaceArgs) {
      const {
        fixture = "projects/namespace-128.json",
        name = "getNamespace",
        namespace = "",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/ui-server/api/groups/${namespace}`, response).as(
        name
      );
      return this;
    }

    getKgStatus(args?: SimpleFixture) {
      const {
        fixture = "project/kgStatus/kgStatusIndexedSuccess.json",
        name = "getKgStatus",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/kg/webhooks/projects/*/events/status",
        response
      ).as(name);
      return this;
    }

    getProjectCommits(args?: SimpleFixture) {
      const {
        fixture = "project/test-project-commits.json",
        name = "getProjectCommits",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/projects/*/repository/commits?ref_name=master&per_page=100&page=1",
        response
      ).as(name);
      return this;
    }
  };
}

interface ProjectByIdArgs extends SimpleFixture {
  projectId?: number;
}

interface ProjectArgs extends SimpleFixture {
  projectPath?: string;
  statistics?: boolean;
}

interface ProjectFilesArgs {
  root?: SimpleFixture;
  gitAttributes?: SimpleFixture;
  countFlights?: SimpleFixture;
  historicalUseNotebook?: SimpleFixture;
  latexNotebook?: SimpleFixture;
  randomPyFile?: SimpleFixture;
}

interface ErrorProjectArgs {
  project?: SimpleFixture & {
    path?: string;
    statusCode?: number;
  };

  branches?: {
    name?: string;
    statusCode?: number;
  };
}

interface ChangeVisibilityArgs extends SimpleFixture {
  projectPath?: string;
}

interface InterceptMigrationCheckArgs extends SimpleFixture {
  queryUrl?: string;
}

interface ProjectMigrationErrorArgs extends InterceptMigrationCheckArgs {
  errorNumber?: number;
}

interface ProjectConfigShowArgs extends SimpleFixture {
  error?: boolean;
  legacyError?: boolean;
}

interface ProjectLockStatusArgs extends SimpleFixture {
  error?: boolean;
  legacyError?: boolean;
  locked?: boolean;
}

interface ProjectTestContentsArgs {
  config?: SimpleFixture;
  coreServiceVersion?: NameOnlyFixture;
  coreServiceV8?: { coreVersion?: number; name?: string };
  projectBranches?: SimpleFixture;
  projectCommits?: SimpleFixture;
  projectReadmeCommits?: SimpleFixture;
  readme?: SimpleFixture;
  kgStatusIndexing?: SimpleFixture;
}

interface ProjectTestArgs extends ProjectTestContentsArgs {
  project?: SimpleFixture;
  overrides?: {
    visibility?: "public" | "private";
  };
}

interface ProjectTestObserverArgs extends ProjectTestContentsArgs {
  project?: SimpleFixture;
}

interface UpdateProjectArgs extends SimpleFixture {
  projectPath?: string;
  statusCode?: number;
}

interface UpdateProjectKGArgs extends SimpleFixture {
  statusCode?: number;
}

interface DeleteProjectArgs {
  forbidden?: boolean;
  name?: string;
}

interface GetProjectKGArgs extends FixtureWithOverrides {
  identifier?: string;
}

interface UpdateAvatarArgs extends SimpleFixture {
  projectId?: number;
}

interface GetNamespaceArgs extends SimpleFixture {
  namespace?: string;
}
