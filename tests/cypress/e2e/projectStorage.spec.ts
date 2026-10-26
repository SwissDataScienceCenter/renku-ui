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
  });

  it("do not show add button if project is not in allow list", () => {
    fixtures
      .getProjectStorageAllow({ allowed: false })
      .listProjectStorage({ hasProjectStorage: false });

    cy.visit(`/p/${projectFullSlug}`);
    cy.getDataCy("add-data-connector").click();
    cy.getDataCy("project-data-connector-connect-header").should("be.visible");
    cy.getDataCy("project-data-controller-mode-add-storage").should(
      "not.exist",
    );
  });

  it("show add button to project owner if project is in allow list and no project storage setup & add storage", () => {
    fixtures
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: false })
      .postProjectStorage();

    cy.visit(`/p/${projectFullSlug}`);
    cy.getDataCy("add-data-connector").click();
    cy.getDataCy("project-data-controller-mode-add-storage").should(
      "be.visible",
    );
    cy.getDataCy("project-data-controller-mode-add-storage").click();
    cy.getDataCy("project-storage-body").should("be.visible");
    cy.getDataCy("project-storage-form-size-input").clear().type("5");
    cy.getDataCy("project-storage-form-mount-point-input").clear().type("test");
    cy.getDataCy("project-storage-form-submit-button").click();
    cy.wait("@postProjectStorage");
    cy.getDataCy("project-storage-body").should("not.exist");
  });

  it("do not show add button to project owner if project is in allow list and project storage already setup", () => {
    fixtures
      .getProjectStorageAllow({ allowed: true })
      .listProjectStorage({ hasProjectStorage: true });

    cy.visit(`/p/${projectFullSlug}`);
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
    cy.getDataCy("project-storage-body").should("not.exist");
  });

  it("edit project storage in the side panel", () => {
    cy.getDataCy("project-storage-item").click();

    cy.getDataCy("project-storage-view").within(() => {
      cy.getDataCy("project-storage-edit").click();
    });
    cy.getDataCy("project-storage-body").should("be.visible");
    cy.getDataCy("project-storage-form-size-input").clear().type("5");
    cy.getDataCy("project-storage-form-mount-point-input")
      .clear()
      .type("test2");
    cy.getDataCy("project-storage-form-submit-button").click();
    cy.wait("@patchProjectStorage");
    cy.getDataCy("project-storage-body").should("not.exist");
  });

  it("delete project storage in project page", () => {
    cy.getDataCy("project-storage-menu-dropdown").click();
    cy.getDataCy("project-storage-delete").click();
    cy.getDataCy("project-storage-delete-confirm-button").should("be.visible");
    cy.getDataCy("project-storage-delete-confirm-button").click();
    cy.wait("@deleteProjectStorage");
    cy.getDataCy("project-storage-delete-confirm-button").should("not.exist");
  });

  it("delete project storage in the side panel", () => {
    cy.getDataCy("project-storage-item").click();
    cy.getDataCy("project-storage-view").within(() => {
      cy.getDataCy("project-storage-menu-dropdown").click();
      cy.getDataCy("project-storage-delete").click();
    });
    cy.getDataCy("project-storage-delete-confirm-button").should("be.visible");
    cy.getDataCy("project-storage-delete-confirm-button").click();
    cy.wait("@deleteProjectStorage");
    cy.getDataCy("project-storage-delete-confirm-button").should("not.exist");
    cy.getDataCy("project-storage-view").should("not.be.visible");
  });
});

function assertCannotEditOrDeleteProjectStorage() {
  cy.getDataCy("project-storage-item").should("be.visible");
  cy.getDataCy("project-storage-edit").should("not.exist");
  cy.getDataCy("project-storage-menu-dropdown").should("not.exist");

  // Also check in the side panel
  cy.getDataCy("project-storage-item").click();
  cy.getDataCy("project-storage-view").should("be.visible");
  cy.getDataCy("project-storage-view").within(() => {
    cy.getDataCy("project-storage-edit").should("not.exist");
    cy.getDataCy("project-storage-menu-dropdown").should("not.exist");
  });
}

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
  });

  [
    { role: "editor", fixture: "projectV2/projectV2-permissions-editor.json" },
    { role: "viewer", fixture: "projectV2/projectV2-permissions-viewer.json" },
  ].forEach(({ role, fixture }) => {
    it(`project ${role} can see project storage but cannot edit/delete`, () => {
      fixtures.getProjectV2Permissions({ fixture });
      cy.visit(`/p/${projectFullSlug}`);
      assertCannotEditOrDeleteProjectStorage();
    });
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
    assertCannotEditOrDeleteProjectStorage();
  });
});
