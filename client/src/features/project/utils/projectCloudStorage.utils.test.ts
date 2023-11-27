import { CloudStorageSchema } from "../components/cloudStorage/projectCloudStorage.types";
import { getSchemaOptions, getSchemaProviders, getSchemaStorages } from "./projectCloudStorage.utils";

const storage_schemas = [
  {
    "name": "alias",
    "description": "Alias for an existing remote",
    "prefix": "alias",
    "options": [
      {
        "name": "remote",
        "help": "Remote or path to alias.\n\nCan be \"myremote:path/to/dir\", \"myremote:bucket\", \"myremote:\" or \"/local/path\".",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": true,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": false,
        "default_str": "",
        "value_str": "",
        "type": "string"
      }
    ],
    "command_help": null,
    "aliases": null,
    "hide": false,
    "metadata_info": null
  },
  {
    "name": "azureblob",
    "description": "Microsoft Azure Blob Storage",
    "prefix": "azureblob",
    "options": [
      {
        "name": "account",
        "help": "Azure Storage Account Name.\n\nSet this to the Azure Storage Account Name in use.\n\nLeave blank to use SAS URL or Emulator, otherwise it needs to be set.\n\nIf this is blank and if env_auth is set it will be read from the\nenvironment variable `AZURE_STORAGE_ACCOUNT_NAME` if possible.\n",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": false,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },
    ],
    "command_help": null,
    "aliases": null,
    "hide": false,
    "metadata_info": null
  },
  {
    "name": "drive",
    "description": "Google Drive",
    "prefix": "drive",
    "options": [
      {
        "name": "client_id",
        "help": "Google Application Client Id\nSetting your own is recommended.\nSee https://rclone.org/drive/#making-your-own-client-id for how to create your own.\nIf you leave this blank, it will use an internal key which is low performance.",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": true,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },
      {
        "name": "client_secret",
        "help": "OAuth Client Secret.\n\nLeave blank normally.",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": true,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },
    ],
    "command_help": null,
    "aliases": null,
    "hide": false,
    "metadata_info": null
  },
  {
    "name": "s3",
    "description": "Amazon S3 Compliant Storage Providers including AWS, Alibaba, ArvanCloud, Ceph, China Mobile, Cloudflare, GCS, DigitalOcean, Dreamhost, Huawei OBS, IBM COS, IDrive e2, IONOS Cloud, Leviia, Liara, Lyve Cloud, Minio, Netease, Petabox, RackCorp, Scaleway, SeaweedFS, StackPath, Storj, Synology, Tencent COS, Qiniu and Wasabi",
    "prefix": "s3",
    "options": [
      {
        "name": "provider",
        "help": "Choose your S3 provider.",
        "provider": "",
        "default": "",
        "value": null,
        "examples": [
          {
            "value": "AWS",
            "help": "Amazon Web Services (AWS) S3",
            "provider": ""
          },
          {
            "value": "Alibaba",
            "help": "Alibaba Cloud Object Storage System (OSS) formerly Aliyun",
            "provider": ""
          },
          {
            "value": "Other",
            "help": "Any other S3 compatible provider",
            "provider": ""
          }
        ],
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": false,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },

      {
        "name": "access_key_id",
        "help": "AWS Access Key ID.\n\nLeave blank for anonymous access or runtime credentials.",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": true,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },
      {
        "name": "secret_access_key",
        "help": "AWS Secret Access Key (password).\n\nLeave blank for anonymous access or runtime credentials.",
        "provider": "",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": true,
        "default_str": "",
        "value_str": "",
        "type": "string"
      },

      {
        "name": "region",
        "help": "Region to connect to.",
        "provider": "AWS",
        "default": "",
        "value": null,
        "examples": null,
        "short_opt": "",
        "hide": 0,
        "required": false,
        "is_password": false,
        "no_prefix": false,
        "advanced": false,
        "exclusive": false,
        "sensitive": false,
        "default_str": "",
        "value_str": "",
        "type": "string"
      }
    ],
    "command_help": null,
    "aliases": null,
    "hide": false,
    "metadata_info": null
  },
] as CloudStorageSchema[];

describe("getSchemaStorages", () => {
  it("should get cloud storage types with overrides applied", () => {

    const expectedValues = [
      {
        description: "Amazon S3 Compliant Storage Providers including AWS, CloudFlare, DigitalOcean and many others",
        name: "s3",
        position: 1,
        prefix: "s3"
      }, {
        description: "Google Drive",
        name: "drive",
        position: 2,
        prefix: "drive"
      }, {
        description: "Alias for an existing remote",
        name: "alias",
        position: 999,
        prefix: "alias"
      }, {
        description: "Microsoft Azure Blob Storage",
        name: "azureblob",
        position: 999,
        prefix: "azureblob"
      }
    ];

    const textValues = getSchemaStorages(storage_schemas);
    expect(textValues).toEqual(expectedValues);
  });
});

describe("getSchemaProviders", () => {
  it("should get cloud storage providers", () => {
    const expectedValues = [

      {
        "description": "Amazon Web Services (AWS) S3",
        "name": "AWS",
        "position": 1,
      },
      {
        "description": "Alibaba Cloud Object Storage System (OSS) formerly Aliyun",
        "name": "Alibaba",
        "position": 999,
      },
      {
        "description": "Any other S3 compatible provider",
        "name": "Other",
        "position": 999,
      },];

    const textValues = getSchemaProviders(storage_schemas, "s3");
    expect(textValues).toEqual(expectedValues);
  });
});

describe("getSchemaOptions", () => {
  it("should return filtered schema options", () => {
      const expectedValues = [
        {
         "advanced": false,
         "default": "",
         "default_str": "",
         "examples": null,
         "exclusive": false,
         "help": "AWS Access Key ID.",
         "hide": 0,
         "is_password": false,
         "name": "access_key_id",
         "no_prefix": false,
         "provider": "",
         "required": false,
         "sensitive": true,
         "short_opt": "",
         "type": "string",
         "value": null,
         "value_str": "",
       },
        {
         "advanced": false,
         "default": "",
         "default_str": "",
         "examples": null,
         "exclusive": false,
         "help": "AWS Secret Access Key (password).",
         "hide": 0,
         "is_password": false,
         "name": "secret_access_key",
         "no_prefix": false,
         "provider": "",
         "required": false,
         "sensitive": true,
         "short_opt": "",
         "type": "string",
         "value": null,
         "value_str": "",
       },
        {
         "advanced": false,
         "default": "",
         "default_str": "",
         "examples": null,
         "exclusive": false,
         "help": "Region to connect to.",
         "hide": 0,
         "is_password": false,
         "name": "region",
         "no_prefix": false,
         "provider": "AWS",
         "required": false,
         "sensitive": false,
         "short_opt": "",
         "type": "string",
         "value": null,
         "value_str": "",
       }, 

    ];
    const textValues = getSchemaOptions(storage_schemas, "s3", "AWS");
    expect(textValues).toEqual(expectedValues);

  })
})
