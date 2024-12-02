/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "../../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  CloudStorageDetailsOptions,
  CloudStorageSchema,
  TestCloudStorageConnectionParams,
} from "../../project/components/cloudStorage/projectCloudStorage.types";

import { findSensitive } from "../../project/utils/projectCloudStorage.utils";

import type {
  CloudStorageCorePost,
  DataConnectorPost,
  DataConnectorRead,
} from "../api/data-connectors.api";
import type { DataConnectorConfiguration } from "./useDataConnectorConfiguration.hook";

// This contains the information in a DataConnector, but it is flattened
// to be closer to the old CloudStorageDetails structure
export type DataConnectorFlat = {
  // DataConnectorRead metadata fields
  dataConnectorId?: string;
  name?: string;
  namespace?: string;
  slug?: string;
  visibility?: string;

  // DataConnector storage fields
  mountPoint?: string;
  options?: CloudStorageDetailsOptions;
  provider?: string;
  access_level?: string;
  readOnly?: boolean;
  schema?: string;
  sourcePath?: string;
};

type DataConnectorOptions = Record<
  string,
  string | number | boolean | object | null
>;

export const EMPTY_DATA_CONNECTOR_FLAT: DataConnectorFlat = {
  // Remote storage fields
  options: undefined,
  provider: undefined,
  schema: undefined,
  sourcePath: undefined,

  // DataConnector fields
  name: undefined,
  namespace: undefined,
  slug: undefined,
  visibility: "private",
  mountPoint: undefined,
  readOnly: true,
};

export function dataConnectorPostFromFlattened(
  flatDataConnector: DataConnectorFlat,
  schemata: CloudStorageSchema[],
  dataConnector: DataConnectorRead | null
): DataConnectorPost {
  const meta = {
    name: flatDataConnector.name as string,
    namespace: flatDataConnector.namespace as string,
    slug: flatDataConnector.slug as string,
    visibility:
      flatDataConnector.visibility === "public"
        ? ("public" as const)
        : ("private" as const),
  };
  const storage: CloudStorageCorePost = {
    configuration: { type: flatDataConnector.schema ?? null },
    readonly: flatDataConnector.readOnly ?? true,
    source_path: flatDataConnector.sourcePath ?? "/",
    target_path: flatDataConnector.mountPoint as string,
  };
  if (flatDataConnector.provider) {
    storage.configuration.provider = flatDataConnector.provider;
  }
  if (flatDataConnector.access_level) {
    storage.configuration.access_level = flatDataConnector.access_level;
    const schemaDataConnector = schemata.find(
      (s) => s.prefix === flatDataConnector.schema
    );
    const urlOptionSchemata = schemaDataConnector?.options.find(
      (o) => o.name === "url"
    );
    storage.configuration.url = urlOptionSchemata?.default ?? "";
  }
  // Add options if any
  if (
    flatDataConnector.options &&
    Object.keys(flatDataConnector.options).length > 0
  ) {
    const allOptions = flatDataConnector.options as DataConnectorOptions;
    const sensitiveFields = schemata
      ? findSensitive(
          schemata.find((s) => s.prefix === flatDataConnector.schema)
        )
      : dataConnector?.storage?.sensitive_fields
      ? dataConnector.storage.sensitive_fields.map((field) => field.name)
      : [];
    const validOptions = Object.keys(
      flatDataConnector.options
    ).reduce<DataConnectorOptions>((options, key) => {
      const value = allOptions[key];
      if (value != undefined && value !== "") {
        options[key] = sensitiveFields.includes(key)
          ? CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN
          : value;
      }
      return options;
    }, {});

    storage.configuration = {
      ...storage.configuration,
      ...validOptions,
    };
  }
  return { ...meta, storage };
}

export function dataConnectorToFlattened(
  dataConnector: DataConnectorRead | null
): DataConnectorFlat {
  if (!dataConnector) {
    return EMPTY_DATA_CONNECTOR_FLAT;
  }
  const configurationOptions = dataConnector.storage.configuration
    ? dataConnector.storage.configuration
    : {};
  const { type, provider, ...options } = configurationOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
  const flattened: DataConnectorFlat = {
    dataConnectorId: dataConnector.id,
    name: dataConnector.name,
    namespace: dataConnector.namespace,
    slug: dataConnector.slug,
    visibility: dataConnector.visibility,
    mountPoint: dataConnector.storage.target_path,
    options,
    provider: dataConnector.storage.configuration.provider
      ? (dataConnector.storage.configuration.provider as string)
      : undefined,
    access_level: dataConnector.storage.configuration.access_level
      ? (dataConnector.storage.configuration.access_level as string)
      : undefined,
    readOnly: dataConnector.storage.readonly,
    schema: dataConnector.storage.configuration.type as string,
    sourcePath: dataConnector.storage.source_path,
  };

  return flattened;
}

export function validationParametersFromDataConnectorConfiguration(
  config: DataConnectorConfiguration
) {
  const dataConnector = _dataConnectorFromConfig(config);
  const validateParameters: TestCloudStorageConnectionParams = {
    configuration: dataConnector.configuration,
    source_path: dataConnector.source_path,
  };
  return validateParameters;
}

function _dataConnectorFromConfig(config: DataConnectorConfiguration) {
  const dataConnector = config.dataConnector;
  const storageDefinition = config.dataConnector.storage;
  const mergedDataConnector = { ...dataConnector, ...storageDefinition };
  mergedDataConnector.configuration = { ...storageDefinition.configuration };
  const sensitiveFieldValues = config.sensitiveFieldValues;
  Object.entries(sensitiveFieldValues).forEach(([name, value]) => {
    if (value != null && value !== "") {
      mergedDataConnector.configuration[name] = value;
    } else {
      delete mergedDataConnector.configuration[name];
    }
  });
  return mergedDataConnector;
}

export function hasSchemaAccessLevel(schema: CloudStorageSchema) {
  return !!schema?.options.find((o) => o.name === "access_level");
}
