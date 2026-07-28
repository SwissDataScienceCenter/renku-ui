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

import { shouldInterrupt } from "../ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type { GetRepositoriesApiResponse } from "../repositories/api/repositories.api";
import { storageSecretNameToFieldName } from "../secretsV2/secrets.utils";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

export function doesCloudStorageNeedCredentials(
  config: SessionStartDataConnectorConfiguration,
): boolean {
  if (!config.active || config.skip) {
    return false;
  }

  const sensitiveFields = Object.keys(config.sensitiveFieldValues);
  const credentialFieldDict = config.savedCredentialFields
    ? Object.fromEntries(
        config.savedCredentialFields?.map((field) => [
          storageSecretNameToFieldName({ name: field }),
          true,
        ]),
      )
    : {};
  if (sensitiveFields.every((key) => credentialFieldDict[key] != null)) {
    return false;
  }
  return Object.values(config.sensitiveFieldValues).some(
    (value) => value === "",
  );
}

export function shouldCloudStorageSaveCredentials(
  config: SessionStartDataConnectorConfiguration,
): boolean {
  return config.saveCredentials;
}

export function repositoriesNeedAttention(
  repositories: GetRepositoriesApiResponse[] | undefined,
  hasWritePermission: boolean,
): boolean {
  if (!repositories) {
    return false;
  }
  return repositories.some(
    (repo) =>
      repo.error ||
      (repo.data && shouldInterrupt(repo.data, hasWritePermission)),
  );
}

export function allSessionSecretsReady(
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null,
): boolean {
  if (!sessionSecretSlotsWithSecrets?.length) {
    return true;
  }
  return sessionSecretSlotsWithSecrets.every(({ secretId }) => secretId);
}

export function secretsNeedAttention(
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null,
): boolean {
  if (!sessionSecretSlotsWithSecrets?.length) {
    return false;
  }
  return !allSessionSecretsReady(sessionSecretSlotsWithSecrets);
}

export function dataConnectorsNeedCredentials(
  configs: SessionStartDataConnectorConfiguration[] | undefined,
): boolean {
  return configs?.some(doesCloudStorageNeedCredentials) ?? false;
}

export function dataConnectorsShouldSaveCredentials(
  configs: SessionStartDataConnectorConfiguration[] | undefined,
): boolean {
  return configs?.some(shouldCloudStorageSaveCredentials) ?? false;
}
