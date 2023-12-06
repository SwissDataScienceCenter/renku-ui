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

import {
  CLOUD_OPTIONS_OVERRIDE,
  CLOUD_STORAGE_MOUN_PATH_HELP,
  CLOUD_STORAGE_OVERRIDE,
  CLOUD_STORAGE_PROVIDERS_SHORTLIST,
  CLOUD_STORAGE_SCHEMA_SHORTLIST,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  EMPTY_CLOUD_STORAGE_DETAILS,
} from "../components/cloudStorage/projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageConfiguration,
  CloudStorageCredential,
  CloudStorageDetails,
  CloudStorageProvider,
  CloudStorageSchema,
  CloudStorageSchemaOptions,
} from "../components/cloudStorage/projectCloudStorage.types";

const LAST_POSITION = 1000;

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
  configuration: Record<string, string | number | boolean | undefined>;
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

export function getSchemaStorage(
  schema: CloudStorageSchema[],
  shortList = false,
  currentSchema?: string
): Partial<CloudStorageSchema>[] {
  const finalStorage = schema.reduce<Partial<CloudStorageSchema>[]>(
    (current, element) => {
      if (
        shortList &&
        !CLOUD_STORAGE_SCHEMA_SHORTLIST.includes(element.prefix) &&
        element.prefix !== currentSchema
      )
        return current;
      if (
        Object.keys(CLOUD_STORAGE_OVERRIDE.storage).includes(element.prefix)
      ) {
        const override = CLOUD_STORAGE_OVERRIDE.storage[element.prefix];
        current.push({
          name: override.name ?? element.name,
          description: override.description ?? element.description,
          prefix: element.prefix,
          position: override.position ?? element.position,
        });
      } else {
        current.push({
          name: element.name,
          description: element.description,
          prefix: element.prefix,
          position: element.position,
        });
      }
      return current;
    },
    []
  );

  return finalStorage.sort(
    (a, b) => (a.position ?? LAST_POSITION) - (b.position ?? LAST_POSITION)
  );
}

export function getSchemaProviders(
  schema: CloudStorageSchema[],
  shortList = false,
  targetSchema?: string,
  currentProvider?: string
): CloudStorageProvider[] | undefined {
  if (!targetSchema) return;
  const storage = schema.find((s) => s.prefix === targetSchema);
  if (!storage) return;
  const providers = storage.options.find((o) => o.name === "provider");
  if (!providers || !providers.examples || !providers.examples.length) return;

  const providerOverrides = Object.keys(
    CLOUD_STORAGE_OVERRIDE.storage
  ).includes(targetSchema)
    ? CLOUD_STORAGE_OVERRIDE.storage[targetSchema].providers
    : undefined;

  const finalProviders = providers.examples.reduce<
    CloudStorageProvider[] | undefined
  >((current, e) => {
    if (
      shortList &&
      CLOUD_STORAGE_PROVIDERS_SHORTLIST[targetSchema] &&
      !CLOUD_STORAGE_PROVIDERS_SHORTLIST[targetSchema].includes(e.value) &&
      e.value !== currentProvider
    )
      return current;
    if (providerOverrides && Object.keys(providerOverrides).includes(e.value)) {
      const override = providerOverrides[e.value];
      (current as CloudStorageProvider[]).push({
        name: override.name ?? e.value,
        description: override.description ?? e.help,
        position: override.position ?? undefined,
      });
    } else {
      (current as CloudStorageProvider[]).push({
        name: e.value,
        description: e.help,
        position: undefined,
      });
    }
    return current;
  }, []);

  if (!finalProviders) return;
  return finalProviders.sort(
    (a, b) => (a.position ?? LAST_POSITION) - (b.position ?? LAST_POSITION)
  );
}

export function hasProviderShortlist(targetProvider?: string): boolean {
  if (!targetProvider) return false;
  if (CLOUD_STORAGE_PROVIDERS_SHORTLIST[targetProvider]) return true;
  return false;
}

export function getSchemaOptions(
  schema: CloudStorageSchema[],
  shortList = false,
  targetSchema?: string,
  targetProvider?: string,
  flags = { override: true, convertType: true, filterHidden: true }
): CloudStorageSchemaOptions[] | undefined {
  if (!targetSchema) return;
  const storage = schema.find((s) => s.prefix === targetSchema);
  if (!storage) return;

  const optionsOverridden = flags.override
    ? storage.options.map((option) => {
        if (Object.keys(CLOUD_OPTIONS_OVERRIDE).includes(targetSchema)) {
          const override = CLOUD_OPTIONS_OVERRIDE[targetSchema][option.name]
            ? CLOUD_OPTIONS_OVERRIDE[targetSchema][option.name]
            : undefined;
          if (override) {
            return {
              ...option,
              ...override,
            };
          }
        }
        return option;
      })
    : storage.options;

  const optionsFiltered = optionsOverridden.filter((option) => {
    if (flags.filterHidden) {
      const shouldHide = !(
        option.hide === 0 ||
        option.hide === false ||
        option.hide == undefined
      )
        ? true
        : false;
      if (shouldHide) return false;
    }

    if (!option.name || option.name === "provider") {
      return false;
    }
    if (option.advanced && shortList) {
      return false;
    }
    if (option.provider.startsWith("!")) {
      if (!targetProvider) {
        return true;
      }
      const providers = option.provider.slice(1).split(",");
      return !providers.includes(targetProvider);
    }
    if (option.provider) {
      if (!targetProvider) {
        return false;
      }
      const providers = option.provider.split(",");
      return providers.includes(targetProvider);
    }
    return true;
  });

  if (!optionsFiltered.length) return;

  const convertedOptions = flags.convertType
    ? optionsFiltered.map((option) => {
        const convertedOption = { ...option };

        // make "hide" a boolean
        convertedOption.convertedHide = !(
          option.hide === 0 ||
          option.hide === false ||
          option.hide == undefined
        )
          ? true
          : false;

        // try to infer the type
        const optionType = option.type.toString().toLowerCase();
        // eslint-disable-next-line spellcheck/spell-checker
        if (option.ispassword || option.sensitive) {
          convertedOption.convertedType = "secret";
        } else if (optionType.startsWith("bool")) {
          convertedOption.convertedType = "boolean";
        } else if (
          optionType.startsWith("float") ||
          optionType.startsWith("int") ||
          optionType.startsWith("number") ||
          optionType === "duration" ||
          optionType === "sizesuffix" || // eslint-disable-line spellcheck/spell-checker
          optionType === "multiencoder" // eslint-disable-line spellcheck/spell-checker
        ) {
          convertedOption.convertedType = "number";
        } else {
          convertedOption.convertedType = "string";
        }

        // type conversion is scary; for the default and value, we _try_ to convert it
        // TODO: we should consider using "example" as enum, but that might turn out to be a bad idea
        try {
          if (option.default != undefined && option.default !== "") {
            if (convertedOption.convertedType === "number")
              convertedOption.convertedDefault = parseFloat(
                option.default.toString()
              );
            else if (convertedOption.convertedType === "boolean")
              convertedOption.convertedDefault =
                option.default.toString().toLowerCase() === "true";
            else if (option.default.toString() !== "[object Object]")
              convertedOption.convertedDefault = option.default.toString();
          } else if (option.value != undefined && option.value !== "") {
            if (convertedOption.convertedType === "number")
              convertedOption.convertedDefault = parseFloat(
                option.value.toString()
              );
            else if (convertedOption.convertedType === "boolean")
              convertedOption.convertedDefault =
                option.value.toString().toLowerCase() === "true";
            else if (option.value.toString() !== "[object Object]")
              convertedOption.convertedDefault = option.value.toString();
          }
        } catch (e) {
          convertedOption.convertedDefault = undefined;
        }

        return convertedOption;
      })
    : optionsFiltered;

  return convertedOptions;
}

export function getSourcePathHint(targetSchema = "") {
  const initialText = "Source path to mount. ";
  const finalText =
    CLOUD_STORAGE_MOUN_PATH_HELP[targetSchema] ??
    CLOUD_STORAGE_MOUN_PATH_HELP["generic"];
  return initialText + finalText;
}

export function getCurrentStorageDetails(
  existingCloudStorage?: CloudStorage | null
): CloudStorageDetails {
  if (!existingCloudStorage) {
    return EMPTY_CLOUD_STORAGE_DETAILS;
  }
  const configurationOptions = existingCloudStorage.storage.configuration
    ? existingCloudStorage.storage.configuration
    : {};
  const { type, provider, ...options } = configurationOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
  const storageDetails: CloudStorageDetails = {
    storageId: existingCloudStorage.storage.storage_id,
    schema: existingCloudStorage.storage.configuration.type as string,
    name: existingCloudStorage.storage.name,
    mountPoint: existingCloudStorage.storage.target_path,
    sourcePath: existingCloudStorage.storage.source_path,
    provider: existingCloudStorage.storage.configuration.provider
      ? (existingCloudStorage.storage.configuration.provider as string)
      : undefined,
    options,
  };

  return storageDetails;
}
