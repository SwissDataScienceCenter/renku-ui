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
    fixtures.createGroupV2().readGroupV2({ groupSlug: slug });
    cy.visit("/v2/groups/new");
  });

  it("create a new group", () => {
    cy.contains("New Group").should("be.visible");
    cy.getDataCy("group-name-input").clear().type(newGroupName);
    cy.getDataCy("group-slug-input").should("have.value", slug);
    cy.contains("Create").click();
    cy.wait("@createGroupV2");
    cy.wait("@readGroupV2");
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
    cy.visit("/v2/groups");
  });

  it("list groups", () => {
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 10 group-v2").should("not.exist");
    cy.get(".page-item").find("a").contains("2").click();
    cy.contains("test 10 group-v2").should("be.visible");
  });

  it("shows groups", () => {
    fixtures.readGroupV2();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
  });
});

describe("Edit v2 group", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().listGroupV2();
    cy.visit("/v2/groups");
  });

  it("allows editing group metadata", () => {
    fixtures.readGroupV2().updateGroupV2();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
    cy.getDataCy("group-name-input").clear().type("new name");
    cy.getDataCy("group-slug-input").clear().type("new-slug");
    cy.getDataCy("group-description-input").clear().type("new description");
    fixtures.readGroupV2({
      fixture: "groupV2/update-groupV2-metadata.json",
      groupSlug: "new-slug",
      name: "readPostUpdate",
    });
    cy.get("button").contains("Update").should("be.visible").click();
    cy.wait("@updateGroupV2");
    cy.wait("@readPostUpdate");
    cy.contains("new name").should("be.visible");
  });

  it("allows changing group members", () => {
    const groupMemberToRemove = "user3-uuid";
    fixtures
      .deleteGroupV2Member({ userId: groupMemberToRemove })
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
      .listGroupV2Members()
      .readGroupV2();

    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Members").should("be.visible").click();
    cy.contains("user1@email.com").should("be.visible");
    cy.contains("user3-uuid").should("be.visible");
    fixtures
      .deleteGroupV2Member({ userId: groupMemberToRemove })
      .listGroupV2Members({ removeUserId: groupMemberToRemove });
    cy.getDataCy("delete-member-2").should("be.visible").click();
    cy.contains("user3-uuid").should("not.exist");
    cy.contains("Add").should("be.visible").click();
    cy.getDataCy("add-project-member-email").clear().type("foo@bar.com");
    cy.contains("Lookup").should("be.visible").click();
    cy.wait("@getExactUserSuccess");
    fixtures.patchGroupV2Member().listGroupV2Members({
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
    fixtures.readGroupV2().deleteGroupV2();
    cy.contains("List Groups").should("be.visible");
    cy.contains("test 2 group-v2").should("be.visible").click();
    cy.wait("@readGroupV2");
    cy.contains("test 2 group-v2").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
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
    cy.contains("return to groups list").click();
  });
});
