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
    fixtures.createProjectV2().listNamespaceV2().readProjectV2();
    cy.visit("/v2/projects/new");
  });

  it("create a new project", () => {
    cy.contains("New Project").should("be.visible");
    cy.getDataCy("project-name-input").clear().type(newProjectTitle);
    cy.getDataCy("project-slug-input").should("have.value", slug);
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions("project-namespace-input", "namespace-select")
      .first()
      .click(); // click on first option
    cy.contains("Set visibility").click();
    cy.contains("Add repositories").click();
    cy.getDataCy("project-add-repository").click();
    cy.getDataCy("project-repository-input-0")
      .clear()
      .type("https://domain.name/repo1.git");
    cy.contains("button", "Review").click();
    cy.contains("button", "Create").click();

    cy.wait("@createProjectV2");
    cy.location("pathname").should("eq", `/v2/projects/user1-uuid/${slug}`);
  });

  it("keeps namespace set after going back", () => {
    cy.contains("New Project").should("be.visible");
    cy.getDataCy("project-name-input").clear().type(newProjectTitle);
    cy.getDataCy("project-slug-input").should("have.value", slug);
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions("project-namespace-input", "namespace-select")
      .first()
      .click();
    cy.contains("user1-uuid").should("exist");
    cy.contains("Set visibility").click();
    cy.get("button").contains("Back").click();
    cy.contains("user1-uuid").should("exist");
  });

  it("prevents invalid input", () => {
    cy.contains("button", "Set visibility").click();
    cy.contains("Please provide a name").should("be.visible");
    cy.getDataCy("project-name-input").clear().type(newProjectTitle);
    cy.getDataCy("project-slug-input").clear().type(newProjectTitle);
    cy.contains("button", "Set visibility").click();
    cy.contains(
      "Please provide a slug consisting of lowercase letters, numbers, and hyphens."
    ).should("be.visible");
    cy.getDataCy("project-slug-input").clear().type(slug);
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions("project-namespace-input", "namespace-select")
      .first()
      .click();
    cy.contains("Set visibility").click();

    cy.contains("Define access").should("be.visible");
    cy.getDataCy("project-visibility-public").click();
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
    cy.wait("@createProjectV2");
    cy.location("pathname").should("eq", `/v2/projects/user1-uuid/${slug}`);
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

describe("Navigate to project", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("shows projects by namespace/slug", () => {
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
  });

  it("shows projects by project id", () => {
    fixtures.readProjectV2ById();
    cy.visit("/v2/projects/THEPROJECTULID26CHARACTERS");
    cy.wait("@readProjectV2ById");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.location("pathname").should("contain", "/user1-uuid/test-2-v2-project");
  });

  it("shows project members", () => {
    fixtures.listProjectV2Members().readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.contains("user 1").should("be.visible");
    cy.contains("user 3").should("be.visible");
  });

  it("show project information", () => {
    fixtures.readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description"
    );
    cy.getDataCy("project-info-card").contains("public");
    cy.getDataCy("project-info-card").contains("user1-uuid");
  });

  it("shows at most 5 members, owners first", () => {
    fixtures
      .listProjectV2Members({
        fixture: "projectV2/list-projectV2-members-many.json",
      })
      .readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.contains("User One").should("be.visible");
    cy.contains("User Two").should("be.visible");
    cy.contains("User Three").should("be.visible");
    cy.contains("User Four").should("be.visible");
    cy.contains("user5-uuid").should("not.exist");
    cy.contains("UserSix").should("be.visible");
    cy.contains("All members").should("be.visible").click();
    cy.contains("@user5").should("be.visible");
  });
});

describe("Edit v2 project", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          email: "user1@email.com",
        },
      })
      .namespaces()
      .listProjectV2Members()
      .projects()
      .landingUserProjects()
      .listProjectV2();
    cy.visit("/v2");
  });

  it("changes project metadata", () => {
    fixtures.readProjectV2().updateProjectV2().listNamespaceV2();
    cy.contains("Projects").should("be.visible");
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").should("be.visible").click();
    cy.getDataCy("project-name-input").clear().type("new name");
    cy.getDataCy("project-description-input").clear().type("new description");
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-metadata.json",
      name: "readPostUpdate",
    });
    cy.get("button").contains("Update project").should("be.visible").click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("The project has been successfully updated.").should(
      "be.visible"
    );
    cy.contains("new name").should("be.visible");
  });

  it("changes project namespace", () => {
    fixtures.readProjectV2().updateProjectV2().listManyNamespaceV2();
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").should("be.visible").click();
    // Fetch the second page of namespaces
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions("project-namespace-input", "namespace-select");
    cy.get("button").contains("Fetch more").click();
    // Need to click away so the dropdown option selection works
    cy.getDataCy("project-name-input").click();
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions("project-namespace-input", "namespace-select")
      // Pick an element from the second page of results
      .eq(25)
      .click();
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-metadata.json",
      name: "readPostUpdate",
      namespace: "test-25-group-v2",
    });
    cy.get("button").contains("Update project").should("be.visible").click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("new name").should("be.visible");
  });

  it("changes project repositories", () => {
    fixtures.readProjectV2().updateProjectV2({
      fixture: "projectV2/update-projectV2-repositories.json",
    });
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("add-code-repository").click();
    cy.contains("Connect an existing repository").click();
    cy.getDataCy("project-add-repository-url").type(
      "https://domain.name/repo3.git"
    );
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-repositories.json",
      name: "readPostUpdate",
    });
    cy.get("button")
      .contains("Add code repository")
      .should("be.visible")
      .click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("repo3").should("be.visible");
  });

  it("remove project members", () => {
    const projectMemberToRemove = "user3-uuid";
    fixtures.listProjectV2Members().readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("@user3").should("be.visible");
    fixtures
      .deleteProjectV2Member({ memberId: projectMemberToRemove })
      .listProjectV2Members({ removeMemberId: projectMemberToRemove });
    cy.getDataCy("project-member-actions-1")
      .find('[data-cy="button-with-menu-dropdown"]')
      .click();
    cy.getDataCy("project-member-actions-1").contains("Remove").click();
    cy.getDataCy("remove-member-form").should("be.visible");
    cy.contains("Remove member").should("be.visible").click();
    cy.getDataCy("remove-member-form").should("not.be.visible");
    cy.contains("@user3").should("not.exist");
  });

  it("adds project members", () => {
    fixtures
      .listProjectV2Members()
      .searchV2ListProjects({ numberOfProjects: 0, numberOfUsers: 5 })
      .readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("user 1").should("be.visible");

    cy.getDataCy("project-add-member").click();
    cy.getDataCy("add-project-member").type("foo");
    cy.contains("Foo_1001").should("be.visible").click();
    fixtures.patchProjectV2Member().listProjectV2Members({
      addMember: {
        id: "id_1001",
        role: "member",
        first_name: "Foo_1001",
        last_name: "Bar_1001",
        namespace: "FooBar_1001",
      },
    });
    cy.get("button").contains("Add Member").should("be.visible").click();
    cy.contains("@FooBar_1001").should("be.visible");
  });

  it("cannot add non-existent user", () => {
    fixtures
      .listProjectV2Members()
      .searchV2ListProjects({ numberOfProjects: 0, numberOfUsers: 5 })
      .readProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("user1").should("be.visible");

    // Try to add a user
    cy.getDataCy("project-add-member").click();
    cy.getDataCy("add-project-member").type("none");
    cy.contains("0 users found.").should("be.visible");
  });

  it("edits project members", () => {
    const projectMemberToEdit = "user3-uuid";
    fixtures
      .listProjectV2Members()
      .readProjectV2()
      .patchProjectV2Member({ memberId: projectMemberToEdit });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("@user3").should("be.visible");
    cy.getDataCy("project-member-edit-1").should("be.visible").click();
    cy.getDataCy("member-role").select("Viewer");
    fixtures.listProjectV2Members({
      removeMemberId: projectMemberToEdit,
      addMember: {
        id: projectMemberToEdit,
        role: "viewer",
        first_name: "Foo_1001",
        last_name: "Bar_1001",
        namespace: "FooBar_1001",
      },
    });
    cy.contains("button", "Change access").click();
  });

  it("cannot edit last owner", () => {
    const projectMemberToEdit = "user3-uuid";
    fixtures
      .listProjectV2Members()
      .readProjectV2()
      .patchProjectV2Member({ memberId: projectMemberToEdit });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("user 1").should("be.visible");
    cy.getDataCy("project-member-edit-0").should("be.disabled");
  });

  it("can edit when there are multiple owners", () => {
    const projectMemberToEdit = "user6-uuid";
    fixtures
      .listProjectV2Members({
        fixture: "projectV2/list-projectV2-members-many.json",
      })
      .readProjectV2()
      .patchProjectV2Member({ memberId: projectMemberToEdit });
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Members of the project").should("be.visible");
    cy.wait("@readProjectV2");
    cy.getDataCy("project-member-edit-0").should("be.enabled");
    cy.getDataCy("project-member-edit-1").should("be.enabled");
    cy.getDataCy("project-member-edit-1").should("be.visible").click();
    cy.getDataCy("member-role").select("Viewer");
    fixtures.listProjectV2Members({
      fixture: "projectV2/list-projectV2-members-many.json",
      removeMemberId: projectMemberToEdit,
      addMember: {
        id: projectMemberToEdit,
        role: "viewer",
        first_name: "Foo_1001",
        last_name: "Bar_1001",
        namespace: "FooBar_1001",
      },
    });
    cy.contains("button", "Change access").click();
  });

  it("deletes project", () => {
    fixtures.readProjectV2().deleteProjectV2();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project/settings");
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.get("button")
      .contains("Delete project")
      .should("be.visible")
      .should("be.disabled");
    cy.contains("Please type test-2-v2-project").should("be.visible");
    cy.getDataCy("delete-confirmation-input").clear().type("test-2-v2-project");
    fixtures.postDeleteReadProjectV2();
    cy.get("button").contains("Delete project").should("be.enabled").click();
    cy.wait("@deleteProjectV2");
    cy.wait("@postDeleteReadProjectV2");

    fixtures.listProjectV2({
      fixture: "projectV2/list-projectV2-post-delete.json",
      name: "listProjectV2PostDelete",
    });
    cy.contains("Projects");
    cy.contains("Project deleted").should("be.visible");
  });
});

describe("Editor cannot maintain members", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user3-uuid",
        },
      })
      .namespaces();
    fixtures
      .projects()
      .landingUserProjects()
      .listProjectV2()
      .readProjectV2()
      .listProjectV2Members()
      .listProjectDataConnectors()
      .getDataConnector();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("can change project metadata", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.getDataCy("project-settings-edit").should("be.visible").click();
    cy.contains("a", "Overview").click();
  });

  it("can change project components", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.wait("@listProjectV2Members");
    cy.wait("@getDataServicesUser");
    cy.getDataCy("add-session-launcher").should("be.visible");
    cy.getDataCy("add-data-connector").should("be.visible");
    cy.getDataCy("add-code-repository").should("be.visible");
  });

  it("cannot change project members except self", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.wait("@listProjectV2Members");
    cy.get("a[title='Settings']").click();
    cy.getDataCy("project-member-edit-2").should("be.disabled");
    // TODO: can edit self
    cy.getDataCy("project-member-remove-1").should("be.enabled");
  });
});

describe("Viewer cannot edit project", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user2-uuid",
        },
      })
      .namespaces();
    fixtures
      .projects()
      .landingUserProjects()
      .listProjectV2()
      .readProjectV2()
      .listProjectV2Members();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("cannot change project metadata", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.wait("@listProjectV2Members");
    cy.wait("@getDataServicesUser");
    cy.getDataCy("project-settings-edit").should("not.exist");
    cy.getDataCy("project-description-edit").should("not.exist");
    cy.get("a[title='Settings']").click();
    cy.getDataCy("project-member-edit-0").should("be.disabled");
  });

  it("cannot change project components", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.wait("@listProjectV2Members");
    cy.wait("@getDataServicesUser");
    cy.getDataCy("add-session-launcher").should("not.exist");
    cy.getDataCy("add-data-connector").should("not.exist");
    cy.getDataCy("add-code-repository").should("not.exist");
  });
});
