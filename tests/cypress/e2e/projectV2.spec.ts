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

import fixtures from "../support/renkulab-fixtures";

describe("Add new v2 project", () => {
  const newProjectTitle = "new project";
  const slug = "new-project";

  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects();
    fixtures.createProjectV2().readProjectV2();
    cy.visit("/v2/projects/new");
  });

  it("create a new project", () => {
    cy.contains("New Project (V2)").should("be.visible");
    cy.getDataCy("project-name-input").clear().type(newProjectTitle);
    cy.getDataCy("project-slug-input").should("have.value", slug);
    cy.contains("button", "Set Visibility").click();
    cy.contains("button", "Add repositories").click();
    cy.getDataCy("project-add-repository").click();
    cy.getDataCy("project-repository-input-0")
      .clear()
      .type("https://domain.name/repo1.git");
    cy.contains("button", "Review").click();
    cy.contains("button", "Create").click();

    cy.contains("Creating project...").should("be.visible");
    cy.wait("@createProjectV2");
    cy.contains("Project created").should("be.visible");
  });

  it("prevents invalid input", () => {
    cy.contains("button", "Set Visibility").click();
    cy.contains("Please provide a name").should("be.visible");
    cy.getDataCy("project-name-input").clear().type(newProjectTitle);
    cy.getDataCy("project-slug-input").clear().type(newProjectTitle);
    cy.contains("button", "Set Visibility").click();
    cy.contains(
      "Please provide a slug consisting of lowercase letters, numbers, and hyphens."
    ).should("be.visible");
    cy.getDataCy("project-slug-input").clear().type(slug);
    cy.contains("button", "Set Visibility").click();

    cy.contains("Define access").should("be.visible");
    cy.getDataCy("project-visibility").select("Public");
    cy.contains("button", "Add repositories").click();

    cy.contains("button", "Review").click();
    cy.contains("button", "Back").click();
    cy.getDataCy("project-add-repository").click();
    cy.contains("button", "Review").click();
    cy.contains("Please provide a valid URL or remove the repository").should(
      "be.visible"
    );
    cy.getDataCy("project-repository-input-0")
      .clear()
      .type("https://domain.name/repo1.git");

    cy.contains("button", "Review").click();
    cy.contains(newProjectTitle).should("be.visible");
    cy.contains(slug).should("be.visible");
    cy.contains("public").should("be.visible");
    cy.contains("https://domain.name/repo1.git").should("be.visible");

    cy.contains("button", "Create").click();

    cy.contains("Creating project...").should("be.visible");
    cy.wait("@createProjectV2");
    cy.contains("Project created").should("be.visible");
  });
});

describe("Add new v2 project -- not logged in", () => {
  beforeEach(() => {
    fixtures.config().versions().userNone();
    cy.visit("/v2/projects/new");
  });

  it("create a new project", () => {
    cy.contains("Please log in to create a project").should("be.visible");
  });
});

describe("List v2 project", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().listProjectV2();
    cy.visit("/v2/projects");
  });

  it("list projects", () => {
    cy.contains("List Projects (V2)").should("be.visible");
  });

  it("list projects with pagination", () => {
    fixtures.listManyProjectV2();
    cy.wait("@listProjectV2");
    cy.contains("List Projects (V2)").should("be.visible");
    cy.get("ul.rk-search-pagination").should("be.visible");
  });

  it("shows projects", () => {
    fixtures.readProjectV2();
    cy.contains("List Projects (V2)").should("be.visible");
    cy.contains("test 2 v2-project").should("be.visible").click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
  });
});

describe("Edit v2 project", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().listProjectV2();
    cy.visit("/v2/projects");
  });

  it("changes project metadata", () => {
    fixtures.readProjectV2().updateProjectV2();
    cy.contains("List Projects (V2)").should("be.visible");
    cy.contains("test 2 v2-project").should("be.visible").click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
    cy.getDataCy("project-name-input").clear().type("new name");
    cy.getDataCy("project-description-input").clear().type("new description");
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-metadata.json",
      name: "readPostUpdate",
    });
    cy.get("button").contains("Update").should("be.visible").click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("new name").should("be.visible");
  });

  it("changes project repositories", () => {
    fixtures.readProjectV2().updateProjectV2({
      fixture: "projectV2/update-projectV2-repositories.json",
    });
    cy.contains("List Projects (V2)").should("be.visible");
    cy.contains("test 2 v2-project").should("be.visible").click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Repositories").should("be.visible").click();
    cy.getDataCy("project-add-repository").click();
    cy.getDataCy("project-repository-input-2")
      .clear()
      .type("https://domain.name/repo3.git");
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-repositories.json",
      name: "readPostUpdate",
    });
    cy.get("button").contains("Update").should("be.visible").click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("https://domain.name/repo3.git").should("be.visible");
  });

  it("changes project members", () => {
    const projectMemberToRemove = "user3-uuid";
    fixtures
      .deleteProjectV2Member({ memberId: projectMemberToRemove })
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
      .listProjectV2Members()
      .readProjectV2();
    cy.contains("List Projects (V2)").should("be.visible");
    cy.contains("test 2 v2-project").should("be.visible").click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Members").should("be.visible").click();
    cy.contains("user1@email.com").should("be.visible");
    cy.contains("user3-uuid").should("be.visible");
    fixtures
      .deleteProjectV2Member({ memberId: projectMemberToRemove })
      .listProjectV2Members({ removeMemberId: projectMemberToRemove });
    cy.getDataCy("delete-member-2").should("be.visible").click();
    cy.contains("user3-uuid").should("not.exist");
    cy.contains("Add").should("be.visible").click();
    cy.getDataCy("add-project-member-email").clear().type("foo@bar.com");
    cy.contains("Lookup").should("be.visible").click();
    cy.wait("@getExactUserSuccess");
    fixtures.patchProjectV2Member().listProjectV2Members({
      addMember: {
        member: { id: "foo-id", email: "foo@bar.com" },
        role: "member",
      },
      removeMemberId: projectMemberToRemove,
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

  it("deletes project", () => {
    fixtures.readProjectV2().deleteProjectV2();
    cy.contains("List Projects (V2)").should("be.visible");
    cy.contains("test 2 v2-project").should("be.visible").click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.contains("Edit Settings").should("be.visible").click();
    cy.get("button").contains("Metadata").should("be.visible").click();
    cy.get("button").contains("Delete").should("be.visible").click();
    cy.get("button")
      .contains("Yes, delete")
      .should("be.visible")
      .should("be.disabled");
    cy.contains("Please type test-2-v2-project").should("be.visible");
    cy.getDataCy("delete-confirmation-input").clear().type("test-2-v2-project");
    fixtures.postDeleteReadProjectV2();
    cy.get("button").contains("Yes, delete").should("be.enabled").click();
    cy.wait("@deleteProjectV2");
    cy.wait("@postDeleteReadProjectV2");

    fixtures.listProjectV2({
      fixture: "projectV2/list-projectV2-post-delete.json",
      name: "listProjectV2PostDelete",
    });
    cy.contains("Return to list").click();
  });
});
