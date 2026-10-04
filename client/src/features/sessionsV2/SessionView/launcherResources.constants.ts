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

import type {
  DataConnectorAccessPolicyName,
  RepositoryAccessPolicyName,
  SecretAccessPolicyName,
  SessionLauncherRepository,
} from "../api/sessionLaunchersV2.api";

export interface AccessPolicyOption<T extends string> {
  label: string;
  value: T;
}

export const REPOSITORY_ACCESS_OPTIONS: AccessPolicyOption<RepositoryAccessPolicyName>[] =
  [
    { value: "readWrite", label: "Read-Write" },
    { value: "readOnly", label: "Read-Only" },
    { value: "excluded", label: "Do not include" },
  ];

export const DATA_CONNECTOR_ACCESS_OPTIONS: AccessPolicyOption<DataConnectorAccessPolicyName>[] =
  [
    { value: "readWrite", label: "Read-Write" },
    { value: "readOnly", label: "Read-Only" },
    { value: "excluded", label: "Do not include" },
  ];

export const SECRET_ACCESS_OPTIONS: AccessPolicyOption<SecretAccessPolicyName>[] =
  [
    { value: "included", label: "Included" },
    { value: "excluded", label: "Do not include" },
  ];

export const DEFAULT_REPOSITORY_ACCESS_POLICY: RepositoryAccessPolicyName =
  "readWrite";

export function findSavedRepository(
  savedPolicies: SessionLauncherRepository[] | undefined,
  url: string,
  index: number,
): SessionLauncherRepository | undefined {
  return (
    savedPolicies?.find((entry) => entry.url === url) ??
    savedPolicies?.find((entry) => entry.repository_id === index)
  );
}

export function resolveRepositoryAccessPolicy(
  savedPolicy: RepositoryAccessPolicyName | undefined,
): RepositoryAccessPolicyName {
  return savedPolicy ?? DEFAULT_REPOSITORY_ACCESS_POLICY;
}

export function getRepositoryAccessPolicyLabel(
  policy: RepositoryAccessPolicyName,
): string {
  return (
    REPOSITORY_ACCESS_OPTIONS.find((option) => option.value === policy)
      ?.label ?? policy
  );
}

export const DEFAULT_SECRET_ACCESS_POLICY: SecretAccessPolicyName = "included";

export function resolveSecretAccessPolicy(
  savedPolicy: SecretAccessPolicyName | undefined,
): SecretAccessPolicyName {
  return savedPolicy ?? DEFAULT_SECRET_ACCESS_POLICY;
}

export function getSecretAccessPolicyLabel(
  policy: SecretAccessPolicyName,
): string {
  return (
    SECRET_ACCESS_OPTIONS.find((option) => option.value === policy)?.label ??
    policy
  );
}

export function getDefaultDataConnectorAccessPolicy(
  isStorageReadOnly: boolean,
): DataConnectorAccessPolicyName {
  return isStorageReadOnly ? "readOnly" : "readWrite";
}

export function resolveDataConnectorAccessPolicy(
  isStorageReadOnly: boolean,
  savedPolicy: DataConnectorAccessPolicyName | undefined,
): DataConnectorAccessPolicyName {
  const policy =
    savedPolicy ?? getDefaultDataConnectorAccessPolicy(isStorageReadOnly);
  if (isStorageReadOnly && policy === "readWrite") {
    return "readOnly";
  }
  return policy;
}

export function getDataConnectorAccessPolicyLabel(
  policy: DataConnectorAccessPolicyName,
): string {
  return (
    DATA_CONNECTOR_ACCESS_OPTIONS.find((option) => option.value === policy)
      ?.label ?? policy
  );
}

export const GIT_REFERENCE_PATTERN = /^refs\/(heads|tags)\/.+$/;
