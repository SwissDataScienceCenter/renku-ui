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

import {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageOverride,
  CloudStorageSchemaOptions,
} from "./projectCloudStorage.types";

export const CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN = "<sensitive>";

export const CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER =
  "[example]\ntype = s3\nprovider = AWS\nregion = us-east-1";

export const CLOUD_STORAGE_OVERRIDE = {
  storage: {
    azureblob: {
      position: 3,
    },
    drive: {
      hide: true,
    },
    gcs: {
      hide: true,
    },
    // eslint-disable-next-line spellcheck/spell-checker
    dropbox: {
      hide: true,
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
      position: 2,
    },
  } as Record<string, Partial<CloudStorageOverride>>,
};

export const CLOUD_OPTIONS_OVERRIDE = {
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
} as Record<string, Record<string, Partial<CloudStorageSchemaOptions>>>;

export const CLOUD_STORAGE_MOUNT_PATH_HELP = {
  s3: {
    help:
      "For S3, this is usually your remote bucket name as specified in the cloud service you are using. " +
      "You can also mount a sub-folder by appending it to the bucket name with a slash, e.g. `my-bucket/sub-folder`.",
    placeholder: "remote-bucket-name/optional-sub-folder(s)",
  },
  generic: {
    help:
      "You can leave this blank to mount the default root or specify a folder. Depending on the cloud storage " +
      "provider, you should be able to specify stub-folder if you wish.",
    placeholder: "'/' or 'optional-sub-folder(s)/'",
  },
} as Record<string, Record<"help" | "placeholder", string>>;

export const CLOUD_STORAGE_SCHEMA_SHORTLIST = ["s3", "webdav", "azureblob"];

export const CLOUD_STORAGE_PROVIDERS_SHORTLIST = {
  s3: ["AWS", "GCS", "Switch"],
} as Record<string, string[]>;

export const CLOUD_STORAGE_TOTAL_STEPS = 3;

export const EMPTY_CLOUD_STORAGE_STATE: AddCloudStorageState = {
  step: 1,
  completedSteps: 0,
  advancedMode: false,
  showAllSchema: false,
  showAllProviders: false,
  showAllOptions: false,
};

export const EMPTY_CLOUD_STORAGE_DETAILS: CloudStorageDetails = {
  schema: undefined,
  provider: undefined,
  options: undefined,
  name: undefined,
  sourcePath: undefined,
  mountPoint: undefined,
  readOnly: undefined,
};
