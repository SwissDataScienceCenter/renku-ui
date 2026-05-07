import fixtures from "../support/renkulab-fixtures";

describe("Set up data connectors from a project page", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .listNamespaceV2()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .getGroupV2Permissions()
      .getProjectV2Permissions()
      .listProjectV2Members();
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("create a simple data connector", () => {
    const projectFullFlug = "user1-uuid/test-2-v2-project";
    fixtures
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .testCloudStorage({ success: false })
      .postDataConnector({
        namespace: projectFullFlug,
        visibility: "public",
      })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" })
      .readProjectV2Namespace();
    cy.visit(`/p/${projectFullFlug}`);
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();

    // is polybox visible
    cy.getDataCy("data-storage-polybox")
      .contains("PolyBox")
      .should("be.visible");
    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Validate is shown well the label and the help for passwords in full list
    cy.get("#switch-storage-full-list").click();
    cy.get("label")
      .contains("sse_kms_key_id") // Find the label with the desired text
      .parent() // Go one node above (to the parent div)
      .should(
        "contain.text",
        "If using KMS ID you must provide the ARN of Key"
      );

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
    });

    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/test-2-v2-project/example-storage-without-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");
  });

  it("link a data connector", () => {
    fixtures
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getDataConnectorByNamespaceAndSlug()
      .postDataConnectorProjectLink({
        dataConnectorId: "01KMG56188ZXT9N2FJ4000000",
      })
      .searchContent({
        name: "matchAnyDataConnector",
        queryPartialString: "type:DataConnector",
      })
      .searchContent({
        fixture: "searchV2/search-DC-from-id.json",
        name: "matchSpecificNameDataConnector",
        queryPartialString: "user1-uuid/example-storage",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("data-connector-search-input").type(
      "user1-uuid/example-storage"
    );
    cy.getDataCy("data-connector-link-button").click();

    cy.wait("@postDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
    cy.getDataCy("data-connector-link-successful-badge").should("be.visible");
  });

  it("create and link a global data connector", () => {
    const doi = "doi:10.7910/DVN/DXH6FK";
    fixtures
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getDataConnectorByGlobalSlug()
      .postGlobalDataConnector({ doi })
      .postDataConnectorProjectLink({
        dataConnectorId: doi,
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("data-connector-search-input").type(doi);
    cy.getDataCy("data-connector-link-button").click();
    cy.wait("@postDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
    cy.getDataCy("data-connector-link-successful-badge").should("be.visible");
  });

  it("creates and link global data connector by URL", () => {
    const doi = "10.5281/zenodo.123456";
    fixtures
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .getDataConnectorByGlobalSlug()
      .postGlobalDataConnector({
        doi,
        fixture: "dataConnector/data-connector-global-2.json",
      })
      .postDataConnectorProjectLink({
        dataConnectorId: doi,
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("data-connector-search-input").type(
      "https://zenodo.org/records/123456"
    );
    cy.getDataCy("data-connector-link-button").click();
    cy.wait("@postDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
    cy.getDataCy("data-connector-link-successful-badge").should("be.visible");
  });

  it("unlink a data connector", () => {
    fixtures
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .listProjectDataConnectors()
      .getDataConnector()
      .deleteDataConnectorProjectLink();

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2WithoutDocumentation");
    cy.wait("@listProjectDataConnectors");

    cy.contains("example storage").should("be.visible").click();

    cy.getDataCy("data-connector-view")
      .find("[data-cy=data-connector-menu-dropdown]")
      .click();

    cy.getDataCy("data-connector-view")
      .find('[data-cy="data-connector-unlink"]')
      .should("be.visible")
      .click();

    cy.wait("@getProjectV2Permissions");
    cy.contains("Are you sure you want to unlink the data connector").should(
      "be.visible"
    );
    cy.getDataCy("delete-data-connector-modal-button")
      .should("be.enabled")
      .click();
    cy.wait("@deleteDataConnectorProjectLink");
    cy.wait("@listProjectDataConnectors");
  });

  it("unlink data connector not allowed", () => {
    fixtures
      .listProjectDataConnectors()
      .getDataConnector()
      .getProjectV2Permissions({
        fixture: "projectV2/projectV2-permissions-viewer.json",
      })
      .deleteDataConnectorProjectLinkNotAllowed();
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    cy.contains("example storage").should("be.visible").click();
    cy.getDataCy("data-connector-credentials").should("be.visible");
    cy.getDataCy("data-connector-unlink").should("not.exist");
  });

  it("should clear state after a data connector has been created", () => {
    fixtures
      .getDataConnectorPermissions()
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .testCloudStorage({ success: false })
      .postDataConnector({
        namespace: "user1-uuid/test-2-v2-project",
        visibility: "public",
      })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
    });

    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/test-2-v2-project/example-storage-without-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");

    // Start adding a second data connector, but cancel
    fixtures.postDataConnectorProjectLink({ shouldNotBeCalled: true });
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage 2");
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
    });
    cy.getDataCy("project-data-connector-connect-header")
      .find("button.btn-close[aria-label='Close']")
      .click();

    // Now edit a data connector
    fixtures
      .testCloudStorage({ success: true })
      .patchDataConnector({ namespace: "user1-uuid" })
      .patchDataConnectorSecrets({
        content: [],
        shouldNotBeCalled: true,
      });

    cy.contains("example storage").should("be.visible").click();

    cy.getDataCy("data-connector-view")
      .find('[data-cy="data-connector-edit"]')
      .should("be.visible")
      .click();

    // Fill out the details
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@patchDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/example-storage has been successfully updated."
    );
  });
});

describe("Data connector page", () => {
  const username = "user1-uuid";
  const dataConnectorSlug = "example-storage-without-credentials";

  beforeEach(() => {
    fixtures
      .readGenericNamespace()
      .listNamespaceV2()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username,
          email: "user1@email.com",
        },
      })
      .getUsersUser({ userName: username })
      .listProjectDataConnectors({
        fixture: "dataConnector/empty-list.json",
      })
      .listDataConnectors({
        fixture: "dataConnector/empty-list.json",
        namespace: username,
      })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .testCloudStorage({ success: false });
    fixtures.projects().landingUserProjects().readProjectV2();
  });

  it("Create a data connector from the user page and interact with it", () => {
    cy.visit(`/u/${username}`);

    // Add a data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    fixtures.postDataConnector({
      namespace: username,
      visibility: "public",
    });
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();

    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
      cy.getDataCy("data-controller-visibility-public-html").click();
      cy.get("#visibility")
        .children()
        .first()
        .should("have.value", "public")
        .should("be.checked");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    fixtures.listDataConnectors({
      fixture: "dataConnector/list-user1-uuid.json",
      namespace: username,
    });
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      `The data connector ${username}/${dataConnectorSlug} has been successfully added`
    );
    cy.getDataCy("data-connector-edit-close-button").click();

    // Open the data connector page
    fixtures.readGenericNamespace({
      name: "data-connector-no-credentials-namespace",
      fixture: "dataConnector/data-connector-user1-example-no-credentials.json",
      slug: `${username}/data_connectors/${dataConnectorSlug}`,
    });
    cy.getDataCy("data-connector-item")
      .should("have.length", 1)
      .and("contain.text", "example storage")
      .click();

    cy.getDataCy("data-connector-standalone-page-link").click();
    cy.wait("@data-connector-no-credentials-namespace");
    cy.url().should("include", `/d/${username}/${dataConnectorSlug}`);
    cy.getDataCy("data-connector-identifier").should(
      "contain.text",
      `${username}/${dataConnectorSlug}`
    );
  });

  it("Use the settings page", () => {
    fixtures
      .readGenericNamespace({
        name: "data-connector-no-credentials-namespace",
        fixture:
          "dataConnector/data-connector-user1-example-no-credentials.json",
        slug: `${username}/data_connectors/${dataConnectorSlug}`,
      })
      .getDataConnectorPermissions({
        dataConnectorId: "0945f006-e117-49b7-8966-4c0842146313",
      })
      .deleteDataConnector();

    // Go to the settings tab
    cy.visit(`/d/${username}/${dataConnectorSlug}`);
    cy.getDataCy("dataConnector-settings-link").click();

    // Open the modal to edit the data connector
    cy.getDataCy("data-connector-general-settings-update-button").click();
    cy.getDataCy("data-connector-edit-modal").should("be.visible");
    cy.getDataCy("data-connector-name-input").clear().type("new name");
    cy.getDataCy("data-connector-edit-update-button").click();

    // Delete the data connector
    cy.getDataCy("data-connector-delete-settings-button").click();
    cy.getDataCy("data-connector-edit-modal").should("be.visible");
    cy.getDataCy("delete-data-connector-modal-button").should("not.be.enabled");

    cy.getDataCy("delete-confirmation-input").type(dataConnectorSlug);
    cy.getDataCy("delete-data-connector-modal-button")
      .should("be.enabled")
      .click();

    cy.url().should("not.include", dataConnectorSlug);
  });
});

describe("Set up data connectors with credentials in project pages", () => {
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
      .projects()
      .landingUserProjects()
      .listNamespaceV2()
      .getProjectV2Permissions()
      .listProjectV2Members()
      .readProjectV2()
      .listProjectDataConnectors()
      .getDataConnector()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" });
  });

  it("set up data connector with failed connection test", () => {
    fixtures
      .testCloudStorage({ success: false })
      .postDataConnector({
        namespace: "user1-uuid/test-2-v2-project",
        visibility: "public",
      })
      .postDataConnectorProjectLink({
        dataConnectorId: "ULID-5",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    cy.wait("@getStorageSchema");
    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.contains("Error 1422").should("be.visible");
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
    });

    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/test-2-v2-project/example-storage-without-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");

    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );
  });

  it("set up data connector with credentials", () => {
    fixtures
      .testCloudStorage({ success: true })
      .postDataConnector({
        namespace: "user1-uuid/test-2-v2-project",
        visibility: "public",
      })
      .postDataConnectorProjectLink({ dataConnectorId: "ULID-5" })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-5",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@listProjectDataConnectors");

    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    // Pick a provider
    cy.wait("@getStorageSchema");
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.wait("@testCloudStorage");
    cy.contains("The connection to the storage works correctly.").should(
      "be.visible"
    );
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage with credentials");
      cy.get("#saveCredentials").should("be.checked");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.wait("@patchDataConnectorSecrets");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector user1-uuid/test-2-v2-project/example-storage-with-credentials has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "credentials were saved"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "project was linked"
    );

    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listProjectDataConnectors");

    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Credentials saved"
    );
    cy.getDataCy("data-connector-view-back-button").click();

    // Check that the state was reset
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("project-data-controller-mode-create").click();
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
  });
});

function openDataConnectorMenu() {
  cy.getDataCy("data-connector-view")
    .find('[data-cy="data-connector-edit"]')
    .parent()
    .find("[data-cy=data-connector-menu-dropdown]")
    .first()
    .click();
}

describe("Set up data connectors with credentials in group pages", () => {
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
      .listNamespaceV2()
      .landingUserProjects()
      .listGroupV2()
      .getGroupV2Permissions()
      .listGroupV2Members()
      .listProjectV2ByNamespace()
      .projects()
      .readGroupV2()
      .readGroupV2Namespace()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" });
  });

  it("shows information about credentials", () => {
    fixtures
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("data-connector-name").contains("private-storage-1").click();
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "private-storage-1"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );
    cy.getDataCy("data-connector-view-back-button").click();
  });

  it("create data connector after failed connection test", () => {
    fixtures
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: false })
      .postDataConnector({ namespace: "test-2-group-v2" })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button").contains("Skip").click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector test-2-group-v2/example-storage-without-credentials has been successfully added."
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listDataConnectors");
  });

  it("do not store credentials if there are none", () => {
    fixtures
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: true })
      .postDataConnector({ namespace: "test-2-group-v2" })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-Switch").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#endpoint").clear().type("https://s3-zh.os.switch.ch");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();
    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage without credentials");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    cy.wait("@postDataConnector");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector test-2-group-v2/example-storage-without-credentials has been successfully added."
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listDataConnectors");
  });

  it("resets validation state when content changes", () => {
    fixtures
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: true });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button")
      .contains("Test connection")
      .click();
    cy.getDataCy("test-data-connector-button").contains("Re-test");
    cy.getDataCy("add-data-connector-continue-button").contains("Continue");
    cy.get("#sourcePath").clear().type("foo");
    cy.getDataCy("test-data-connector-button").contains("Test connection");
  });

  it("create data connector with credentials", () => {
    fixtures
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .listDataConnectors({ namespace: "test-2-group-v2" })
      .testCloudStorage({ success: true })
      .postDataConnector({ namespace: "test-2-group-v2" })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-5",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    // add data connector
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.wait("@getStorageSchema");

    // Pick a provider
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
    cy.getDataCy("data-connector-edit-next-button").click();

    // Fill out the details
    cy.get("#sourcePath").type("bucket/my-source");
    cy.get("#access_key_id").type("access key");
    cy.get("#secret_access_key").type("secret key");
    cy.getDataCy("test-data-connector-button").click();
    cy.getDataCy("add-data-connector-continue-button")
      .contains("Continue")
      .click();

    cy.getDataCy("data-connector-edit-mount").within(() => {
      cy.get("#name").type("example storage");
      cy.get("#saveCredentials").should("be.checked");
    });
    cy.getDataCy("data-connector-edit-update-button").click();
    fixtures.dataConnectorSecrets({
      fixture: "dataConnector/data-connector-secrets.json",
      name: "getDataConnectorSecrets",
    });
    cy.wait("@postDataConnector");
    cy.wait("@patchDataConnectorSecrets");
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "The data connector test-2-group-v2/example-storage has been successfully added"
    );
    cy.getDataCy("data-connector-edit-body").should(
      "contain.text",
      "credentials were saved"
    );
    cy.getDataCy("data-connector-edit-close-button").click();
    cy.wait("@listDataConnectors");

    // Check that the state was reset
    cy.getDataCy("add-data-connector").should("be.visible").click();
    cy.getDataCy("data-storage-s3").click();
    cy.getDataCy("data-provider-AWS").click();
  });

  it("set credentials for a data connector", () => {
    fixtures
      .getDataConnectorPermissions()
      .listDataConnectors({
        fixture: "dataConnector/data-connector.json",
        namespace: "test-2-group-v2",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
        name: "getDataConnectorSecretsEmpty",
      });

    cy.visit("/g/test-2-group-v2");
    cy.wait(["@readGroupV2", "@listDataConnectors"]);
    // Credentials should not yet be stored
    cy.getDataCy("data-connector-item")
      .should("be.visible")
      .and("have.length.at.least", 1);
    cy.getDataCy("data-connector-name")
      .first()
      .contains("example storage")
      .click()
      .then(() => {
        cy.hash().should("include", "data-connector-");
        cy.getDataCy("data-connector-metadata-section").should("be.visible");
      });

    cy.wait("@getDataConnectorSecretsEmpty");
    cy.getDataCy("data-connector-title")
      .first()
      .should("contain.text", "example storage");

    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );

    // set credentials
    openDataConnectorMenu();
    cy.getDataCy("data-connector-view")
      .find('[data-cy="data-connector-credentials"]')
      .click();

    fixtures
      .testCloudStorage({ success: true })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-1",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
      });

    cy.getDataCy("data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("data-connector-credentials-modal")
      .contains("Test and Save")
      .click();

    cy.wait("@testCloudStorage");
    cy.wait("@patchDataConnectorSecrets");
    cy.wait("@getDataConnectorSecrets");

    // Credentials should be stored
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Credentials saved"
    );

    // edit data connector, without touching the credentials
    fixtures.getStorageSchema({
      fixture: "cloudStorage/storage-schema-s3.json",
    });
    openDataConnectorMenu();
    cy.getDataCy("data-connector-view")
      .find('[data-cy="data-connector-edit-connection"]')
      .click();

    cy.getDataCy("data-connector-edit-modal")
      .find("#access_key_id")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
    cy.getDataCy("data-connector-edit-modal")
      .find("#secret_access_key")
      .invoke("attr", "value")
      .should("eq", "<saved secret>");
  });

  it("clear credentials for a data connector", () => {
    fixtures
      .listDataConnectors({
        fixture: "dataConnector/data-connector.json",
        namespace: "test-2-group-v2",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-partial.json",
        name: "getDataConnectorSecrets",
      });
    cy.visit("/g/test-2-group-v2");
    cy.wait("@readGroupV2");
    cy.wait("@listDataConnectors");

    // Credentials should be stored
    cy.getDataCy("data-connector-name").contains("example storage").click();
    cy.wait("@getDataConnectorSecrets");
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Credentials saved"
    );

    // clear credentials
    cy.getDataCy("data-connector-view")
      .find('[data-cy="data-connector-credentials"]')
      .click();
    cy.getDataCy("data-connector-credentials-modal")
      .contains("The saved credentials for this data connector are incomplete")
      .should("be.visible");

    fixtures.deleteDataConnectorSecrets().dataConnectorSecrets({
      fixture: "dataConnector/data-connector-secrets-empty.json",
      name: "getDataConnectorSecrets2",
    });
    cy.getDataCy("data-connector-credentials-modal").contains("Clear").click();
    cy.wait("@deleteDataConnectorSecrets");
    cy.wait("@getDataConnectorSecrets2");

    // Credentials should be changed
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("access_key_id-value").should(
      "contain.text",
      "Requires credentials"
    );
  });

  describe("Set up multiple data connectors", () => {
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
        .listNamespaceV2()
        .landingUserProjects()
        .listGroupV2()
        .listGroupV2Members()
        .listProjectV2ByNamespace()
        .projects()
        .readGroupV2()
        .readGroupV2Namespace();
    });

    it("set up one data connector that succeeds, another with failed credentials", () => {
      fixtures
        .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
        .listDataConnectors({ namespace: "test-2-group-v2" })
        .testCloudStorage({ success: true })
        .postDataConnector({ namespace: "test-2-group-v2" })
        .patchDataConnectorSecrets({
          dataConnectorId: "ULID-5",
          content: [
            {
              name: "access_key_id",
              value: "access key",
            },
            {
              name: "secret_access_key",
              value: "secret key",
            },
          ],
        });
      cy.visit("/g/test-2-group-v2");
      cy.wait("@readGroupV2");
      // add data connector
      cy.getDataCy("add-data-connector").should("be.visible").click();
      cy.wait("@getStorageSchema");

      // Pick a provider
      cy.getDataCy("data-storage-s3").click();
      cy.getDataCy("data-provider-AWS").click();
      cy.getDataCy("data-connector-edit-next-button").click();

      // Fill out the details
      cy.get("#sourcePath").type("bucket/my-source");
      cy.get("#access_key_id").type("access key");
      cy.get("#secret_access_key").type("secret key");
      cy.getDataCy("test-data-connector-button").click();
      cy.getDataCy("add-data-connector-continue-button")
        .contains("Continue")
        .click();

      cy.wait("@listNamespaceV2");
      // eslint-disable-next-line max-nested-callbacks
      cy.getDataCy("data-connector-edit-mount").within(() => {
        cy.get("#name").type("example storage");
        cy.get("#saveCredentials").should("be.checked");
      });
      cy.getDataCy("data-connector-edit-update-button").click();
      fixtures.dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets.json",
        name: "getDataConnectorSecrets",
      });
      cy.wait("@postDataConnector");
      cy.wait("@patchDataConnectorSecrets");
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "The data connector test-2-group-v2/example-storage has been successfully added"
      );
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "credentials were saved"
      );
      cy.getDataCy("data-connector-edit-close-button").click();
      cy.wait("@listDataConnectors");

      fixtures.testCloudStorage({ success: false }).patchDataConnectorSecrets({
        content: [],
        // No call to postCloudStorageSecrets is expected
        shouldNotBeCalled: true,
      });
      cy.visit("/g/test-2-group-v2");
      cy.wait("@readGroupV2");
      // add data connector
      cy.getDataCy("add-data-connector").should("be.visible").click();
      cy.wait("@getStorageSchema");

      // Pick a provider
      cy.getDataCy("data-storage-s3").click();
      cy.getDataCy("data-provider-AWS").click();
      cy.getDataCy("data-connector-edit-next-button").click();

      // Fill out the details
      cy.get("#sourcePath").type("bucket/my-source");
      cy.get("#access_key_id").type("access key");
      cy.get("#secret_access_key").type("secret key");
      cy.getDataCy("test-data-connector-button").click();
      cy.getDataCy("add-data-connector-continue-button")
        .contains("Skip")
        .click();
      // eslint-disable-next-line max-nested-callbacks
      cy.getDataCy("data-connector-edit-mount").within(() => {
        cy.get("#name").type("example storage without credentials");
      });
      cy.getDataCy("data-connector-edit-update-button").click();
      cy.wait("@postDataConnector");
      cy.getDataCy("data-connector-edit-body").should(
        "contain.text",
        "The data connector test-2-group-v2/example-storage-without-credentials has been successfully added."
      );
      cy.getDataCy("data-connector-edit-close-button").click();
      cy.wait("@listDataConnectors");
    });
  });
});
