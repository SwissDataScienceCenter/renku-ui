/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";

export function isStorageCredentialTested(
  config: DataConnectorConfiguration,
): boolean {
  if (!config.touched || config.skip) {
    return false;
  }
  const values = Object.values(config.sensitiveFieldValues);
  return values.length > 0 && values.every((value) => value !== "");
}

export function isStorageCredentialResolved(
  config: DataConnectorConfiguration,
): boolean {
  return config.skip || isStorageCredentialTested(config);
}

export function skippedStorageCredential(
  config: DataConnectorConfiguration,
): DataConnectorConfiguration {
  return { ...config, active: false, saveCredentials: false, skip: true };
}

export function storageCredentialList(
  otherConfigs: DataConnectorConfiguration[],
  credentialConfigs: DataConnectorConfiguration[],
): DataConnectorConfiguration[] {
  return [...otherConfigs, ...credentialConfigs];
}

export function applyStorageCredentialUpdate(
  configs: DataConnectorConfiguration[],
  id: string,
  nextConfig: DataConnectorConfiguration,
): DataConnectorConfiguration[] {
  if (
    configs.some(
      (config) =>
        config.dataConnector.id === id && isStorageCredentialTested(config),
    )
  ) {
    return configs;
  }
  let changed = false;
  const next = configs.map((config) => {
    if (config.dataConnector.id !== id) {
      return config;
    }
    changed = true;
    return nextConfig;
  });
  return changed ? next : configs;
}

export function applySkipUnfinishedStorageCredentials(
  configs: DataConnectorConfiguration[],
): DataConnectorConfiguration[] {
  let changed = false;
  const next = configs.map((config) => {
    if (isStorageCredentialTested(config) || config.skip) {
      return config;
    }
    changed = true;
    return skippedStorageCredential(config);
  });
  return changed ? next : configs;
}
