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

import { ERROR } from "dropzone";
import { CLOUD_STORAGE_OVERRIDE, CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "../components/cloudStorage/projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageConfiguration,
  CloudStorageCredential,
  CloudStorageProvider,
  CloudStorageSchema,
  CloudStorageType,
} from "../components/cloudStorage/projectCloudStorage.types";

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

  const providedSensitiveFields = getProvidedSensitiveFields(configuration);
  const credentialFieldDefinitions = sensitive_fields?.map((field) => ({
    ...field,
    requiredCredential: providedSensitiveFields.includes(field.name),
  }));

  return credentialFieldDefinitions;
}

export function getProvidedSensitiveFields(
  configuration: CloudStorageConfiguration["configuration"]
): string[] {
  return Object.entries(configuration)
    .filter(([, value]) => value === CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN)
    .map(([key]) => key);
}

export function getSchemaStorages(schemas: CloudStorageSchema[]): CloudStorageType[] | undefined {
  const storages = schemas.map((element) => {
    if (Object.keys(CLOUD_STORAGE_OVERRIDE.storages).includes(element.prefix)) {
      let override = CLOUD_STORAGE_OVERRIDE.storages[element.prefix];
      return {
        name: override["name"] ?? element.name,
        description: override["description"] ?? element.description,
        prefix: element.prefix,
        position: override?.position ?? 999
      };
    } else {
      return {
        name: element.name,
        description: element.description,
        prefix: element.prefix,
        position: 999
      };
    }
  });
  return storages.sort((a, b) => a.position - b.position);
}

export function getSchemaProviders(schemas: CloudStorageSchema[], storage_type: string): CloudStorageProvider[] | undefined {
  let storage = schemas.filter((s) => s.prefix == storage_type);
  debugger;
  if (storage.length != 1) {
    return undefined;
  }
  let provider_option = storage[0].options.filter((o) => o.name == "provider");
  if (provider_option.length != 1 || provider_option[0].examples == null || provider_option[0].examples.length == 0) {
    return undefined;
  }
  let provider_overrides: Record<string, Partial<CloudStorageProvider>> | undefined;
  if (Object.keys(CLOUD_STORAGE_OVERRIDE.storages).includes(storage_type)) {
    provider_overrides = CLOUD_STORAGE_OVERRIDE.storages[storage_type].providers;
  }
  return provider_option[0].examples.map((e) => {
    if (provider_overrides != undefined) {
      if (Object.keys(provider_overrides).includes(e.value)) {
        let override = provider_overrides[e.value];
        return {
          name: override.name ?? e.value,
          description: override.description ?? e.help,
          position: override.position ?? 999
        };
      }
    }
    return {
      name: e.value,
      description: e.help,
      position: 999
    }
  });
}
