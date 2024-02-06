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

/**
 * Fixtures for New Project
 */

interface ListManyProjectArgs extends NameOnlyFixture {
  numberOfProjects?: number;
}

interface ListProjectV2MembersFixture extends ProjectV2Args {
  removeMemberId?: string;
  addMember?: { member: { id: string; email: string }; role: string };
}

interface ProjectV2Args extends SimpleFixture {
  projectId?: string;
}

interface ProjectV2DeleteFixture extends NameOnlyFixture {
  projectId?: string;
}

interface ProjectV2DeleteMemberFixture extends ProjectV2Args {
  memberId?: string;
}

function generateProjects(numberOfProjects: number, start: number) {
  const projects = [];
  for (let i = 0; i < numberOfProjects; ++i) {
    const id = start + i;
    const project = {
      id: `${id}`,
      name: `test ${id} v2-project`,
      slug: `test-${id}-v2-project`,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: { id: "user1-uuid" },
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
    createProjectV2(args?: SimpleFixture) {
      const {
        fixture = "projectV2/create-projectV2.json",
        name = "createProjectV2",
      } = args ?? {};
      const response = { fixture, delay: 2000, statusCode: 201 };
      cy.intercept("POST", "/ui-server/api/data/projects", response).as(name);
      return this;
    }

    deleteProjectV2(args?: ProjectV2DeleteFixture) {
      const {
        name = "deleteProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { delay: 2000, statusCode: 204 };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/projects/${projectId}`,
        response
      ).as(name);
      return this;
    }

    deleteProjectV2Member(args?: ProjectV2DeleteMemberFixture) {
      const {
        fixture = "projectV2/list-projectV2-members.json",
        name = "deleteProjectV2Members",
        projectId = "THEPROJECTULID26CHARACTERS",
        memberId = "user3-uuid",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/projects/${projectId}/members/${memberId}`,
        response
      ).as(name);
      return this;
    }

    listManyProjectV2(args?: ListManyProjectArgs) {
      const { numberOfProjects = 50, name = "listProjectV2" } = args ?? {};
      cy.intercept("GET", `/ui-server/api/data/projects?*`, (req) => {
        const page = (req.query["perPage"] as number) ?? 1;
        const perPage = (req.query["perPage"] as number) ?? 20;
        const start = (page - 1) * perPage;
        const numToGen = Math.min(
          Math.max(numberOfProjects - start - perPage, 0),
          perPage
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
      const response = { fixture, delay: 2000 };
      cy.intercept("GET", `/ui-server/api/data/projects?*`, response).as(name);
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
          (memberWithRole) => memberWithRole.member.id !== removeMemberId
        );
        if (addMember != null) result.push(addMember);
        const response = { body: result };
        cy.intercept(
          "GET",
          `/ui-server/api/data/projects/${projectId}/members`,
          response
        ).as(name);
      });
      return this;
    }

    patchProjectV2Member(args?: ProjectV2DeleteMemberFixture) {
      const {
        fixture = "projectV2/list-projectV2-members.json",
        name = "patchProjectV2Members",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/projects/${projectId}/members`,
        response
      ).as(name);
      return this;
    }

    postDeleteReadProjectV2(args?: ProjectV2DeleteFixture) {
      const {
        name = "postDeleteReadProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `Project with id ${projectId} does not exist.`,
          },
        },
        delay: 2000,
        statusCode: 404,
      };
      cy.intercept(
        "GET",
        `/ui-server/api/data/projects/${projectId}`,
        response
      ).as(name);
      return this;
    }

    readProjectV2(args?: ProjectV2Args) {
      const {
        fixture = "projectV2/read-projectV2.json",
        name = "readProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/projects/${projectId}`,
        response
      ).as(name);
      return this;
    }

    updateProjectV2(args?: ProjectV2Args) {
      const {
        fixture = "projectV2/update-projectV2-metadata.json",
        name = "updateProjectV2",
        projectId = "THEPROJECTULID26CHARACTERS",
      } = args ?? {};
      const response = { fixture, delay: 2000 };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/projects/${projectId}`,
        response
      ).as(name);
      return this;
    }
  };
}
