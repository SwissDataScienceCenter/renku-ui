import { storageDefinitionFromConfig } from "./projectCloudStorage.utils";

describe("storageDefinitionFromConfig", () => {
  it("should return the correct storage definition", () => {
    const config = {
      active: true,
      cloudStorage: {
        storage: {
          configuration: {
            type: "s3",
            provider: "AWS",
            access_key_id: "<sensitive>",
            secret_access_key: "<sensitive>",
          },
          name: "example-storage",
          project_id: "1",
          readonly: true,
          source_path: "bucket/my-source",
          storage_id: "2",
          storage_type: "s3",
          target_path: "external_storage/aws",
        },
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
      sensitiveFieldDefinitions: [
        {
          help: "AWS Access Key ID.\n\nLeave blank for anonymous access or runtime credentials.",
          name: "access_key_id",
          value: "",
        },
        {
          help: "AWS Secret Access Key (password).\n\nLeave blank for anonymous access or runtime credentials.",
          name: "secret_access_key",
          value: "",
        },
      ],
      sensitiveFieldValues: {
        access_key_id: "access key",
        secret_access_key: "secret key",
      },
    };
    const result = storageDefinitionFromConfig(config);
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
      storage_id: "2",
      storage_type: "s3",
      target_path: "external_storage/aws",
    });
  });
});
