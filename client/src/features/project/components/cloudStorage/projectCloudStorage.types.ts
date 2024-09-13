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

import { DataServicesError } from "../../../dataServices/dataServices.types";

export interface CloudStorage {
  storage: CloudStorageConfiguration;
  sensitive_fields?: CloudStorageSensitiveFieldDefinition[];
}

export interface CloudStorageConfiguration {
  configuration: CloudStorageDetailsOptions;
  name: string;
  private: boolean;
  project_id: string;
  readonly: boolean;
  source_path: string;
  storage_id: string;
  storage_type: string; // This is duplicated in configuration.type
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

export interface AddCloudStorageForProjectParams {
  configuration?: CloudStorageDetailsOptions;
  name: string;
  private: boolean;
  project_id: string;
  readonly: boolean;
  source_path: string;
  target_path: string;
}

export interface UpdateCloudStorageParams {
  configuration?: CloudStorageDetailsOptions;
  name?: string;
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

export type CloudStorageOptionTypes =
  | "string"
  | "boolean"
  | "number"
  | "secret";

export type CloudStorageSchemaOptionExample = {
  value: string; // ? Potential value for the option
  help: string; // ? Help text for the _value_
  provider: string; // ? empty for "all providers"
};

export interface CloudStorageSchemaOptions {
  name: string;
  help: string;
  provider: string;
  default: number | string | boolean;
  default_str: string;
  value: null | number | string | boolean;
  examples: CloudStorageSchemaOptionExample[];
  required: boolean;
  ispassword: boolean; // eslint-disable-line spellcheck/spell-checker
  sensitive: boolean;
  advanced: boolean; // ? Only shown when advanced options are enabled
  exclusive: boolean; // ? Only one of the examples can be used when this is true
  datatype: string;
  type: string;
  hide: boolean | number;
  convertedType?: CloudStorageOptionTypes;
  convertedDefault?: number | string | boolean;
  convertedHide?: boolean;
  filteredExamples: CloudStorageSchemaOptionExample[];
  friendlyName?: string;
}

export interface CloudStorageSchema {
  name: string;
  description: string;
  hide?: boolean;
  prefix: string; // ? weird naming; it's the machine readable name
  position?: number;
  options: CloudStorageSchemaOptions[];
}

export interface CloudStorageOverride extends CloudStorageSchema {
  providers: Record<string, Partial<CloudStorageProvider>>;
}

export interface CloudStorageProvider {
  name: string;
  description: string;
  position?: number;
}

export type AddCloudStorageState = {
  step: number;
  completedSteps: number;
  advancedMode: boolean;
  showAllSchema: boolean;
  showAllProviders: boolean;
  showAllOptions: boolean;
  saveCredentials: boolean;
};

export type CloudStorageDetailsOptions = Record<
  string,
  string | number | boolean | object | null | undefined
>;

export type CloudStorageDetails = {
  storageId?: string;
  schema?: string;
  provider?: string;
  options?: CloudStorageDetailsOptions;
  name?: string;
  sourcePath?: string;
  mountPoint?: string;
  readOnly?: boolean;
};

export type CredentialSaveStatus = "failure" | "none" | "success" | "trying";

export interface TestCloudStorageConnectionParams {
  configuration: CloudStorageDetailsOptions;
  source_path: string;
}

export type TestCloudStorageConnectionResponse = DataServicesError | void;
