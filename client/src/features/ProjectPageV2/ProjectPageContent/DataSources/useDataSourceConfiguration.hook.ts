/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { useMemo } from "react";

import { CLOUD_OPTIONS_OVERRIDE } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import { useGetStorageSecretsByV2StorageIdQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import { RCloneOption } from "../../../projectsV2/api/storagesV2.api";
import type { CloudStorageGetRead } from "../../../projectsV2/api/storagesV2.api";

import type { SessionStartCloudStorageConfiguration } from "../../../sessionsV2/startSessionOptionsV2.types";

interface UseDataSourceConfigurationArgs {
  storages: CloudStorageGetRead[] | undefined;
}

export default function useDataSourceConfiguration({
  storages,
}: UseDataSourceConfigurationArgs) {
  const { data: storagesSecrets } = useGetStorageSecretsByV2StorageIdQuery({
    storageIds: storages?.map((s) => s.storage.storage_id) ?? [],
  });

  const cloudStorageConfigs = useMemo(
    () =>
      storages?.map((cloudStorage) => {
        const storageDefinition = cloudStorage.storage;
        const defSensitiveFieldsMap: Record<string, RCloneOption> = {};
        if (cloudStorage.sensitive_fields != null) {
          cloudStorage.sensitive_fields.forEach((f) => {
            if (f.name != null) defSensitiveFieldsMap[f.name] = f;
          });
        }
        const configSensitiveFields = Object.keys(
          storageDefinition.configuration
        ).filter((key) => defSensitiveFieldsMap[key] != null);

        const overrides =
          storageDefinition.storage_type != null
            ? CLOUD_OPTIONS_OVERRIDE[storageDefinition.storage_type]
            : undefined;

        const sensitiveFieldDefinitions = configSensitiveFields
          .filter((key) => defSensitiveFieldsMap[key].name != null)
          .map((key) => {
            const { help, name } = defSensitiveFieldsMap[key];
            return {
              help: overrides?.[key]?.help ?? help ?? "",
              friendlyName: overrides?.[key]?.friendlyName ?? name ?? key,
              name: name ?? key,
              value: "",
            };
          });

        const sensitiveFieldValues: SessionStartCloudStorageConfiguration["sensitiveFieldValues"] =
          {};
        configSensitiveFields.forEach((key) => {
          const { name } = defSensitiveFieldsMap[key];
          if (name == null) return;
          sensitiveFieldValues[name] = "";
        });
        const savedCredentialFields = storagesSecrets
          ? storagesSecrets[storageDefinition.storage_id].map((s) => s.name)
          : [];
        return {
          active: true,
          cloudStorage,
          sensitiveFieldDefinitions,
          sensitiveFieldValues,
          saveCredentials: false,
          savedCredentialFields,
        };
      }),
    [storages, storagesSecrets]
  );

  return {
    cloudStorageConfigs,
  };
}
