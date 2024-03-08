/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * Fixtures for v2 Group and v2 Namespace
 */

interface ListManyGroupArgs extends NameOnlyFixture {
  numberOfGroups?: number;
}

interface ListV2GroupMembersFixture extends V2GroupArgs {
  removeUserId?: string;
  addMember?: { id: string; email: string; role: string };
}

interface V2GroupArgs extends SimpleFixture {
  groupSlug?: string;
}

interface V2GroupDeleteFixture extends NameOnlyFixture {
  groupSlug?: string;
}

interface V2GroupDeleteMemberFixture extends V2GroupArgs {
  userId?: string;
}
interface ListManyNamespacesArgs extends NameOnlyFixture {
  numberOfNamespaces?: number;
}

function generateGroups(numberOfGroups: number, start: number) {
  const groups = [];
  for (let i = 0; i < numberOfGroups; ++i) {
    const id = start + i;
    const slug = `test-${id}-v2-group`;
    const group = {
      id,
      name: `test ${id} v2-group`,
      slug,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: { id: "user1-uuid" },
      description: `Group ${slug} description`,
    };
    groups.push(group);
  }
  return groups;
}

function generateNamespaces(numberOfNamespaces: number, start: number) {
  const groups = [];
  for (let i = 0; i < numberOfNamespaces; ++i) {
    const id = start + i;
    const slug = `test-${id}-v2-group`;
    const group = {
      id,
      name: `test ${id} v2-group`,
      slug,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: { id: "user1-uuid" },
    };
    groups.push(group);
  }
  return groups;
}

export function V2Namespace<T extends FixturesConstructor>(Parent: T) {
  return class V2NamespaceFixtures extends Parent {
    createV2Group(args?: SimpleFixture) {
      const {
        fixture = "v2Group/create-v2Group.json",
        name = "createV2Group",
      } = args ?? {};
      const response = { fixture, delay: 2000, statusCode: 201 };
      cy.intercept("POST", "/ui-server/api/data/groups", response).as(name);
      return this;
    }

    deleteV2Group(args?: V2GroupDeleteFixture) {
      const { name = "deleteV2Group", groupSlug = "test-2-v2-group" } =
        args ?? {};
      const response = { delay: 2000, statusCode: 204 };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    deleteV2GroupMember(args?: V2GroupDeleteMemberFixture) {
      const {
        fixture = "v2Group/list-v2Group-members.json",
        name = "deleteV2GroupMembers",
        groupSlug = "test-2-v2-group",
        userId = "user3-uuid",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/groups/${groupSlug}/members/${userId}`,
        response
      ).as(name);
      return this;
    }

    listManyV2Group(args?: ListManyGroupArgs) {
      const { numberOfGroups = 50, name = "listV2Group" } = args ?? {};
      cy.intercept("GET", `/ui-server/api/data/groups?*`, (req) => {
        const page = (req.query["perPage"] as number) ?? 1;
        const perPage = (req.query["perPage"] as number) ?? 20;
        const start = (page - 1) * perPage;
        const numToGen = Math.min(
          Math.max(numberOfGroups - start - perPage, 0),
          perPage
        );
        req.reply({
          body: generateGroups(numToGen, start),
          headers: {
            page: page.toString(),
            "per-page": perPage.toString(),
            total: numberOfGroups.toString(),
            "total-pages": Math.ceil(numberOfGroups / perPage).toString(),
          },
        });
      }).as(name);
      return this;
    }

    listManyV2Namespace(args?: ListManyNamespacesArgs) {
      const { numberOfNamespaces = 50, name = "listV2Namespace" } = args ?? {};
      cy.intercept("GET", `/ui-server/api/data/namespaces?*`, (req) => {
        const page = (req.query["perPage"] as number) ?? 1;
        const perPage = (req.query["perPage"] as number) ?? 20;
        const start = (page - 1) * perPage;
        const numToGen = Math.min(
          Math.max(numberOfNamespaces - start - perPage, 0),
          perPage
        );
        req.reply({
          body: generateNamespaces(numToGen, start),
          headers: {
            page: page.toString(),
            "per-page": perPage.toString(),
            total: numberOfNamespaces.toString(),
            "total-pages": Math.ceil(numberOfNamespaces / perPage).toString(),
          },
        });
      }).as(name);
      return this;
    }

    listV2Group(args?: SimpleFixture) {
      const { fixture = "v2Group/list-v2Group.json", name = "listV2Group" } =
        args ?? {};
      const response = { fixture, delay: 2000 };
      cy.intercept("GET", `/ui-server/api/data/groups?*`, response).as(name);
      return this;
    }

    listV2Namespace(args?: SimpleFixture) {
      const {
        fixture = "v2Namespace/list-v2Namespace.json",
        name = "listV2Namespace",
      } = args ?? {};
      const response = { fixture, delay: 2000 };
      cy.intercept("GET", `/ui-server/api/data/namespaces?*`, response).as(
        name
      );
      return this;
    }

    listV2GroupMembers(args?: ListV2GroupMembersFixture) {
      const {
        fixture = "v2Group/list-v2Group-members.json",
        name = "listV2GroupMembers",
        groupSlug = "test-2-v2-group",
        removeUserId = null,
        addMember = null,
      } = args ?? {};
      cy.fixture(fixture).then((content) => {
        const result = content.filter(
          (memberWithRole) => memberWithRole.id !== removeUserId
        );
        if (addMember != null) result.push(addMember);
        const response = { body: result };
        cy.intercept(
          "GET",
          `/ui-server/api/data/groups/${groupSlug}/members`,
          response
        ).as(name);
      });
      return this;
    }

    patchV2GroupMember(args?: V2GroupDeleteMemberFixture) {
      const {
        fixture = "v2Group/list-v2Group-members.json",
        name = "patchV2GroupMembers",
        groupSlug = "test-2-v2-group",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/groups/${groupSlug}/members`,
        response
      ).as(name);
      return this;
    }

    postDeleteReadV2Group(args?: V2GroupDeleteFixture) {
      const { name = "postDeleteReadV2Group", groupSlug = "test-2-v2-group" } =
        args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `Group with slug ${groupSlug} does not exist.`,
          },
        },
        delay: 2000,
        statusCode: 404,
      };
      cy.intercept(
        "GET",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    readV2Group(args?: V2GroupArgs) {
      const {
        fixture = "v2Group/read-v2Group.json",
        name = "readV2Group",
        groupSlug = "test-2-v2-group",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    updateV2Group(args?: V2GroupArgs) {
      const {
        fixture = "v2Group/update-v2Group-metadata.json",
        name = "updateV2Group",
        groupSlug = "test-2-v2-group",
      } = args ?? {};
      const response = { fixture, delay: 2000 };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }
  };
}
