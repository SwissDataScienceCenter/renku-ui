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
  SecretAccessPolicyName,
} from "../api/sessionLaunchersV2.api";

export interface AccessPolicyOption {
  label: string;
  value: DataConnectorAccessPolicyName | SecretAccessPolicyName;
}

export const DATA_CONNECTOR_ACCESS_OPTIONS: AccessPolicyOption[] = [
  { value: "readWrite", label: "Read-Write" },
  { value: "readOnly", label: "Read-Only" },
  { value: "excluded", label: "Excluded" },
];

export const SECRET_ACCESS_OPTIONS: AccessPolicyOption[] = [
  { value: "included", label: "Included" },
  { value: "excluded", label: "Excluded" },
];

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
