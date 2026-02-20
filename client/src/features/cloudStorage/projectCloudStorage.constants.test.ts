import {
  CLOUD_STORAGE_INTEGRATION_KIND_MAP,
  CLOUD_STORAGE_OVERRIDE,
} from "./projectCloudStorage.constants";

describe("CLOUD_STORAGE_INTEGRATION_KIND_MAP", () => {
  describe("should cover all storage types requiring a Renku integration", () => {
    const storageTypes = Object.keys(CLOUD_STORAGE_OVERRIDE["storage"]);
    const storagesWithIntegration = storageTypes.filter(
      (storageType) =>
        CLOUD_STORAGE_OVERRIDE["storage"][storageType]?.usesIntegration
    );
    for (const storageType of storagesWithIntegration) {
      it(`${storageType} should have a value`, () => {
        const mappedIntegrationKind =
          CLOUD_STORAGE_INTEGRATION_KIND_MAP[storageType];
        expect(mappedIntegrationKind).toBeDefined();
      });
    }
  });
  describe("should not map storage types not needing a Renku integration", () => {
    const storageTypes = Object.keys(CLOUD_STORAGE_INTEGRATION_KIND_MAP);
    for (const storageType of storageTypes) {
      it(`${storageType} should have the "usesIntegration" override set to "true"`, () => {
        const usesIntegration =
          CLOUD_STORAGE_OVERRIDE["storage"][storageType]?.usesIntegration;
        expect(usesIntegration).toBe(true);
      });
    }
  });
});
