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
    fixtures.createV2Group().readV2Group();
    cy.visit("/v2/groups/new");
  });

  it("create a new group", () => {
    cy.contains("New Group").should("be.visible");
    cy.getDataCy("group-name-input").clear().type(newGroupName);
    cy.getDataCy("group-slug-input").should("have.value", slug);
    cy.contains("Create").click();

    cy.contains("Creating group...").should("be.visible");
    cy.wait("@createV2Group");
    cy.contains("Group created").should("be.visible");
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
    fixtures.projects().landingUserProjects().listManyV2Group();
    cy.visit("/v2/groups");
  });

  it("list groups", () => {
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 10 v2-group").should("not.exist");
    cy.get(".page-item").find("a").contains("2").click();
    cy.contains("test 10 v2-group").should("be.visible");
  });

  it("shows groups", () => {
    fixtures.readV2Group();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 v2-group").should("be.visible").click();
    cy.wait("@readV2Group");
    cy.contains("test 2 v2-group").should("be.visible");
  });
});

describe("Edit v2 group", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().listV2Group();
    cy.visit("/v2/groups");
  });

  it("allows editing group metadata", () => {
    fixtures.readV2Group().updateV2Group();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 v2-group").should("be.visible").click();
    cy.wait("@readV2Group");
    cy.contains("test 2 v2-group").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
    cy.getDataCy("group-name-input").clear().type("new name");
    cy.getDataCy("group-slug-input").clear().type("new-slug");
    cy.getDataCy("group-description-input").clear().type("new description");
    fixtures.readV2Group({
      fixture: "v2Group/update-v2Group-metadata.json",
      name: "readPostUpdate",
    });
    cy.get("button").contains("Update").should("be.visible").click();
    cy.wait("@updateV2Group");
    cy.wait("@readPostUpdate");
    cy.contains("new name").should("be.visible");
  });

  it("allows changing group members", () => {
    const groupMemberToRemove = "user3-uuid";
    fixtures
      .deleteV2GroupMember({ userId: groupMemberToRemove })
      .exactUser({
        name: "getExactUserSuccess",
        exactEmailQueryString: "foo%40bar.com",
        response: [
          {
            id: "user-id",
            email: "foo@bar.com",
            first_name: "Foo",
            last_name: "Bar",
          },
        ],
      })
      .exactUser({
        name: "getExactUserFail",
        exactEmailQueryString: "noone%40bar.com",
        response: [],
      })
      .listV2GroupMembers()
      .readV2Group();

    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 v2-group").should("be.visible").click();
    cy.wait("@readV2Group");
    cy.contains("test 2 v2-group").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Members").should("be.visible").click();
    cy.contains("user1@email.com").should("be.visible");
    cy.contains("user3-uuid").should("be.visible");
    fixtures
      .deleteV2GroupMember({ userId: groupMemberToRemove })
      .listV2GroupMembers({ removeUserId: groupMemberToRemove });
    cy.getDataCy("delete-member-2").should("be.visible").click();
    cy.contains("user3-uuid").should("not.exist");
    cy.contains("Add").should("be.visible").click();
    cy.getDataCy("add-project-member-email").clear().type("foo@bar.com");
    cy.contains("Lookup").should("be.visible").click();
    cy.wait("@getExactUserSuccess");
    fixtures.patchV2GroupMember().listV2GroupMembers({
      addMember: {
        id: "foo-id",
        email: "foo@bar.com",
        role: "member",
      },
      removeUserId: groupMemberToRemove,
    });
    cy.get("button").contains("Add Member").should("be.visible").click();
    cy.contains("foo@bar.com").should("be.visible");

    cy.contains("Add").should("be.visible").click();
    cy.getDataCy("add-project-member-email").clear().type("noone@bar.com");
    cy.contains("Lookup").should("be.visible").click();
    cy.wait("@getExactUserFail");
    cy.contains("No user found for noone@bar.com").should("be.visible");
    cy.getDataCy("user-lookup-close-button").should("be.visible").click();
  });

  it("deletes group", () => {
    fixtures.readV2Group().deleteV2Group();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 v2-group").should("be.visible").click();
    cy.wait("@readV2Group");
    cy.contains("test 2 v2-group").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
    cy.getDataCy("group-description-input").clear().type("new description");
    cy.get("button").contains("Delete").should("be.visible").click();
    cy.get("button")
      .contains("Yes, delete")
      .should("be.visible")
      .should("be.disabled");
    cy.contains("Please type test-2-v2-group").should("be.visible");
    cy.getDataCy("delete-confirmation-input").clear().type("test-2-v2-group");
    fixtures.postDeleteReadV2Group();
    cy.get("button").contains("Yes, delete").should("be.enabled").click();
    cy.wait("@deleteV2Group");
    cy.wait("@postDeleteReadV2Group");

    fixtures.listV2Group({
      fixture: "v2Group/list-v2Group-post-delete.json",
      name: "listV2GroupPostDelete",
    });
    cy.contains("Return to list").click();
  });
});
