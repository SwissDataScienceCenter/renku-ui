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
  RCloneConfig,
  RCloneOption,
} from "../../dataConnectorsV2/api/data-connectors.api";
import { hasSchemaAccessMode } from "../../dataConnectorsV2/components/dataConnector.utils.ts";
import { CloudStorageGetRead } from "../../projectsV2/api/storagesV2.api";
import { SessionCloudStorageV2 } from "../../sessionsV2/sessionsV2.types.ts";
import {
  CLOUD_OPTIONS_OVERRIDE,
  CLOUD_STORAGE_MOUNT_PATH_HELP,
  CLOUD_STORAGE_OVERRIDE,
  CLOUD_STORAGE_PROVIDERS_SHORTLIST,
  CLOUD_STORAGE_SCHEMA_SHORTLIST,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  EMPTY_CLOUD_STORAGE_DETAILS,
  STORAGES_WITH_ACCESS_MODE,
} from "../components/cloudStorage/projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageConfiguration,
  CloudStorageCredential,
  CloudStorageDetails,
  CloudStorageOptionTypes,
  CloudStorageProvider,
  CloudStorageSchema,
  CloudStorageSchemaOptions,
} from "../components/cloudStorage/projectCloudStorage.types";

import { SessionStartDataConnectorConfiguration } from "../../sessionsV2/startSessionOptionsV2.types";

const LAST_POSITION = 1000;

export interface CloudStorageOptions extends RCloneOption {
  requiredCredential: boolean;
}

type SensitiveFields =
  | CloudStorage["sensitive_fields"]
  | CloudStorageGetRead["sensitive_fields"];
type StorageConfiguration =
  | CloudStorage["storage"]["configuration"]
  | CloudStorageGetRead["storage"]["configuration"];
type StorageAndSensitiveFieldsDefinition = {
  storage: { configuration: StorageConfiguration };
  sensitive_fields?: SensitiveFields;
};

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

export function convertFromAdvancedConfig(
  storage: CloudStorageDetails
): string {
  const values: string[] = [];
  storage.schema && values.push(`type = ${storage.schema}`);
  storage.provider && values.push(`provider = ${storage.provider}`);
  if (storage.options) {
    Object.entries(storage.options).forEach(([key, value]) => {
      if (value != undefined && value !== "") values.push(`${key} = ${value}`);
    });
  }
  if (storage.name) values.unshift(`[${storage.name}]`);
  return values.length ? values.join("\n") + "\n" : "";
}

export function getCredentialFieldDefinitions<
  T extends StorageAndSensitiveFieldsDefinition
>(
  storageDefinition: T
):
  | (T extends CloudStorageGetRead
      ? CloudStorageOptions
      : CloudStorageCredential)[]
  | undefined {
  const { storage, sensitive_fields } = storageDefinition;
  const { configuration } = storage;
  const providedSensitiveFields = getProvidedSensitiveFields(configuration);
  const result = sensitive_fields?.map((field) => ({
    ...field,
    requiredCredential: providedSensitiveFields.includes(field?.name || ""),
  }));
  if (result == null) return result;
  return result as (T extends CloudStorageGetRead
    ? CloudStorageOptions
    : CloudStorageCredential)[];
}

export function getProvidedSensitiveFields(
  configuration: CloudStorageConfiguration["configuration"] | RCloneConfig
): string[] {
  return Object.entries(configuration)
    .filter(([, value]) => value === CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN)
    .map(([key]) => key);
}

export function getSchemaStorage(
  schema: CloudStorageSchema[],
  shortList = false,
  currentSchema?: string
): CloudStorageSchema[] {
  const finalStorage = schema.reduce<CloudStorageSchema[]>(
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
        if (!override.hide) {
          current.push({
            ...element,
            name: override.name ?? element.name,
            description: override.description ?? element.description,
            position: override.position ?? element.position,
          });
        }
      } else {
        current.push(element);
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

  const hasProviders = !!providers?.examples?.length;
  const hasAccessMode = hasSchemaAccessMode(storage);
  if (!hasProviders && !hasAccessMode) return;

  if (hasAccessMode)
    return providers?.examples.map(
      (a) =>
        ({
          name: a.value,
          description: a.help,
          position: undefined,
          friendlyName: a.value.charAt(0).toUpperCase() + a.value.slice(1),
        } as CloudStorageProvider)
    );

  const providerOverrides = Object.keys(
    CLOUD_STORAGE_OVERRIDE.storage
  ).includes(targetSchema)
    ? CLOUD_STORAGE_OVERRIDE.storage[targetSchema].providers
    : undefined;

  const finalProviders = providers?.examples.reduce<
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
    ? overrideOptions(storage.options, targetSchema)
    : storage.options;

  const optionsFiltered = optionsOverridden.filter((option) =>
    filterOption(option, shortList, targetProvider, flags.filterHidden)
  );

  if (!optionsFiltered.length) return;

  const sortedOptions = sortOptionsByPosition(optionsFiltered);

  return flags.convertType
    ? convertOptions(sortedOptions, targetProvider)
    : sortedOptions;
}

export function getSourcePathHint(
  targetSchema = ""
): Record<"help" | "placeholder" | "label", string> {
  const initialText = STORAGES_WITH_ACCESS_MODE.includes(targetSchema)
    ? ""
    : "Source path to mount. ";
  const helpData =
    CLOUD_STORAGE_MOUNT_PATH_HELP[targetSchema] ??
    CLOUD_STORAGE_MOUNT_PATH_HELP["generic"];
  const finalText = initialText + helpData.help;
  return {
    help: finalText,
    placeholder: helpData.placeholder,
    label: helpData.label ?? "Source path",
  };
}

export function getCurrentStorageDetails(
  existingCloudStorage?: CloudStorage | CloudStorageGetRead | null
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
    readOnly: existingCloudStorage.storage.readonly,
    provider: existingCloudStorage.storage.configuration.provider
      ? (existingCloudStorage.storage.configuration.provider as string)
      : undefined,
    options,
  };

  return storageDetails;
}

export function findSensitive(
  schema: CloudStorageSchema | undefined
): string[] {
  if (!schema) return [];
  return schema.options
    ? schema.options
        .filter((o) => o.ispassword || o.sensitive) // eslint-disable-line spellcheck/spell-checker
        .map((o) => o.name)
    : [];
}

export function storageDefinitionAfterSavingCredentialsFromConfig(
  cs: SessionStartDataConnectorConfiguration
) {
  const newCs = { ...cs, saveCredentials: false };
  const newStorage = { ...newCs.dataConnector.storage };
  // The following two lines remove the sensitive fields from the storage configuration,
  // which should be ok, but isn't; so keep in the sensitive fields.
  // newCs.sensitiveFieldValues = {};
  // newStorage.configuration = {};
  const newDataConnector = {
    ...newCs.dataConnector,
    storage: newStorage,
  };
  newCs.dataConnector = newDataConnector;
  return newCs;
}

export function storageDefinitionFromConfig(
  config: SessionStartDataConnectorConfiguration
): SessionCloudStorageV2 {
  const storageDefinition = config.dataConnector.storage;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sensitive_fields, ...s } = config.dataConnector.storage;
  const newStorageDefinition = {
    ...s,
    name: config.dataConnector.slug,
    storage_id: config.dataConnector.id,
  };
  newStorageDefinition.configuration = { ...storageDefinition.configuration };
  const sensitiveFieldValues = config.sensitiveFieldValues;
  Object.entries(sensitiveFieldValues).forEach(([name, value]) => {
    if (value != null && value !== "") {
      newStorageDefinition.configuration[name] = value;
    } else {
      delete newStorageDefinition.configuration[name];
    }
  });
  return newStorageDefinition;
}

function overrideOptions(
  options: CloudStorageSchemaOptions[],
  targetSchema: string
): CloudStorageSchemaOptions[] {
  return options.map((option) => {
    const override = CLOUD_OPTIONS_OVERRIDE[targetSchema]?.[option.name];
    return override ? { ...option, ...override } : option;
  });
}

function filterOption(
  option: CloudStorageSchemaOptions,
  shortList: boolean,
  targetProvider?: string,
  filterHidden = true
): boolean {
  if (filterHidden && shouldHideOption(option)) return false;
  if (!option.name || option.name == "provider") return false;
  if (option.advanced && shortList) return false;

  if (option.provider) {
    if (!filterByProvider(option.provider, targetProvider)) return false;
  }

  return true;
}

function shouldHideOption(option: CloudStorageSchemaOptions): boolean {
  return !(
    option.hide === 0 ||
    option.hide === false ||
    option.hide == undefined
  );
}

function filterByProvider(provider: string, targetProvider?: string): boolean {
  if (!targetProvider) return !provider.startsWith("!");
  const providers = provider.startsWith("!")
    ? provider.slice(1).split(",")
    : provider.split(",");
  return provider.startsWith("!")
    ? !providers.includes(targetProvider)
    : providers.includes(targetProvider);
}

function convertOptions(
  options: CloudStorageSchemaOptions[],
  targetProvider?: string
): CloudStorageSchemaOptions[] {
  return options.map((option) => {
    const convertedOption = { ...option };

    convertedOption.convertedHide = shouldHideOption(option);

    convertedOption.convertedType = inferOptionType(option);

    convertedOption.convertedDefault = convertDefaultValue(
      option,
      convertedOption.convertedType
    );

    if (option.examples) {
      convertedOption.filteredExamples = option.examples.filter((example) =>
        filterExample(example, targetProvider)
      );
    }

    return convertedOption;
  });
}

function inferOptionType(
  option: CloudStorageSchemaOptions
): CloudStorageOptionTypes {
  const optionType = option.type.toString().toLowerCase();
  if (option.ispassword || option.sensitive) return "secret";
  if (optionType.startsWith("bool")) return "boolean";
  if (
    // eslint-disable-next-line spellcheck/spell-checker
    ["float", "int", "number", "duration", "sizesuffix", "multiencoder"].some(
      (type) => optionType.startsWith(type)
    )
  ) {
    return "number";
  }
  return "string";
}

function convertDefaultValue(
  option: CloudStorageSchemaOptions,
  type: string
): undefined | string | number | boolean {
  try {
    const value = option.default ?? option.value;
    if (value === undefined || value === "[object Object]") return undefined;

    if (type === "number") return parseFloat(value.toString());
    if (type === "boolean") return value.toString().toLowerCase() === "true";
    return value.toString();
  } catch {
    return undefined;
  }
}

function filterExample(
  example: { provider?: string },
  targetProvider?: string
): boolean {
  if (!targetProvider || !example.provider) return true;

  if (example.provider) {
    return filterByProvider(example.provider, targetProvider);
  }

  return true;
}

function sortOptionsByPosition(
  options: CloudStorageSchemaOptions[]
): CloudStorageSchemaOptions[] {
  return options.sort((a, b) => {
    const positionA = a.position ?? Infinity; // Default to Infinity if "position" is undefined
    const positionB = b.position ?? Infinity;
    return positionA - positionB;
  });
}
