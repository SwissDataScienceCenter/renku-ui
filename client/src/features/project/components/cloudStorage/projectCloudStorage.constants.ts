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

import { CloudStorageOverride } from "./projectCloudStorage.types";
export const CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN = "<sensitive>";

export const CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER =
  "[example]\ntype = s3\nprovider = AWS\nregion = us-east-1";

export const CLOUD_STORAGE_OVERRIDE = {
  storages: {
    s3: {
      description: "Amazon S3 Compliant Storage Providers including AWS, CloudFlare, DigitalOcean and many others",
      position: 1,
      providers: {
        AWS: {
          position: 1
        },

      }
    },
    drive: {
      position: 2
    },
    webdav: {
      position: 3
    },
    azure: {
      position: 4
    }
  } as Record<string, Partial<CloudStorageOverride>>
};
