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

import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "../projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageCredential,
} from "../projectCloudStorage.types";

export function parseCloudStorageConfiguration(
  formattedConfiguration: string
): Record<string, string> {
  // Parse lines of rclone configuration
  const configurationLineRegex = /^(?<key>[^=]+)=(?<value>.*)$/;

  const entries = formattedConfiguration.split("\n").flatMap((line) => {
    const match = line.match(configurationLineRegex);
    if (!match) {
      return [];
    }

    const key = match.groups?.["key"]?.trim() ?? "";
    const value = match.groups?.["value"]?.trim() ?? "";
    if (!key) {
      return [];
    }
    return [{ key, value }];
  });

  return entries.reduce(
    (obj, { key, value }) => ({ ...obj, [key]: value }),
    {}
  );
}

export function formatCloudStorageConfiguration({
  configuration,
  name,
}: {
  configuration: Record<string, string | undefined>;
  name: string;
}): string {
  const lines = Object.entries(configuration)
    .filter(([, value]) => value != null)
    .map(([key, value]) => `${key} = ${value}`)
    .join("\n");
  return `[${name}]\n${lines}\n`;
}

export function getCredentialFieldDefinitions(
  storageDefinition: CloudStorage
): CloudStorageCredential[] | undefined {
  const { sensitive_fields, storage } = storageDefinition;
  const { configuration } = storage;

  const providedSensitiveFields = Object.entries(configuration)
    .filter(([, value]) => value === CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN)
    .map(([key]) => key);
  const credentialFieldDefinitions = sensitive_fields?.map((field) => ({
    ...field,
    requiredCredential: providedSensitiveFields.includes(field.name),
  }));

  return credentialFieldDefinitions;
}
