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

import fixtures from "../support/renkulab-fixtures";

describe("Add new v2 group", () => {
  const newGroupName = "new group";
  const slug = "new-group";

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects();
    fixtures
      .createGroupV2()
      .readGroupV2({ groupSlug: slug })
      .readGroupV2Namespace({ groupSlug: slug });
    cy.visit("/v2/groups/new");
  });

  it("create a new group", () => {
    cy.contains("New Group").should("be.visible");
    cy.getDataCy("group-name-input").clear().type(newGroupName);
    cy.getDataCy("group-slug-input").should("have.value", slug);
    cy.contains("Create").click();
    cy.wait("@createGroupV2");
    cy.wait("@readGroupV2");
    cy.wait("@readGroupV2Namespace");
    cy.url().should("contain", `v2/groups/${slug}`);
    cy.contains("test 2 group-v2").should("be.visible");
  });
});

describe("Add new group -- not logged in", () => {
  beforeEach(() => {
    fixtures.config().versions().userNone();
    cy.visit("/v2/groups/new");
  });

  it("create a new group", () => {
    cy.contains("Please log in to create a group").should("be.visible");
  });
});

describe("List v2 groups", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().listManyGroupV2();
    cy.visit("/v2");
  });

  it("list groups", () => {
    cy.contains("Groups").should("be.visible");
    cy.contains("test 1 group-v2").should("exist");
    cy.getDataCy("dashboard-group-list")
      .find("a")
      .its("length")
      .should("eq", 5);
  });

  it("shows groups", () => {
    fixtures.readGroupV2().readGroupV2Namespace();
    cy.contains("Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
  });
});

describe("Edit v2 group", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: { id: "0945f006-e117-49b7-8966-4c0842146313" },
      })
      .namespaces();
    fixtures.projects().landingUserProjects().listGroupV2();
    cy.visit("/v2");
  });

  it("allows editing group metadata", () => {
    fixtures
      .readGroupV2()
      .readGroupV2Namespace()
      .listGroupV2Members()
      .updateGroupV2();
    cy.contains("Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit settings").should("be.visible").click();
    cy.getDataCy("group-name-input").clear().type("new name");
    cy.getDataCy("group-slug-input").clear().type("new-slug");
    cy.getDataCy("group-description-input").clear().type("new description");
    fixtures
      .readGroupV2({
        fixture: "groupV2/update-groupV2-metadata.json",
        groupSlug: "new-slug",
        name: "readPostUpdate",
      })
      .readGroupV2Namespace({
        fixture: "groupV2/update-groupV2-namespace.json",
        groupSlug: "new-slug",
        name: "readNamespacePostUpdate",
      });
    cy.get("button").contains("Update").should("be.visible").click();
    cy.wait("@updateGroupV2");
    cy.wait("@readPostUpdate");
    cy.wait("@readNamespacePostUpdate");
    cy.contains("new name").should("be.visible");
  });

  it("allows changing group members", () => {
    const groupMemberToRemove = "user3-uuid";
    fixtures
      .deleteGroupV2Member({ userId: groupMemberToRemove })
      .searchV2ListProjects({ numberOfProjects: 0, numberOfUsers: 5 })
      .listGroupV2Members()
      .readGroupV2()
      .readGroupV2Namespace();

    cy.contains("Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit settings").should("be.visible").click();
    cy.contains("@user1").should("be.visible");
    cy.contains("user3-uuid").should("be.visible");
    fixtures
      .deleteGroupV2Member({ userId: groupMemberToRemove })
      .listGroupV2Members({ removeUserId: groupMemberToRemove });
    cy.getDataCy("delete-member-2").should("be.visible").click();
    cy.contains("user3-uuid").should("not.exist");
    cy.get("[data-cy=group-add-member]").should("be.visible").click();
    cy.getDataCy("add-project-member").type("foo");
    cy.contains("Foo_1002").should("be.visible").click();
    fixtures.patchGroupV2Member().listGroupV2Members({
      addMember: {
        id: "id_1002",
        role: "member",
        first_name: "Foo_1002",
        last_name: "Bar_1002",
        namespace: "FooBar_1002",
      },
      removeUserId: groupMemberToRemove,
    });
    cy.get("button").contains("Add Member").should("be.visible").click();
    cy.contains("Foo_1002 Bar_1002").should("be.visible");

    cy.get("[data-cy=group-add-member]").should("be.visible").click();
    cy.getDataCy("add-project-member").type("noone");
    cy.contains("0 users found.").should("be.visible");
  });

  it("deletes group", () => {
    fixtures
      .readGroupV2()
      .readGroupV2Namespace()
      .listGroupV2Members()
      .deleteGroupV2();
    cy.contains("Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit settings").should("be.visible").click();
    cy.getDataCy("group-description-input").clear().type("new description");
    cy.get("button").contains("Delete").should("be.visible").click();
    cy.get("button")
      .contains("Yes, delete")
      .should("be.visible")
      .should("be.disabled");
    cy.contains("Please type test-2-group-v2").should("be.visible");
    cy.getDataCy("delete-confirmation-input").clear().type("test-2-group-v2");
    fixtures.postDeleteReadGroupV2();
    cy.get("button").contains("Yes, delete").should("be.enabled").click();
    cy.wait("@deleteGroupV2");
    cy.wait("@postDeleteReadGroupV2");

    fixtures.listGroupV2({
      fixture: "groupV2/list-groupV2-post-delete.json",
      name: "listGroupV2PostDelete",
    });
    cy.contains("Group with slug test-2-group-v2 does not exist");
    cy.contains("Return to the dashboard").click();
  });
});
