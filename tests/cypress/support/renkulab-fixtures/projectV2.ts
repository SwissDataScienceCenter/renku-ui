/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

interface ProjectOverrides {
  id: string;
  name: string;
  namespace: string;
  slug: string;
  visibility: string;
  description?: string;
  keywords?: string[];
  template_id?: string;
  is_template?: boolean;
  documentation: string | null | undefined;
  repositories: string[];
}

/**
 * Fixtures for New Project
 */

interface ListManyProjectArgs extends NameOnlyFixture {
  numberOfProjects?: number;
}

interface ListProjectV2MembersFixture extends ProjectV2IdArgs {
  removeMemberId?: string;
  addMember?: {
    id: string;
    role: string;
    first_name: string;
    last_name: string;
    namespace: string;
  };
}

interface ProjectV1MigrationArgs extends SimpleFixture {
  v1Id?: string;
  overrides?: Partial<ProjectOverrides>;
}

interface ProjectV2CreateArgs extends SimpleFixture {
  slug?: string;
  namespace?: string;
}

interface ProjectV2IdArgs extends SimpleFixture {
  projectId?: string;
  overrides?: Partial<ProjectOverrides>;
  statusCode?: number;
}

interface ProjectV2CopyFixture extends ProjectV2IdArgs {
  dataConnectorError?: boolean;
}

interface ProjectV2DeleteFixture extends NameOnlyFixture {
  projectId?: string;
}

interface ProjectV2ListCopiesFixture
  extends Omit<ProjectV2IdArgs, "overrides"> {
  writeable?: boolean;
  count?: number | null;
}

interface ProjectV2NameArgs extends SimpleFixture {
  namespace?: string;
  projectSlug?: string;
  overrides?: Partial<ProjectOverrides>;
}

interface ProjectV2PatchOrDeleteMemberFixture extends ProjectV2IdArgs {
  memberId?: string;
}

export function generateProjects(numberOfProjects: number, start: number) {
  const projects = [];
  for (let i = 0; i < numberOfProjects; ++i) {
    const id = start + i;
    const project = {
      id: `${id}`,
      name: `test ${id} v2-project`,
      namespace: "user1-uuid",
      slug: `test-${id}-v2-project`,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: "user1-uuid",
      repositories: [
        "https://domain.name/repo1.git",
        "https://domain.name/repo2.git",
      ],
      visibility: "public",
      description: `Project ${id} description`,
    };
    projects.push(project);
  }
  return projects;
}

export function ProjectV2<T extends FixturesConstructor>(Parent: T) {
  return class ProjectV2Fixtures extends Parent {
    copyProjectV2(args?: ProjectV2CopyFixture) {
      const {
        fixture = "projectV2/create-projectV2.json",
        projectId = "THEPROJECTULID26CHARACTERS",
        name = "copyProjectV2",
        dataConnectorError = false,
      } = args ?? {};
      cy.fixture(fixture).then((project) => {
        cy.intercept(
          "POST",
          `/api/data/projects/${projectId}/copies`,
          (req) => {
            const newProject = req.body;
            expect(newProject.name).to.not.be.undefined;
            expect(newProject.namespace).to.not.be.undefined;
            expect(newProject.slug).to.not.be.undefined;
            expect(newProject.visibility).to.not.be.undefined;
            if (dataConnectorError) {
              const body = {
                error: {
                  code: 1404,
                  message: `The project was copied to ${newProject.namespace}/${newProject.slug}, but not all data connectors were included.`,
                },
              };
              req.reply({ body, statusCode: 403, delay: 1000 });
              return;
            }
            const body = { ...project, ...newProject };
            req.reply({ body, statusCode: 201, delay: 1000 });
          },
        ).as(name);
      });
      return this;
    }

    createProjectV2(args?: ProjectV2CreateArgs) {
      const {
        fixture = "projectV2/create-projectV2.json",
        name = "createProjectV2",
      } = args ?? {};
      cy.fixture(fixture).then((values) => {
        cy.intercept("POST", "/api/data/projects", {
          body: {
            values,
            ...args,
          },
          statusCode: 201,
        }).as(name);
      });
      return this;
    }

    deleteProjectV2(args?: ProjectV2DeleteFixture) {
      const {
        name = "deleteProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { statusCode: 204 };
      cy.intercept("DELETE", `/api/data/projects/${projectId}`, response).as(
        name,
      );
      return this;
    }

    deleteProjectV2Member(args?: ProjectV2PatchOrDeleteMemberFixture) {
      const {
        fixture = "projectV2/list-projectV2-members.json",
        name = "deleteProjectV2Members",
        projectId = "THEPROJECTULID26CHARACTERS",
        memberId = "user3-uuid",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "DELETE",
        `/api/data/projects/${projectId}/members/${memberId}`,
        response,
      ).as(name);
      return this;
    }

    listManyProjectV2(args?: ListManyProjectArgs) {
      const { numberOfProjects = 50, name = "listProjectV2" } = args ?? {};
      cy.intercept("GET", `/api/data/projects?*`, (req) => {
        const page = +((req.query["page"] as number) ?? 1);
        const perPage = +((req.query["per_page"] as number) ?? 20);
        const start = (page - 1) * perPage;
        const numToGen = Math.min(
          Math.max(numberOfProjects - start - perPage, 0),
          perPage,
        );
        req.reply({
          body: generateProjects(numToGen, start),
          headers: {
            page: page.toString(),
            "per-page": perPage.toString(),
            total: numberOfProjects.toString(),
            "total-pages": Math.ceil(numberOfProjects / perPage).toString(),
          },
        });
      }).as(name);
      return this;
    }

    listProjectV2(args?: SimpleFixture) {
      const {
        fixture = "projectV2/list-projectV2.json",
        name = "listProjectV2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/api/data/projects?*`, response).as(name);
      return this;
    }

    listProjectV2ByNamespace(args?: Omit<ProjectV2NameArgs, "projectSlug">) {
      const {
        fixture = "projectV2/list-projectV2.json",
        name = "listProjectV2ByNamespace",
        namespace = "test-2-group-v2",
      } = args ?? {};
      cy.fixture(fixture).then((content) => {
        const result = content.map((project) => {
          project.namespace = namespace;
          return project;
        });
        const response = { body: result };
        cy.intercept(
          "GET",
          `/api/data/projects?namespace=${namespace}*`,
          response,
        ).as(name);
      });
      return this;
    }

    listProjectV2Copies(args?: ProjectV2ListCopiesFixture) {
      const {
        fixture = "projectV2/list-projectV2.json",
        name = "listProjectV2Copies",
        projectId = "THEPROJECTULID26CHARACTERS",
        writeable = false,
        count = null,
      } = args ?? {};

      cy.fixture(fixture).then((projects) => {
        const url = writeable
          ? `/api/data/projects/${projectId}/copies?writable=true`
          : `/api/data/projects/${projectId}/copies?`;
        cy.intercept("GET", url, (req) => {
          if (count === 0) {
            req.reply({ body: [], statusCode: 200, delay: 1000 });
            return;
          }
          if (count === 1) {
            const body = [projects[0]];
            req.reply({ body, statusCode: 200, delay: 1000 });
            return;
          }
          if (count > 2) {
            const body = generateProjects(count, 0);
            req.reply({ body, statusCode: 200, delay: 1000 });
            return;
          }
          const body = projects;
          req.reply({ body, statusCode: 200, delay: 1000 });
        }).as(name);
      });
      return this;
    }

    getProjectV2Permissions(args?: ProjectV2IdArgs) {
      const {
        fixture = "projectV2/projectV2-permissions.json",
        name = "getProjectV2Permissions",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/api/data/projects/${projectId}/permissions`,
        response,
      ).as(name);
      return this;
    }

    listProjectV2Members(args?: ListProjectV2MembersFixture) {
      const {
        fixture = "projectV2/list-projectV2-members.json",
        name = "listProjectV2Members",
        projectId = "THEPROJECTULID26CHARACTERS",
        removeMemberId = null,
        addMember = null,
      } = args ?? {};
      cy.fixture(fixture).then((content) => {
        const result = content.filter(
          (memberWithRole) => memberWithRole.id !== removeMemberId,
        );
        if (addMember != null) result.push(addMember);
        const response = { body: result };
        cy.intercept(
          "GET",
          `/api/data/projects/${projectId}/members`,
          response,
        ).as(name);
      });
      return this;
    }

    patchProjectV2Member(args?: ProjectV2PatchOrDeleteMemberFixture) {
      const {
        fixture = "projectV2/list-projectV2-members.json",
        name = "patchProjectV2Members",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        `/api/data/projects/${projectId}/members`,
        response,
      ).as(name);
      return this;
    }

    postDeleteReadProjectV2(args?: ProjectV2NameArgs) {
      const {
        name = "postDeleteReadProjectV2",
        namespace = "user1-uuid",
        projectSlug = "test-2-v2-project",
      } = args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `Project  ${namespace}/${projectSlug} does not exist.`,
          },
        },
        statusCode: 404,
      };
      cy.intercept(
        "GET",
        `/api/data/namespaces/${namespace}/projects/${projectSlug}*`,
        response,
      ).as(name);
      return this;
    }

    readProjectV1Migration(args?: ProjectV1MigrationArgs) {
      const {
        fixture = "projectV2/read-projectV2.json",
        name = "readProjectV1Migration",
        overrides = {},
        v1Id = "39646",
      } = args ?? {};
      cy.fixture(fixture).then((project) => {
        const response = {
          ...project,
          ...overrides,
        };
        cy.intercept(
          "GET",
          `/api/data/renku_v1_projects/${v1Id}/migrations`,
          response,
        ).as(name);
      });
      return this;
    }

    readProjectV1MigrationError(
      args?: Omit<ProjectV1MigrationArgs, "fixture" | "overrides">,
    ) {
      const { name = "readProjectV1Migration", v1Id = "39646" } = args ?? {};
      const response = {
        error: {
          code: 1404,
          message: `Migration for project v1 with id '${v1Id}' does not exist.`,
        },
      };
      cy.intercept("GET", `/api/data/renku_v1_projects/${v1Id}/migrations`, {
        body: response,
        statusCode: 404,
      }).as(name);

      return this;
    }

    readProjectV2(args?: ProjectV2NameArgs) {
      const {
        fixture = "projectV2/read-projectV2.json",
        name = "readProjectV2",
        namespace = "user1-uuid",
        projectSlug = "test-2-v2-project",
        overrides = {},
      } = args ?? {};
      cy.fixture(fixture).then((project) => {
        const response = {
          ...project,
          namespace,
          slug: projectSlug,
          ...overrides,
        };
        cy.intercept(
          "GET",
          `/api/data/namespaces/${namespace}/projects/${projectSlug}*`,
          response,
        ).as(name);
      });
      return this;
    }

    readProjectV2WithoutDocumentation(args?: ProjectV2NameArgs) {
      const {
        fixture = "projectV2/read-projectV2-without-documentation.json",
        name = "readProjectV2WithoutDocumentation",
        namespace = "user1-uuid",
        projectSlug = "test-2-v2-project",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/api/data/namespaces/${namespace}/projects/${projectSlug}`,
        response,
      ).as(name);
      return this;
    }

    readProjectV2ById(args?: ProjectV2IdArgs) {
      const {
        fixture = "projectV2/read-projectV2.json",
        name = "readProjectV2ById",
        projectId = "THEPROJECTULID26CHARACTERS",
        overrides = {},
        statusCode = 200,
      } = args ?? {};
      cy.fixture(fixture).then((project) => {
        cy.intercept("GET", `/api/data/projects/${projectId}*`, (req) => {
          const response = { ...project, ...overrides, id: projectId };
          req.reply({ body: response, delay: 1000, statusCode });
        }).as(name);
      });
      return this;
    }

    updateProjectV2(args?: ProjectV2IdArgs) {
      const {
        fixture = "projectV2/update-projectV2-metadata.json",
        name = "updateProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("PATCH", `/api/data/projects/${projectId}`, response).as(
        name,
      );
      return this;
    }

    sessionLaunchers(args?: SimpleFixture) {
      const { fixture = "", name = "sessionLaunchers" } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/api/data/projects/*/session_launchers`,
        response,
      ).as(name);
      return this;
    }

    sessionSecretSlots(args?: SimpleFixture) {
      const {
        fixture = "projectV2SessionSecrets/secret_slots.json",
        name = "sessionSecretSlots",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/api/data/projects/*/session_secret_slots",
        response,
      ).as(name);
      return this;
    }

    postSessionSecretSlot(args?: SimpleFixture) {
      const {
        fixture = "projectV2SessionSecrets/post_secret_slot.json",
        name = "postSessionSecretSlot",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("POST", "/api/data/session_secret_slots", response).as(name);
      return this;
    }

    patchSessionSecretSlot(args?: SimpleFixture) {
      const {
        fixture = "projectV2SessionSecrets/post_secret_slot.json",
        name = "patchSessionSecretSlot",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("PATCH", "/api/data/session_secret_slots/*", response).as(
        name,
      );
      return this;
    }

    deleteSessionSecretSlot(args?: NameOnlyFixture) {
      const { name = "deleteSessionSecretSlot" } = args ?? {};
      cy.intercept("DELETE", "/api/data/session_secret_slots/*", {
        statusCode: 204,
      }).as(name);
      return this;
    }

    sessionSecrets(args?: SimpleFixture) {
      const {
        fixture = "projectV2SessionSecrets/secrets.json",
        name = "sessionSecrets",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/api/data/projects/*/session_secrets", response).as(
        name,
      );
      return this;
    }

    patchSessionSecrets(args?: SimpleFixture) {
      const {
        fixture = "projectV2SessionSecrets/secrets.json",
        name = "patchSessionSecrets",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        "/api/data/projects/*/session_secrets",
        response,
      ).as(name);
      return this;
    }
  };
}
