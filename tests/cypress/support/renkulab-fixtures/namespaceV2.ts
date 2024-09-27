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
 * Fixtures for Renku 2.0 groups and namespaces
 */

interface ListManyGroupArgs extends NameOnlyFixture {
  numberOfGroups?: number;
}

interface ListGroupV2MembersFixture extends GroupV2Args {
  removeUserId?: string;
  addMember?: {
    id: string;
    role: string;
    first_name?: string;
    last_name?: string;
    namespace: string;
  };
}

interface GroupV2Args extends SimpleFixture {
  groupSlug?: string;
}

interface GroupV2DeleteFixture extends NameOnlyFixture {
  groupSlug?: string;
}

interface GroupV2DeleteMemberFixture extends GroupV2Args {
  userId?: string;
}
interface ListManyNamespacesArgs extends NameOnlyFixture {
  numberOfNamespaces?: number;
}

function generateGroups(numberOfGroups: number, start: number) {
  const groups = [];
  for (let i = 0; i < numberOfGroups; ++i) {
    const id = start + i;
    const slug = `test-${id}-group-v2`;
    const group = {
      id,
      name: `test ${id} group-v2`,
      slug,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: "user1-uuid",
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
    const slug = `test-${id}-group-v2`;
    const group = {
      id,
      name: `test ${id} group-v2`,
      slug,
      creation_date: "2023-11-15T09:55:59Z",
      created_by: "user1-uuid",
      namespace_kind: "group",
    };
    groups.push(group);
  }
  return groups;
}

export function NamespaceV2<T extends FixturesConstructor>(Parent: T) {
  return class NamespaceV2Fixtures extends Parent {
    createGroupV2(args?: SimpleFixture) {
      const {
        fixture = "groupV2/create-groupV2.json",
        name = "createGroupV2",
      } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept("POST", "/ui-server/api/data/groups", response).as(name);
      return this;
    }

    deleteGroupV2(args?: GroupV2DeleteFixture) {
      const { name = "deleteGroupV2", groupSlug = "test-2-group-v2" } =
        args ?? {};
      const response = { statusCode: 204 };
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    deleteGroupV2Member(args?: GroupV2DeleteMemberFixture) {
      const {
        fixture = "groupV2/list-groupV2-members.json",
        name = "deleteGroupV2Members",
        groupSlug = "test-2-group-v2",
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

    listManyGroupV2(args?: ListManyGroupArgs) {
      const { numberOfGroups = 50, name = "listGroupV2" } = args ?? {};
      cy.intercept("GET", `/ui-server/api/data/groups?*`, (req) => {
        const page = +req.query["page"] ?? 1;
        // TODO the request parameter is per_page, the result is per-page. These should be the same.
        const perPage = +req.query["per_page"] ?? 20;
        const totalPages = Math.ceil(numberOfGroups / perPage);
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
            "total-pages": totalPages.toString(),
          },
        });
      }).as(name);
      return this;
    }

    listManyNamespaceV2(args?: ListManyNamespacesArgs) {
      const { numberOfNamespaces = 50, name = "listNamespaceV2" } = args ?? {};
      cy.intercept("GET", `/ui-server/api/data/namespaces?*`, (req) => {
        const pageRaw = +req.query["page"];
        const page = isNaN(pageRaw) ? 1 : pageRaw;
        // TODO the request parameter is per_page, the result is per-page. These should be the same.
        const perPageRaw = +req.query["per_page"];
        const perPage = isNaN(pageRaw) ? 20 : perPageRaw;
        const start = (page - 1) * perPage;
        const totalPages = Math.ceil(numberOfNamespaces / perPage);
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
            "total-pages": totalPages.toString(),
          },
        });
      }).as(name);
      return this;
    }

    listGroupV2(args?: SimpleFixture) {
      const { fixture = "groupV2/list-groupV2.json", name = "listGroupV2" } =
        args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/ui-server/api/data/groups?*`, response).as(name);
      return this;
    }

    listNamespaceV2(args?: SimpleFixture) {
      const {
        fixture = "namespaceV2/list-namespaceV2.json",
        name = "listNamespaceV2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", `/ui-server/api/data/namespaces?*`, response).as(
        name
      );
      return this;
    }

    listGroupV2Members(args?: ListGroupV2MembersFixture) {
      const {
        fixture = "groupV2/list-groupV2-members.json",
        name = "listGroupV2Members",
        groupSlug = "test-2-group-v2",
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

    patchGroupV2Member(args?: GroupV2DeleteMemberFixture) {
      const {
        fixture = "groupV2/list-groupV2-members.json",
        name = "patchGroupV2Members",
        groupSlug = "test-2-group-v2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/groups/${groupSlug}/members`,
        response
      ).as(name);
      return this;
    }

    postDeleteReadGroupV2(args?: GroupV2DeleteFixture) {
      const { name = "postDeleteReadGroupV2", groupSlug = "test-2-group-v2" } =
        args ?? {};
      const response = {
        body: {
          error: {
            code: 1404,
            message: `Group with slug ${groupSlug} does not exist.`,
          },
        },
        statusCode: 404,
      };
      cy.intercept(
        "GET",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    readGroupV2(args?: GroupV2Args) {
      const {
        fixture = "groupV2/read-groupV2.json",
        name = "readGroupV2",
        groupSlug = "test-2-group-v2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    readGroupV2Namespace(args?: GroupV2Args) {
      const {
        fixture = "groupV2/read-groupV2-namespace.json",
        name = "readGroupV2Namespace",
        groupSlug = "test-2-group-v2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/namespaces/${groupSlug}`,
        response
      ).as(name);
      return this;
    }

    updateGroupV2(args?: GroupV2Args) {
      const {
        fixture = "groupV2/update-groupV2-metadata.json",
        name = "updateGroupV2",
        groupSlug = "test-2-group-v2",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "PATCH",
        `/ui-server/api/data/groups/${groupSlug}`,
        response
      ).as(name);
      return this;
    }
  };
}
