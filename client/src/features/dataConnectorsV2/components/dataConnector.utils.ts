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

import type { PostStorageSchemaTestConnectionApiArg } from "../../project/components/cloudStorage/api/projectCloudStorage.api";
import {
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  STORAGES_WITH_ACCESS_MODE,
} from "../../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  CloudStorageDetailsOptions,
  CloudStorageSchema,
} from "../../project/components/cloudStorage/projectCloudStorage.types";
import { findSensitive } from "../../project/utils/projectCloudStorage.utils";
import type {
  CloudStorageCorePost,
  DataConnector,
  DataConnectorPost,
  DataConnectorRead,
} from "../api/data-connectors.api";
import { DataConnectorScope } from "../dataConnectors.types";
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
    readOnly: dataConnector.storage.readonly,
    schema: dataConnector.storage.configuration.type as string,
    sourcePath: dataConnector.storage.source_path,
  };

  return flattened;
}

export function validationParametersFromDataConnectorConfiguration(
  config: DataConnectorConfiguration
): PostStorageSchemaTestConnectionApiArg["body"] {
  const dataConnector = _dataConnectorFromConfig(config);
  const validateParameters: PostStorageSchemaTestConnectionApiArg["body"] = {
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

export function hasSchemaAccessMode(schema: CloudStorageSchema) {
  const providers = schema.options?.find((o) => o.name === "provider");
  return (
    providers?.examples && STORAGES_WITH_ACCESS_MODE.includes(schema.prefix)
  );
}

export function getDataConnectorScope(namespace?: string): DataConnectorScope {
  if (!namespace) return "global";
  if (namespace.split("/").length >= 2) return "project";
  return "namespace";
}

export function getDataConnectorSource(dataConnector: DataConnector): string {
  const scope = getDataConnectorScope(dataConnector.namespace);
  if (scope === "global") {
    return dataConnector.storage.configuration["doi"]
      ? (dataConnector.storage.configuration["doi"] as string)
      : "unknown";
  }
  return dataConnector.namespace as string;
}

// // Resolve a DOI to a URL
// // Reference: https://www.doi.org/the-identifier/resources/factsheets/doi-resolution-documentation
// func resolveDoiURL(ctx context.Context, srv *rest.Client, pacer *fs.Pacer, opt *Options) (doiURL *url.URL, err error) {
// 	var result api.DoiResolverResponse
// 	params := url.Values{}
// 	params.Add("index", "1")
// 	opts := rest.Opts{
// 		Method:     "GET",
// 		RootURL:    doiResolverAPIURL,
// 		Path:       "/handles/" + opt.Doi,
// 		Parameters: params,
// 	}
// 	err = pacer.Call(func() (bool, error) {
// 		res, err := srv.CallJSON(ctx, &opts, nil, &result)
// 		return shouldRetry(ctx, res, err)
// 	})
// 	if err != nil {
// 		return nil, err
// 	}

// 	if result.ResponseCode != 1 {
// 		return nil, fmt.Errorf("could not resolve DOI (error code %d)", result.ResponseCode)
// 	}
// 	resolvedURLStr := ""
// 	for _, value := range result.Values {
// 		if value.Type == "URL" && value.Data.Format == "string" {
// 			valueStr, ok := value.Data.Value.(string)
// 			if !ok {
// 				return nil, fmt.Errorf("could not resolve DOI (incorrect response format)")
// 			}
// 			resolvedURLStr = valueStr
// 		}
// 	}
// 	resolvedURL, err := url.Parse(resolvedURLStr)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resolvedURL, nil
// }

/** Parse the input string as a DOI
 *
 * Examples:
 * - 10.1000/182 -> 10.1000/182
 * - https://doi.org/10.1000/182 -> 10.1000/182
 * - doi:10.1000/182 -> 10.1000/182
 */
function parseDoi(doi: string): string {
  try {
    const doiURL = new URL(doi);
    if (doiURL.protocol.toLowerCase() === "doi:") {
      return doi.slice("doi:".length).replace(/^([/])*/, "");
    }
    if (doiURL.hostname.toLowerCase().endsWith("doi.org")) {
      return doiURL.pathname.replace(/^([/])*/, "");
    }
  } catch {
    return doi;
  }
  return doi;
}
