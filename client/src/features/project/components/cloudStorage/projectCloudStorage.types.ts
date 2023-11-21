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

export interface CloudStorage {
  storage: CloudStorageConfiguration;
  sensitive_fields?: CloudStorageSensitiveFieldDefinition[];
}

export interface CloudStorageConfiguration {
  configuration: Record<string, string | undefined>;
  name: string;
  private: boolean;
  project_id: string;
  readonly: boolean;
  source_path: string;
  storage_id: string;
  storage_type: string;
  target_path: string;
}

export interface CloudStorageSensitiveFieldDefinition {
  help: string;
  name: string;
}

export interface CloudStorageCredential
  extends CloudStorageSensitiveFieldDefinition {
  requiredCredential: boolean;
}

export interface GetCloudStorageForProjectParams {
  project_id: string;
}

export type AddCloudStorageForProjectParams =
  | AdvancedAddCloudStorageForProjectParams
  | SimpleAddCloudStorageForProjectParams;

export interface AdvancedAddCloudStorageForProjectParams {
  configuration: Record<string, string | undefined>;
  name: string;
  private: boolean;
  project_id: string;
  readonly: boolean;
  source_path: string;
  target_path: string;
}

export interface SimpleAddCloudStorageForProjectParams {
  name: string;
  private: boolean;
  project_id: string;
  readonly: boolean;
  storage_url: string;
  target_path: string;
}

export interface UpdateCloudStorageParams {
  configuration?: Record<string, string | null | undefined>;
  name?: string;
  private?: boolean;
  project_id: string;
  readonly?: boolean;
  storage_id: string;
  source_path?: string;
  target_path?: string;
}

export interface DeleteCloudStorageParams {
  project_id: string;
  storage_id: string;
}

export interface ValidateCloudStorageConfigurationParams {
  configuration: Record<string, string | undefined>;
}
