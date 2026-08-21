/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { DataConnectorRead } from "~/features/dataConnectorsV2/api/data-connectors.api";

/**
 * rclone storage types whose credentials come from an OAuth2 integration.
 * Mirrors `_OAUTH2_INTEGRATION_STORAGE_TYPES` in `renku_apps/data_connectors.py`.
 */
export const APP_OAUTH2_STORAGE_TYPES: ReadonlySet<string> = new Set([
  "drive",
  "dropbox",
]);

/**
 * Whether an app would mount this data connector: public, no static credentials,
 * no OAuth integration. Read-only mirror of `is_app_mountable`
 * (`renku_apps/data_connectors.py`); fails closed on unexpected data.
 */
export function appWillMount(dataConnector: DataConnectorRead): boolean {
  const { storage, visibility } = dataConnector;

  if (visibility !== "public") {
    return false;
  }
  if (storage?.sensitive_fields == null) {
    return false;
  }
  if (storage.sensitive_fields.length > 0) {
    return false;
  }

  const storageType = storage.configuration?.["type"];
  if (typeof storageType !== "string") {
    return false;
  }
  return !APP_OAUTH2_STORAGE_TYPES.has(storageType);
}

export interface PartitionedDataConnectors {
  mounted: DataConnectorRead[];
  skipped: DataConnectorRead[];
}

export function partitionDataConnectorsForApp(
  dataConnectors: DataConnectorRead[],
): PartitionedDataConnectors {
  const mounted: DataConnectorRead[] = [];
  const skipped: DataConnectorRead[] = [];

  for (const dataConnector of dataConnectors) {
    (appWillMount(dataConnector) ? mounted : skipped).push(dataConnector);
  }

  return { mounted, skipped };
}
