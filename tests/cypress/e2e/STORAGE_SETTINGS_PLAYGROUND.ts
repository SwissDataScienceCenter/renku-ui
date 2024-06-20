import fixtures from "../support/renkulab-fixtures";

describe("Cloud storage settings page", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures
      .projects()
      .projectTest()
      .projectById()
      .getProjectKG()
      .projectLockStatus()
      .projectMigrationUpToDate()
      .sessionServersEmpty()
      .versions();
  });

  it("Storage settings page playground", () => {
    // Set up the mocked response for getting a storage schema.
    // ? The "getStorageSchema" method is defined in "renkulab-fixtures/cloudStorage.ts"
    // ? The default response is defined in "fixtures/cloudStorage/storage-schema.json"
    fixtures.getStorageSchema();

    // Set up the mocked response for getting the available list of storage .
    fixtures.cloudStorage();
    cy.visit("/projects/e2e/local-test-project/settings/storage");
  });
});
