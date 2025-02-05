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
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .namespaces()
      .projects()
      .listProjectV2Members()
      .getProjectV2Permissions()
      .landingUserProjects()
      .readProjectV2()
      .createProjectV2({
        slug,
        namespace: "user1-uuid",
      })
      .listNamespaceV2()
      .readProjectV2();
    cy.visit("/#create-project");
  });

  it("create a new project", () => {
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.getDataCy("project-settings-link").click();
    cy.getDataCy("navbar-new-entity").click();
    cy.getDataCy("navbar-project-new").click();

    cy.contains("Create a new project").should("be.visible");
    cy.getDataCy("new-project-modal").within(() => {
      cy.getDataCy("project-creation-form-project-name-input")
        .clear()
        .type(newProjectTitle);
      cy.getDataCy("project-slug-toggle").click();
      cy.getDataCy("project-slug-input").should("have.value", slug);
      cy.wait("@listNamespaceV2");
      cy.findReactSelectOptions(
        "project-creation-form-project-namespace-input",
        "namespace-select"
      )
        .first()
        .click();
      cy.contains("Visibility").click();
      cy.contains("button", "Create").click();
    });

    cy.wait("@createProjectV2");
    cy.location("pathname").should("eq", `/p/user1-uuid/${slug}`);
  });

  it("prevents invalid input", () => {
    cy.contains("Name").should("be.visible");
    cy.contains("Owner").should("be.visible");
    cy.contains("Visibility").should("be.visible");
    cy.contains("Description").should("be.visible");

    cy.getDataCy("project-slug-toggle").click();
    cy.getDataCy("project-creation-form-project-name-input")
      .clear()
      .type(newProjectTitle);
    cy.getDataCy("project-slug-input").clear().type(newProjectTitle);
    cy.getDataCy("project-create-button").click();
    cy.contains(
      "A valid slug can include lowercase letters, numbers, dots ('.'), hyphens ('-') and underscores ('_'), but must start with a letter or number and cannot end with '.git' or '.atom'."
    ).should("be.visible");

    cy.getDataCy("project-slug-input").clear().type(slug);
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions(
      "project-creation-form-project-namespace-input",
      "namespace-select"
    )
      .first()
      .click();
    cy.getDataCy("project-visibility-public").click();

    cy.contains("button", "Create").click();
    cy.wait("@createProjectV2");
    cy.location("pathname").should("eq", `/p/user1-uuid/${slug}`);
  });
});

describe("Add new v2 project -- not logged in", () => {
  beforeEach(() => {
    fixtures.config().versions().userNone();
    cy.visit("/user#create-project");
  });

  it("create a new project", () => {
    cy.contains("Only authenticated users can create new projects.").should(
      "be.visible"
    );
  });
});

describe("Navigate to project", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest().namespaces();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("shows projects by namespace/slug", () => {
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.contains("test 2 v2-project").should("be.visible");
  });

  it("shows projects by project id", () => {
    fixtures.readProjectV2ById();
    cy.visit("/p/THEPROJECTULID26CHARACTERS");
    cy.wait("@readProjectV2ById");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.location("pathname").should("contain", "/user1-uuid/test-2-v2-project");
  });

  it("shows project members", () => {
    fixtures.listProjectV2Members().readProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.contains("user 1").should("be.visible");
    cy.contains("user 3").should("be.visible");
  });

  it("show project information", () => {
    fixtures.readProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // check project data
    cy.getDataCy("project-name").should("contain.text", "test 2 v2-project");
    cy.getDataCy("project-description").should(
      "contain.text",
      "Project 2 description"
    );
    cy.getDataCy("project-info-card").contains("public");
    cy.getDataCy("project-info-card").contains("user1-uuid");
    cy.getDataCy("project-documentation-text").should("be.visible");
    cy.getDataCy("project-documentation-text")
      .contains(
        "A description of this project, supporting markdown and math symbols"
      )
      .should("be.visible");
    cy.getDataCy("project-documentation-edit").should("not.exist");
  });

  it("show project empty documentation", () => {
    fixtures.readProjectV2({
      overrides: {
        documentation: undefined,
      },
    });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    // check project data
    cy.getDataCy("project-documentation-text").should("be.visible");
    cy.getDataCy("project-documentation-text")
      .contains(
        "Describe your project, so others can understand what it does and how to use it."
      )
      .should("be.visible");
  });

  it("shows at most 5 members, owners first", () => {
    fixtures
      .listProjectV2Members({
        fixture: "projectV2/list-projectV2-members-many.json",
      })
      .readProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
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
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .namespaces()
      .getProjectV2Permissions()
      .listProjectV2Members()
      .projects()
      .landingUserProjects()
      .listProjectV2();
    cy.visit("/");
  });

  it("changes project metadata", () => {
    fixtures.readProjectV2().updateProjectV2().listNamespaceV2();
    cy.contains("My projects").should("be.visible");
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.get("a[title='Settings']").should("be.visible").click();
    cy.getDataCy("project-settings-form-project-name-input")
      .clear()
      .type("new name");
    cy.getDataCy("project-settings-form-project-description-input")
      .clear()
      .type("new description");
    cy.getDataCy("project-template").click();
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-metadata.json",
      name: "readPostUpdate",
    });
    cy.getDataCy("project-update-button").should("be.visible").click();
    cy.wait("@updateProjectV2");
    cy.wait("@readPostUpdate");
    cy.contains("The project has been successfully updated.").should(
      "be.visible"
    );
    cy.contains("new name").should("be.visible");
  });

  it("changes project documentation", () => {
    fixtures.readProjectV2().updateProjectV2().listNamespaceV2();
    cy.contains("My projects").should("be.visible");
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.getDataCy("project-documentation-edit").click();
    cy.getDataCy("project-documentation-modal-body")
      .contains(
        "A description of this project, supporting **markdown** and math symbols"
      )
      .should("be.visible");
    const newDescription =
      "# Heading\nA new description with **bold** and _italics_.";
    cy.getDataCy("project-documentation-modal-body")
      .find("#documentation-text-area")
      .click()
      .clear()
      .type(newDescription);
    cy.getDataCy("project-documentation-modal-body")
      .find("#documentation-text-area")
      .contains("A new description with **bold**")
      .should("be.visible");
    cy.getDataCy("documentation-display-mode-preview").click();
    cy.getDataCy("project-documentation-modal-body")
      .contains("A new description with bold")
      .should("be.visible");
    cy.getDataCy("project-documentation-modal-footer").contains("Save").click();
    cy.getDataCy("project-documentation-modal-body").should("not.be.visible");
  });

  it("changes project namespace", () => {
    fixtures
      .readProjectV2()
      .updateProjectV2()
      .listManyNamespaceV2()
      .readUserV2Namespace();
    cy.getDataCy("dashboard-project-list")
      .contains("a", "test 2 v2-project")
      .should("be.visible")
      .click();
    cy.wait("@readProjectV2");
    cy.contains("test 2 v2-project").should("be.visible");
    cy.get("a[title='Settings']").should("be.visible").click();
    // Fetch the second page of namespaces
    cy.wait("@listNamespaceV2");
    cy.wait("@readUserV2Namespace");
    cy.findReactSelectOptions(
      "project-settings-form-project-namespace-input",
      "namespace-select"
    );
    cy.get("button").contains("Fetch more").click();
    // Need to click away so the dropdown option selection works
    cy.getDataCy("project-settings-form-project-name-input").click();
    cy.wait("@listNamespaceV2");
    cy.findReactSelectOptions(
      "project-settings-form-project-namespace-input",
      "namespace-select"
    )
      // Pick an element from the second page of results
      .contains("test-25-group-v2")
      .click();
    fixtures.readProjectV2({
      fixture: "projectV2/update-projectV2-metadata.json",
      name: "readPostUpdate",
      namespace: "test-25-group-v2",
    });
    cy.getDataCy("project-update-button").should("be.visible").click();
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
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
    cy.contains("@user3").should("not.exist");
  });

  it("adds project members", () => {
    fixtures
      .listProjectV2Members()
      .searchV2ListProjects({ numberOfProjects: 0, numberOfUsers: 5 })
      .readProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
    cy.wait("@readProjectV2");
    cy.contains("@user3").should("be.visible");
    cy.getDataCy("project-member-edit-2").should("be.visible").click();
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings#members");
    cy.contains("Project Members").should("be.visible");
    cy.wait("@readProjectV2");
    cy.getDataCy("project-member-edit-0").should("be.enabled");
    cy.getDataCy("project-member-edit-1").should("be.enabled");
    cy.getDataCy("project-member-edit-0").should("be.visible").click();
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
    cy.visit("/p/user1-uuid/test-2-v2-project/settings");
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
    cy.contains("My projects");
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
          username: "user3",
        },
      })
      .namespaces();
    fixtures
      .projects()
      .landingUserProjects()
      .listProjectV2()
      .readProjectV2()
      .getProjectV2Permissions({
        fixture: "projectV2/projectV2-permissions-editor.json",
      })
      .listProjectV2Members()
      .listProjectDataConnectors()
      .getDataConnector();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("can change project metadata", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.get("a[title='Settings']").should("be.visible").click();
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
    cy.getDataCy("project-member-edit-2").should("not.exist");
    // TODO: can edit self
    cy.getDataCy("project-member-remove-2").should("be.enabled");
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
          username: "user2",
        },
      })
      .namespaces();
    fixtures
      .projects()
      .landingUserProjects()
      .listProjectV2()
      .readProjectV2()
      .getProjectV2Permissions({
        fixture: "projectV2/projectV2-permissions-viewer.json",
      })
      .listProjectV2Members();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("cannot change project metadata", () => {
    cy.contains("test 2 v2-project").should("be.visible");
    cy.wait("@listProjectV2Members");
    cy.wait("@getDataServicesUser");
    cy.getDataCy("project-settings-edit").should("not.exist");
    cy.getDataCy("project-description-edit").should("not.exist");
    cy.get("a[title='Settings']").click();
    cy.getDataCy("project-member-edit-0").should("not.exist");
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

describe("Project templates and copies", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .namespaces()
      .projects()
      .landingUserProjects()
      .readProjectV2();
  });

  it("copy a regular project with edit access", () => {
    fixtures.getProjectV2Permissions().listNamespaceV2().copyProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");

    cy.getDataCy("project-info-card")
      .find("[data-cy=button-with-menu-dropdown]")
      .click();
    cy.getDataCy("project-copy-menu-item").click();
    cy.contains("Make a copy of user1-uuid/test-2-v2-project").should(
      "be.visible"
    );
    cy.wait("@listNamespaceV2");
    cy.getDataCy("copy-modal")
      .find("[data-cy=project-copy-form-project-name-input]")
      .clear()
      .type("copy project name");
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    fixtures.readProjectV2({
      namespace: "e2e",
      projectSlug: "copy-project-name",
      name: "readProjectCopy",
    });
    cy.wait("@copyProjectV2");
    cy.contains("Go to new project").should("be.visible").click();
    cy.wait("@readProjectCopy");
    cy.location("pathname").should("eq", "/p/e2e/copy-project-name");
  });

  it("copy a regular project without edit access", () => {
    fixtures.listNamespaceV2().copyProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");

    cy.getDataCy("project-info-card")
      .find("[data-cy=button-with-menu-dropdown]")
      .click();
    cy.getDataCy("project-copy-menu-item").click();
    cy.contains("Make a copy of user1-uuid/test-2-v2-project").should(
      "be.visible"
    );
    cy.wait("@listNamespaceV2");
    cy.getDataCy("project-copy-form-project-name-input")
      .clear()
      .type("copy project name");
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    fixtures.readProjectV2({
      namespace: "e2e",
      projectSlug: "copy-project-name",
      name: "readProjectCopy",
    });
    cy.wait("@copyProjectV2");
    cy.contains("Go to new project").should("be.visible").click();
    cy.wait("@readProjectCopy");
    cy.location("pathname").should("eq", "/p/e2e/copy-project-name");
  });

  it("copy a template project", () => {
    fixtures
      .readProjectV2({ overrides: { is_template: true } })
      .listNamespaceV2()
      .copyProjectV2()
      .listProjectV2Copies({ count: 0, writeable: true });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.getDataCy("copy-project-button").click();
    cy.contains("Make a copy of user1-uuid/test-2-v2-project").should(
      "be.visible"
    );
    cy.wait("@listNamespaceV2");
    cy.getDataCy("project-copy-form-project-name-input")
      .clear()
      .type("copy project name");
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    fixtures.readProjectV2({
      namespace: "e2e",
      projectSlug: "copy-project-name",
      name: "readProjectCopy",
    });
    cy.wait("@copyProjectV2");
    cy.contains("Go to new project").should("be.visible").click();
    cy.wait("@readProjectCopy");
    cy.location("pathname").should("eq", "/p/e2e/copy-project-name");
  });

  it("navigate to a template project copy", () => {
    fixtures
      .readProjectV2({
        projectSlug: "test-2-v2-template",
        overrides: { is_template: true },
      })
      .listNamespaceV2()
      .copyProjectV2()
      .listProjectV2Copies({ count: 1, writeable: true });
    cy.visit("/p/user1-uuid/test-2-v2-template");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectV2Copies");
    cy.getDataCy("copy-project-button").should("not.exist");
    cy.contains(
      "You already have a project created from this template."
    ).should("be.visible");
    fixtures.readProjectV2({
      projectSlug: "test-2-v2-project",
      name: "readProjectCopy",
    });
    cy.contains("Go to my copy").should("be.visible").click();
    cy.wait("@readProjectCopy");
    cy.location("pathname").should("eq", "/p/user1-uuid/test-2-v2-project");
  });

  it("list template project copies", () => {
    fixtures
      .readProjectV2({
        projectSlug: "test-2-v2-template",
        overrides: { is_template: true },
      })
      .listNamespaceV2()
      .listProjectV2Copies({ writeable: true })
      .copyProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-template");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectV2Copies");
    cy.getDataCy("copy-project-button").should("not.exist");
    cy.contains("copies of this project.").should("be.visible");
    cy.contains("View my copies").should("be.visible").click();
    cy.contains("My copies of").should("be.visible");
  });

  it("copy a project with data-connector-error", () => {
    fixtures
      .readProjectV2({ overrides: { is_template: true } })
      .listNamespaceV2()
      .listProjectV2Copies({ count: 0, writeable: true })
      .copyProjectV2({ dataConnectorError: true });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.getDataCy("copy-project-button").click();
    cy.contains("Make a copy of user1-uuid/test-2-v2-project").should(
      "be.visible"
    );
    cy.wait("@listNamespaceV2");
    cy.getDataCy("project-copy-form-project-name-input")
      .clear()
      .type("copy project name");
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    fixtures.readProjectV2({
      namespace: "e2e",
      projectSlug: "copy-project-name",
      name: "readProjectCopy",
    });
    cy.wait("@copyProjectV2");
    cy.contains("not all data connectors were included")
      .should("be.visible")
      .click();
    cy.contains("Close").should("be.visible").click();
    cy.getDataCy("copy-project-button").click();
    cy.getDataCy("copy-modal")
      .find("button")
      .contains("Copy")
      .should("be.enabled");
  });

  it("copy a project, overriding the slug", () => {
    fixtures
      .readProjectV2({ overrides: { is_template: true } })
      .listNamespaceV2()
      .listProjectV2Copies({ count: 0, writeable: true })
      .copyProjectV2({ dataConnectorError: true, name: "copyProjectV2Fail" });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.getDataCy("copy-project-button").click();
    cy.contains("Make a copy of user1-uuid/test-2-v2-project").should(
      "be.visible"
    );
    cy.wait("@listNamespaceV2");
    cy.getDataCy("project-copy-form-project-name-input")
      .clear()
      .type("copy project name");
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    cy.wait("@copyProjectV2Fail");
    cy.get("button").contains("Configure").click();
    cy.getDataCy("project-copy-form-project-slug-input")
      .clear()
      .type("copy-of-test2");
    fixtures.copyProjectV2().readProjectV2({
      namespace: "e2e",
      projectSlug: "copy-of-test2",
      name: "readProjectCopy",
    });
    cy.getDataCy("copy-modal").find("button").contains("Copy").click();
    cy.wait("@copyProjectV2");
    cy.contains("Go to new project").should("be.visible").click();
    cy.wait("@readProjectCopy");
    cy.location("pathname").should("eq", "/p/e2e/copy-of-test2");
  });

  it("show a template project as editor", () => {
    fixtures
      .readProjectV2({ overrides: { is_template: true } })
      .getProjectV2Permissions()
      .listNamespaceV2()
      .listProjectV2Copies({ count: 15 });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getProjectV2Permissions");
    cy.wait("@listProjectV2Copies");
    cy.getDataCy("copy-project-button").should("not.exist");
    cy.contains("copies visible to you").should("be.visible");
    cy.getDataCy("list-copies-link").click();
    cy.contains("Projects copied from").should("be.visible");
  });

  it("show a copied project", () => {
    fixtures
      .readProjectV2({
        overrides: {
          template_id: "TEMPLATE-ULID",
        },
      })
      .readProjectV2ById({
        projectId: "TEMPLATE-ULID",
        overrides: {
          name: "template project",
          namespace: "user1-uuid",
          slug: "template-project",
        },
      })
      .readUserV2Namespace();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@readProjectV2ById");
    cy.contains("Copied from:").should("be.visible");
  });

  it("break the template link", () => {
    fixtures
      .readProjectV2({
        overrides: {
          template_id: "TEMPLATE-ULID",
        },
      })
      .getProjectV2Permissions()
      .listNamespaceV2()
      .copyProjectV2()
      .updateProjectV2();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");

    cy.get("a[title='Settings']").should("be.visible").click();
    cy.contains("Break template link").should("be.visible");
    cy.contains("Unlink project").should("be.disabled");
    cy.getDataCy("unlink-confirmation-input").clear().type("test-2-v2-project");
    cy.contains("Unlink project").should("be.enabled").click();
    cy.wait("@updateProjectV2");
  });
});

describe("Anonymous project copy experience", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userNone()
      .namespaces()
      .projects()
      .landingUserProjects()
      .readProjectV2();
  });

  it("copy as an anonymous user", () => {
    fixtures.readProjectV2({ overrides: { is_template: true } });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.contains("To make a copy, you must first log in.").should("be.visible");
  });
});
