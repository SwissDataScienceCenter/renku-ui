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

import { type SessionDataConnectorOverride } from "~/features/sessionsV2/api/sessionsV2.api";
import type {
  RCloneConfig,
  RCloneOption,
} from "../dataConnectorsV2/api/data-connectors.api";
import { hasSchemaAccessMode } from "../dataConnectorsV2/components/dataConnector.utils";
import type { SessionStartDataConnectorConfiguration } from "../sessionsV2/startSessionOptionsV2.types";
import type { CloudStorageGet } from "./api/projectCloudStorage.api";
import {
  CLOUD_OPTIONS_OVERRIDE,
  CLOUD_OPTIONS_PROVIDER_OVERRIDE,
  CLOUD_STORAGE_MOUNT_PATH_HELP,
  CLOUD_STORAGE_OVERRIDE,
  CLOUD_STORAGE_PROVIDERS_SHORTLIST,
  CLOUD_STORAGE_SCHEMA_SHORTLIST,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  EMPTY_CLOUD_STORAGE_DETAILS,
  STORAGES_WITH_ACCESS_MODE,
} from "./projectCloudStorage.constants";
import type {
  CloudStorage,
  CloudStorageCredential,
  CloudStorageDetails,
  CloudStorageOptionTypes,
  CloudStorageProvider,
  CloudStorageSchema,
  CloudStorageSchemaOption,
} from "./projectCloudStorage.types";

const LAST_POSITION = 1000;

export interface CloudStorageOptions extends RCloneOption {
  requiredCredential: boolean;
}

type SensitiveFields =
  | CloudStorage["sensitive_fields"]
  | CloudStorageGet["sensitive_fields"];
type StorageConfiguration =
  | CloudStorage["storage"]["configuration"]
  | CloudStorageGet["storage"]["configuration"];
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
  | (T extends CloudStorageGet ? CloudStorageOptions : CloudStorageCredential)[]
  | undefined {
  const { storage, sensitive_fields } = storageDefinition;
  const { configuration } = storage;
  const providedSensitiveFields = getProvidedSensitiveFields(configuration);
  const result = sensitive_fields?.map((field) => ({
    ...field,
    requiredCredential: providedSensitiveFields.includes(field?.name || ""),
  }));
  if (result == null) return result;
  return result as (T extends CloudStorageGet
    ? CloudStorageOptions
    : CloudStorageCredential)[];
}

export function getProvidedSensitiveFields(
  configuration: RCloneConfig
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
      ) {
        return current;
      }
      const override = CLOUD_STORAGE_OVERRIDE.storage[element.prefix];
      console.log({ prefix: element.prefix, override });
      if (override /* && !override.hide*/) {
        if (override.hide) {
          return current;
        }
        current.push({
          ...element,
          name: override.name ?? element.name,
          description: override.description ?? element.description,
          position: override.position ?? element.position,
          forceReadOnly: override.forceReadOnly ?? element.forceReadOnly,
        });
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
    return providers?.examples?.map<CloudStorageProvider>((a) => ({
      name: a.value,
      help: a.help,
      position: undefined,
      friendlyName: a.value.charAt(0).toUpperCase() + a.value.slice(1),
    }));

  const providerOverrides =
    CLOUD_STORAGE_OVERRIDE.storage[targetSchema]?.providers;

  const finalProviders = providers?.examples?.reduce<CloudStorageProvider[]>(
    (current, e) => {
      const providersShortlist =
        CLOUD_STORAGE_PROVIDERS_SHORTLIST[targetSchema];
      if (
        shortList &&
        providersShortlist &&
        !providersShortlist.includes(e.value) &&
        e.value !== currentProvider
      ) {
        return current;
      }
      if (
        providerOverrides &&
        Object.keys(providerOverrides).includes(e.value)
      ) {
        const override = providerOverrides[e.value];
        current.push({
          name: override.name ?? e.value,
          help: override.help ?? e.help,
          position: override.position ?? undefined,
        });
      } else {
        current.push({
          name: e.value,
          help: e.help,
          position: undefined,
        });
      }
      return current;
    },
    []
  );

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

export function getSchema(schema: CloudStorageSchema[], targetSchema?: string) {
  if (!targetSchema) return;
  const currentSchema = schema.find((s) => s.prefix === targetSchema);
  const override = CLOUD_STORAGE_OVERRIDE.storage[targetSchema];
  console.log({ targetSchema, override });
  if (currentSchema && override /*&& !override.hide*/) {
    return {
      ...currentSchema,
      name: override.name ?? currentSchema.name,
      description: override.description ?? currentSchema.description,
      position: override.position ?? currentSchema.position,
      forceReadOnly: override.forceReadOnly ?? currentSchema.forceReadOnly,
    };
  }
  return currentSchema;
}

export function getSchemaOptions(
  schema: CloudStorageSchema[],
  shortList = false,
  targetSchema?: string,
  targetProvider?: string,
  flags = { override: true, convertType: true, filterHidden: true }
): CloudStorageSchemaOption[] | undefined {
  if (!targetSchema) return;
  const storage = getSchema(schema, targetSchema);
  if (!storage) return;

  const optionsOverridden = flags.override
    ? overrideOptions(storage.options, targetSchema, targetProvider)
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
  existingCloudStorage?: CloudStorage | CloudStorageGet | null
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
): SessionStartDataConnectorConfiguration {
  const newCs: SessionStartDataConnectorConfiguration = {
    ...cs,
    saveCredentials: false,
    touched: false,
  };
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

export function dataConnectorsOverrideFromConfig(
  config: SessionStartDataConnectorConfiguration
): SessionDataConnectorOverride[] {
  if (!config.skip && !config.touched) {
    return [];
  }

  const configuration = { ...config.dataConnector.storage.configuration };
  Object.entries(config.sensitiveFieldValues).forEach(([name, value]) => {
    if (value != null && value !== "") {
      configuration[name] = value;
    } else {
      delete configuration[name];
    }
  });
  const override: SessionDataConnectorOverride = {
    skip: config.skip,
    data_connector_id: config.dataConnector.id,
    configuration,
  };
  return [override];
}

function overrideOptions(
  options: CloudStorageSchemaOption[],
  targetSchema: string,
  targetProvider?: string
): CloudStorageSchemaOption[] {
  return options.map((option) => {
    const schemaOverrides =
      CLOUD_OPTIONS_OVERRIDE[targetSchema]?.[option.name] || {};
    const providerOverrides =
      targetProvider &&
      CLOUD_OPTIONS_PROVIDER_OVERRIDE[targetSchema]?.[targetProvider]?.[
        option.name
      ];
    return providerOverrides
      ? { ...option, ...schemaOverrides, ...providerOverrides }
      : { ...option, ...schemaOverrides };
  });
}

function filterOption(
  option: CloudStorageSchemaOption,
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

function shouldHideOption(option: CloudStorageSchemaOption): boolean {
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
  options: CloudStorageSchemaOption[],
  targetProvider?: string
): CloudStorageSchemaOption[] {
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
  option: CloudStorageSchemaOption
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
  option: CloudStorageSchemaOption,
  type: string
): undefined | string | number | boolean {
  try {
    const value = option.default;
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
  options: CloudStorageSchemaOption[]
): CloudStorageSchemaOption[] {
  return options.sort((a, b) => {
    const positionA = a.position ?? Infinity; // Default to Infinity if "position" is undefined
    const positionB = b.position ?? Infinity;
    return positionA - positionB;
  });
}
