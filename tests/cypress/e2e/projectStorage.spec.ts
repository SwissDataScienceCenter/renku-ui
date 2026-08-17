import fixtures from "../support/renkulab-fixtures";

const projectFullSlug = "user1-uuid/test-2-v2-project";

describe("Add project storage in a project page by project owner", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .getProjectV2Permissions()
      .listProjectV2Members()
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector();

    cy.visit(`/p/${projectFullSlug}`);
  });

  it("do not show add button if project is not in allow list", () => {
    fixtures
      .getProjectStorageAllow({ allowed: false })
      .listProjectStorage({ hasProjectStorage: false });

    cy.getDataCy("add-data-connector").click();
    cy.getDataCy("project-data-connector-connect-header").should("be.visible");
    cy.getDataCy("project-data-controller-mode-add-storage").should(
      "not.exist",
    );
  });

  it("show add button to project owner if project is in allow list and no project storage setup", () => {
    fixtures
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: false });

    cy.getDataCy("add-data-connector").click();
    cy.getDataCy("project-data-controller-mode-add-storage").should(
      "be.visible",
    );
  });

  it("do not show add button to project owner if project is in allow list and project storage already setup", () => {
    fixtures
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: true });

    cy.getDataCy("add-data-connector").click();
    cy.getDataCy("project-data-connector-connect-header").should("be.visible");
    cy.getDataCy("project-data-controller-mode-add-storage").should(
      "not.exist",
    );
  });
});

describe("Manage project storage in project page and side panel by project owner", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .getProjectV2Permissions()
      .listProjectV2Members()
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: true })
      .patchProjectStorage()
      .deleteProjectStorage();

    cy.visit(`/p/${projectFullSlug}`);
  });

  it("view project storage in project page and in the side panel", () => {
    cy.getDataCy("project-storage-item").should("be.visible");

    cy.getDataCy("project-storage-item").click();
    cy.getDataCy("project-storage-view").should("be.visible");
  });

  it("edit project storage in project page", () => {
    cy.getDataCy("project-storage-edit").click();
    cy.getDataCy("project-storage-body").should("be.visible");
    cy.getDataCy("project-storage-form-size-input").clear().type("5");
    cy.getDataCy("project-storage-form-mount-point-input")
      .clear()
      .type("test1");
    cy.getDataCy("project-storage-form-submit-button").click();
    cy.wait("@patchProjectStorage");
  });

  it("edit project storage in the side panel", () => {
    cy.getDataCy("project-storage-item").click();

    cy.get('div.float-end [data-cy="project-storage-edit"]').click();
    cy.getDataCy("project-storage-body").should("be.visible");
    cy.getDataCy("project-storage-form-size-input").clear().type("5");
    cy.getDataCy("project-storage-form-mount-point-input")
      .clear()
      .type("test2");
    cy.getDataCy("project-storage-form-submit-button").click();
    cy.wait("@patchProjectStorage");
  });

  it("delete project storage in project page", () => {
    cy.getDataCy("project-storage-menu-dropdown").click();
    cy.getDataCy("project-storage-delete").click();
    cy.getDataCy("project-storage-delete-confirm-button").should("be.visible");
    cy.getDataCy("project-storage-delete-confirm-button").click();
    cy.wait("@deleteProjectStorage");
  });

  it("delete project storage in the side panel", () => {
    cy.getDataCy("project-storage-item").click();
    cy.get('div.float-end [data-cy="project-storage-menu-dropdown"]').click();
    cy.get('div.dropdown-menu.show [data-cy="project-storage-delete"]').click();
    cy.getDataCy("project-storage-delete-confirm-button").should("be.visible");
    cy.getDataCy("project-storage-delete-confirm-button").click();
    cy.wait("@deleteProjectStorage");
  });
});

describe("View project storage for project editor / viewer", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .listProjectV2Members()
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: true });

    cy.visit(`/p/${projectFullSlug}`);
  });

  it("project editor can see project storage but cannot edit/delete", () => {
    fixtures.getProjectV2Permissions({
      fixture: "projectV2/projectV2-permissions-editor.json",
    });

    cy.getDataCy("project-storage-item").should("be.visible");
    cy.getDataCy("project-storage-edit").should("not.exist");
    cy.getDataCy("project-storage-menu-dropdown").should("not.exist");

    // Also check in the side panel
    cy.getDataCy("project-storage-item").click();
    cy.getDataCy("project-storage-view").should("be.visible");
    cy.get('div.float-end [data-cy="project-storage-edit"]').should(
      "not.exist",
    );
    cy.get('div.float-end [data-cy="project-storage-menu-dropdown"]').should(
      "not.exist",
    );
  });

  it("project viewer can see project storage but cannot edit/delete", () => {
    fixtures.getProjectV2Permissions({
      fixture: "projectV2/projectV2-permissions-viewer.json",
    });

    cy.getDataCy("project-storage-item").should("be.visible");
    cy.getDataCy("project-storage-edit").should("not.exist");
    cy.getDataCy("project-storage-menu-dropdown").should("not.exist");

    // Also check in the side panel
    cy.getDataCy("project-storage-item").click();
    cy.getDataCy("project-storage-view").should("be.visible");
    cy.get('div.float-end [data-cy="project-storage-edit"]').should(
      "not.exist",
    );
    cy.get('div.float-end [data-cy="project-storage-menu-dropdown"]').should(
      "not.exist",
    );
  });
});

describe("View project storage for public project when not logged in", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userNone()
      .getProjectV2Permissions({
        fixture: "projectV2/projectV2-permissions-viewer.json",
      })
      .listProjectV2Members()
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: true });

    cy.visit(`/p/${projectFullSlug}`);
  });

  it("can view project storage but cannot edit/delete", () => {
    cy.getDataCy("project-storage-item").should("be.visible");
    cy.getDataCy("project-storage-edit").should("not.exist");
    cy.getDataCy("project-storage-menu-dropdown").should("not.exist");

    // Also check in the side panel
    cy.getDataCy("project-storage-item").click();
    cy.getDataCy("project-storage-view").should("be.visible");
    cy.get('div.float-end [data-cy="project-storage-edit"]').should(
      "not.exist",
    );
    cy.get('div.float-end [data-cy="project-storage-menu-dropdown"]').should(
      "not.exist",
    );
  });
});
