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
    { value: "readOnly", label: "Read-Only" },
    { value: "excluded", label: "Do not include" },
  ];

// Mirror current session behavior until launcher resource GET is available
export const DEFAULT_REPOSITORY_ACCESS_POLICY: RepositoryAccessPolicyName =
  "readWrite";

export const DEFAULT_SECRET_ACCESS_POLICY: SecretAccessPolicyName = "readOnly";

export function getDefaultDataConnectorAccessPolicy(
  isStorageReadOnly: boolean,
): DataConnectorAccessPolicyName {
  return isStorageReadOnly ? "readOnly" : "readWrite";
}

export const GIT_REFERENCE_PATTERN = /^refs\/(heads|tags)\/.+$/;
