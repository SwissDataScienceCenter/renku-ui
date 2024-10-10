import { storageDefinitionFromConfig } from "./projectCloudStorage.utils";

describe("storageDefinitionFromConfig", () => {
  it("should return the correct storage definition", () => {
    const config = {
      active: true,
      dataConnector: {
        id: "ULID-1",
        etag: "foo",
        name: "example storage",
        namespace: "user1-uuid",
        slug: "example-storage",
        storage: {
          storage_type: "s3",
          configuration: {
            type: "s3",
            provider: "AWS",
            access_key_id: "<sensitive>",
            secret_access_key: "<sensitive>",
          },
          source_path: "bucket/my-source",
          target_path: "external_storage/aws",
          readonly: true,
          sensitive_fields: [
            {
              name: "access_key_id",
              help: "AWS Access Key ID.\n\nLeave blank for anonymous access or runtime credentials.",
              provider: "",
              default: "",
              default_str: "",
              required: false,
              sensitive: true,
              advanced: false,
              exclusive: false,
            },
            {
              name: "secret_access_key",
              help: "AWS Secret Access Key (password).\n\nLeave blank for anonymous access or runtime credentials.",
              provider: "",
              default: "",
              default_str: "",
              required: false,
              sensitive: true,
              advanced: false,
              exclusive: false,
            },
          ],
        },
        creation_date: "2023-11-15T09:55:59Z",
        created_by: "user1-uuid",
        visibility: "public" as const,
        description: "Example storage description",
      },
      sensitiveFieldDefinitions: [
        {
          friendlyName: "Access Key ID",
          help: "AWS Access Key ID.\n\nLeave blank for anonymous access or runtime credentials.",
          name: "access_key_id",
          value: "",
        },
        {
          friendlyName: "Secret Access Key (password)",
          help: "AWS Secret Access Key (password).\n\nLeave blank for anonymous access or runtime credentials.",
          name: "secret_access_key",
          value: "",
        },
      ],
      sensitiveFieldValues: {
        access_key_id: "access key",
        secret_access_key: "secret key",
      },
      saveCredentials: false,
      savedCredentialFields: [],
    };
    const result = storageDefinitionFromConfig(config, "1");
    expect(result).toEqual({
      configuration: {
        type: "s3",
        provider: "AWS",
        access_key_id: "access key",
        secret_access_key: "secret key",
      },
      name: "example-storage",
      project_id: "1",
      readonly: true,
      source_path: "bucket/my-source",
      storage_id: "ULID-1",
      storage_type: "s3",
      target_path: "external_storage/aws",
    });
  });
});
