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
 * limitations under the License
 */

import { useMemo } from "react";

import { CLOUD_OPTIONS_OVERRIDE } from "../../project/components/cloudStorage/projectCloudStorage.constants";
import { RCloneOption } from "../api/data-connectors.api";
import type { DataConnectorRead } from "../api/data-connectors.api";
import { useGetDataConnectorsListSecretsQuery } from "../api/data-connectors.enhanced-api";

import type { SessionStartDataConnectorConfiguration } from "../../sessionsV2/startSessionOptionsV2.types";

export interface DataConnectorConfiguration
  extends Omit<SessionStartDataConnectorConfiguration, "cloudStorage"> {
  dataConnector: DataConnectorRead;
}

interface UseDataSourceConfigurationArgs {
  dataConnectors: DataConnectorRead[] | undefined;
}

export default function useDataConnectorConfiguration({
  dataConnectors,
}: UseDataSourceConfigurationArgs) {
  const { data: dataConnectorSecrets } = useGetDataConnectorsListSecretsQuery({
    dataConnectorIds: dataConnectors?.map((dc) => dc.id) ?? [],
  });
  const dataConnectorConfigs = useMemo(
    () =>
      dataConnectors?.map((dataConnector) => {
        const storageDefinition = dataConnector.storage;
        const defSensitiveFieldsMap: Record<string, RCloneOption> = {};
        if (dataConnector.storage.sensitive_fields != null) {
          dataConnector.storage.sensitive_fields.forEach((f) => {
            if (f.name != null) defSensitiveFieldsMap[f.name] = f;
          });
        }
        const configSensitiveFields = Object.keys(
          storageDefinition.configuration
        ).filter((key) => defSensitiveFieldsMap[key] != null);

        const overrides =
          storageDefinition.storage_type != null
            ? CLOUD_OPTIONS_OVERRIDE[storageDefinition.storage_type]
            : undefined;

        const sensitiveFieldDefinitions = configSensitiveFields
          .filter((key) => defSensitiveFieldsMap[key].name != null)
          .map((key) => {
            const { help, name } = defSensitiveFieldsMap[key];
            return {
              help: overrides?.[key]?.help ?? help ?? "",
              friendlyName: overrides?.[key]?.friendlyName ?? name ?? key,
              name: name ?? key,
              value: "",
            };
          });

        const sensitiveFieldValues: SessionStartDataConnectorConfiguration["sensitiveFieldValues"] =
          {};
        configSensitiveFields.forEach((key) => {
          const { name } = defSensitiveFieldsMap[key];
          if (name == null) return;
          sensitiveFieldValues[name] = "";
        });
        const savedCredentialFields = dataConnectorSecrets
          ? dataConnectorSecrets[dataConnector.id].map((s) => s.name)
          : [];
        return {
          active: true,
          dataConnector,
          sensitiveFieldDefinitions,
          sensitiveFieldValues,
          saveCredentials: false,
          savedCredentialFields,
        };
      }),
    [dataConnectors, dataConnectorSecrets]
  );

  return {
    dataConnectorConfigs,
  };
}
