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

import type { ProviderKind } from "../connectedServices/api/connectedServices.api";
import type {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageOverride,
  CloudStorageSchemaOption,
} from "./projectCloudStorage.types";

export const CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN = "<sensitive>";
export const CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE = "<saved secret>";
export const STORAGES_WITH_ACCESS_MODE = ["polybox", "switchDrive"];

export const CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER =
  "[example]\ntype = s3\nprovider = AWS\nregion = us-east-1";

export const CLOUD_STORAGE_OVERRIDE = {
  storage: {
    azureblob: {
      position: 2,
    },
    drive: {
      usesIntegration: true,
    },
    gcs: {
      hide: true,
    },
    dropbox: {
      usesIntegration: true,
    },
    // eslint-disable-next-line spellcheck/spell-checker
    onedrive: {
      hide: true,
    },
    s3: {
      description:
        "Amazon S3 Compliant Storage Providers including AWS, CloudFlare, DigitalOcean and many others",
      position: 1,
      providers: {
        AWS: {
          position: 1,
        },
      },
    },
    webdav: {
      name: "WebDAV",
      description: "WebDAV compatible services",
      position: 5,
    },
    polybox: {
      name: "PolyBox",
      description: "Online data storage service exclusively for ETH members",
      position: 3,
    },
    switchDrive: {
      name: "SwitchDrive",
      description: "Cloud storage service for the Swiss university community",
      position: 4,
    },
    openbis: {
      name: "openBIS",
      forceReadOnly: true,
      position: 6,
    },
  } as Record<string, Partial<CloudStorageOverride> | undefined>,
};

export const CLOUD_OPTIONS_OVERRIDE = {
  azureblob: {
    account: {
      friendlyName: "Account Name",
      help: "Set this to the Azure Storage Account Name in use. Leave blank to use SAS URL or Emulator, otherwise it needs to be set.",
    },
    client_certificate_path: { advanced: true },
    client_certificate_password: { advanced: true },
    env_auth: { hide: true },
    key: { friendlyName: "Shared Key" },
    sas_url: { advanced: true },
    tenant: { friendlyName: "Tenant ID", advanced: true },
    client_id: { friendlyName: "Client ID", advanced: true },
    client_secret: { friendlyName: "Client Secret", advanced: true },
  },
  s3: {
    env_auth: { hide: true }, // ? uses the ENV variables
    location_constraint: { hide: true }, // ? only for creating buckets
    acl: { advanced: true },
    server_side_encryption: { advanced: true },
    sse_kms_key_id: { advanced: true },
    storage_class: { advanced: true },
    access_key_id: { friendlyName: "Access Key ID" },
    secret_access_key: { friendlyName: "Secret Access Key (password)" },
    region: { friendlyName: "Region" },
    endpoint: {
      friendlyName: "Endpoint",
      help: "Endpoint for S3 API. You should leave this blank if you entered the region already.",
    },
  },
  polybox: {
    access: {
      examples: [
        {
          value: "personal",
          help: "Use Private to connect a folder that only you use",
          provider: "",
          friendlyName: "Personal",
        },
        {
          value: "shared",
          help: "To connect a folder you share with others, both personal & shared folders",
          provider: "",
          friendlyName: "Shared",
        },
      ],
    },
    bearer_token: { friendlyName: "Bearer Token", advanced: true },
    url: {
      friendlyName: "URL",
      help: "",
      advanced: true,
    },
    user: {
      friendlyName: "Username",
    },
    public_link: {
      friendlyName: "Public link",
      position: 1,
    },
    vendor: {
      hide: 1,
    },
    nextcloud_chunk_size: {
      hide: 1,
    },
  },
  switchDrive: {
    bearer_token: { friendlyName: "Bearer Token", advanced: true },
    url: {
      friendlyName: "URL",
      advanced: true,
    },
    user: {
      friendlyName: "Username",
    },
    public_link: {
      friendlyName: "Public link",
      position: 1,
    },
    vendor: { hide: true },
    nextcloud_chunk_size: {
      hide: true,
    },
  },
  webdav: {
    pass: {
      friendlyName: "Token (or password)",
      help: "This is the token to access the WebDAV service. Mind that providing the user's password directly here won't usually work.",
    },
    bearer_token: { friendlyName: "Bearer Token" },
    url: { friendlyName: "URL" },
    user: { friendlyName: "Username" },
    vendor: { advanced: true },
  },
  drive: {
    alternate_export: { advanced: true },
    scope: { advanced: true },
    service_account_file: { advanced: true },
  },
} as Record<
  string,
  Record<string, Partial<CloudStorageSchemaOption> | undefined> | undefined
>;

export const CLOUD_OPTIONS_PROVIDER_OVERRIDE = {
  polybox: {
    personal: {
      pass: {
        value: "",
        friendlyName: "Token (or password)",
        help: "For secure access to your SwitchDrive WebDAV shares, we recommend using an application token instead of your account password. To create one, open SwitchDrive, go to Settings > Security, and generate a new Application password",
      },
    },
    shared: {
      pass: {
        value: "",
        help: "If there is a password for the folder, enter that in the password field. Otherwise, leave it blank",
        friendlyName: "Password",
      },
    },
  },
  switchDrive: {
    personal: {
      pass: {
        value: "",
        help: "For secure access to your SwitchDrive WebDAV shares, we recommend using an application token instead of your account password. To create one, open SwitchDrive, go to Settings > Security, and generate a new Application password",
        friendlyName: "Token (or password)",
      },
    },
    shared: {
      pass: {
        value: "",
        help: "If there is a password for the folder, enter that in the password field. Otherwise, leave it blank",
        friendlyName: "Password",
      },
    },
  },
} as Record<
  string,
  | Record<
      string,
      Record<string, Partial<CloudStorageSchemaOption> | undefined> | undefined
    >
  | undefined
>;

export const CLOUD_STORAGE_MOUNT_PATH_HELP = {
  s3: {
    help:
      "For S3, this is usually your remote bucket name as specified in the cloud service you are using. " +
      "You can also mount a sub-folder by appending it to the bucket name with a slash, e.g. `my-bucket/sub-folder`.",
    placeholder: "remote-bucket-name/optional-sub-folder(s)",
    label: "Source path",
  },
  polybox: {
    help: "Specify a path to a sub folder to connect to. When left blank, the connection will be made to the default (root) folder.",
    placeholder: "'/' or 'optional-sub-folder(s)/'",
    label: "Sub path",
  },
  switchDrive: {
    help: "Specify a path to a sub folder to connect to. When left blank, the connection will be made to the default (root) folder.",
    placeholder: "'/' or 'optional-sub-folder(s)/'",
    label: "Sub path",
  },
  generic: {
    help:
      "You can leave this blank to mount the default root or specify a folder. Depending on the cloud storage " +
      "provider, you should be able to specify stub-folder if you wish.",
    placeholder: "'/' or 'optional-sub-folder(s)/'",
    label: "Source path",
  },
} as Record<
  string,
  Record<"help" | "placeholder" | "label", string> | undefined
> &
  Record<"generic", Record<"help" | "placeholder" | "label", string>>;

export const CLOUD_STORAGE_SCHEMA_SHORTLIST = [
  "s3",
  "polybox",
  "switchDrive",
  "webdav",
  "azureblob",
  "sftp",
  "openbis",
];

export const CLOUD_STORAGE_PROVIDERS_SHORTLIST = {
  s3: ["AWS", "GCS", "Switch"],
} as Record<string, string[] | undefined>;

export const CLOUD_STORAGE_TOTAL_STEPS = 3;

export const EMPTY_CLOUD_STORAGE_STATE: AddCloudStorageState = {
  step: 1,
  completedSteps: 0,
  advancedMode: false,
  showAllSchema: false,
  showAllProviders: false,
  showAllOptions: false,
  saveCredentials: true,
};

export const EMPTY_CLOUD_STORAGE_DETAILS: CloudStorageDetails = {
  schema: undefined,
  provider: undefined,
  options: undefined,
  name: undefined,
  sourcePath: undefined,
  mountPoint: undefined,
  readOnly: true,
};

export const CLOUD_STORAGE_INTEGRATION_KIND_MAP = {
  drive: "google",
  dropbox: "dropbox",
} as Record<string, ProviderKind | undefined>;
