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

import type {
  RCloneOption,
  RCloneEntry,
  CloudStorageGet,
} from "./api/projectCloudStorage.api";

export interface CloudStorage
  extends Omit<CloudStorageGet, "sensitive_fields"> {
  sensitive_fields?: { name: string; help: string }[];
}

export type CloudStorageSensitiveFieldDefinition = Pick<
  RCloneOption,
  "name" | "help"
>;

export interface CloudStorageCredential
  extends CloudStorageSensitiveFieldDefinition {
  requiredCredential: boolean;
}

export type CloudStorageOptionTypes =
  | "string"
  | "boolean"
  | "number"
  | "secret";

type RCloneOptionExample = Exclude<RCloneOption["examples"], undefined>[0];
export interface CloudStorageSchemaOptionExample extends RCloneOptionExample {
  friendlyName?: string;
}

export interface CloudStorageSchemaOption extends RCloneOption {
  examples?: CloudStorageSchemaOptionExample[];
  datatype?: string;
  hide?: boolean | number;
  convertedType?: CloudStorageOptionTypes;
  convertedDefault?: number | string | boolean;
  convertedHide?: boolean;
  filteredExamples?: CloudStorageSchemaOptionExample[];
  friendlyName?: string;
  position?: number;
}

export interface CloudStorageSchema extends RCloneEntry {
  hide?: boolean;
  position?: number;
  convenientMode?: boolean; // ? Disables the Rclone full options list, ...
  readOnly?: boolean; // ? Forces read-only access e.g. for storage that do not support write access
  options: CloudStorageSchemaOption[];
}

export interface CloudStorageOverride extends CloudStorageSchema {
  providers: Record<string, Partial<CloudStorageProvider>>;
}

export interface CloudStorageProvider
  extends Pick<RCloneOption, "name" | "help"> {
  position?: number;
  friendlyName?: string;
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
  string | number | boolean | object | null
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
  convenientMode?: boolean;
};

export type AuxiliaryCommandStatus = "failure" | "none" | "success" | "trying";
