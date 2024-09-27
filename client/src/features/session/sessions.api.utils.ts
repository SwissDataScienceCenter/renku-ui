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

import { CloudStorageDetailsOptions } from "../project/components/cloudStorage/projectCloudStorage.types";
import { CloudStorageWithIdRead } from "../storagesV2/api/storagesV2.api";
import { SessionCloudStorage } from "./startSessionOptions.types";

export function convertCloudStorageForSessionApi(
  cloudStorage: SessionCloudStorage | CloudStorageWithIdRead
): {
  readonly: boolean;
  configuration: CloudStorageDetailsOptions;
  source_path: string;
  target_path: string;
} {
  const { configuration, readonly, source_path, storage_type, target_path } =
    cloudStorage;

  return {
    configuration: configuration.type
      ? configuration
      : { ...configuration, type: storage_type },
    readonly: readonly || false,
    source_path,
    target_path,
  };
}

export function convertCloudStorageForSessionV2Api(
  cloudStorage: SessionCloudStorage | CloudStorageWithIdRead
): {
  storage_id: string;
  configuration: CloudStorageDetailsOptions;
} {
  const { configuration: csConfiguration, storage_id } = cloudStorage;
  const configuration = { ...csConfiguration };
  // Remove fields that are not necessary for the session API
  if (configuration.type != null) {
    delete configuration.type;
  }
  if (configuration.provider != null) {
    delete configuration.provider;
  }
  return {
    storage_id,
    configuration,
  };
}
