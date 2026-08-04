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
 *
 * Such a connector has no static secret fields, so it clears the sensitive-field
 * check below on its own. The backend excludes these types explicitly and so
 * must this list.
 *
 * This is the third copy of that set. The other two live in
 * `renku_apps/data_connectors.py` (`_OAUTH2_INTEGRATION_STORAGE_TYPES`) and
 * `notebooks/data_sources.py`; both already carry a note that adding a type in
 * one place means adding it in the others. Adding it here too only changes what
 * this panel *claims* — the backend filter is what actually decides — so a stale
 * copy here over-promises rather than leaks.
 */
export const APP_OAUTH2_STORAGE_TYPES: ReadonlySet<string> = new Set([
  "drive",
  "dropbox",
]);

/**
 * Whether an app would mount this data connector.
 *
 * Apps are served to anonymous visitors, so the backend mounts a connector only
 * when it is public, needs no static credentials, and needs no OAuth
 * integration. This is the read-only UI mirror of `is_app_mountable`
 * (`renku_apps/data_connectors.py`) — it exists so the launcher panel can say
 * which connectors an app will actually see, and it decides nothing.
 *
 * Two of the three conditions come over the wire verbatim rather than being
 * re-derived: `visibility` is the same field the backend compares, and
 * `storage.sensitive_fields` is the output of the very same
 * `validator.get_private_fields(configuration)` call the backend's predicate
 * makes (see `dump_storage_with_sensitive_fields`). Only the OAuth type set is
 * genuinely duplicated.
 *
 * The storage type is read from `configuration.type`, not from `storage_type`:
 * the backend predicate reads the configuration, and the two diverge for
 * DOI-derived connectors, where `storage_type` records the origin while the
 * configuration holds the type rclone is actually given.
 *
 * Fail-closed, like the backend: anything unexpected (a connector missing its
 * sensitive-field list, a configuration with no type) counts as not mounted, so
 * a gap in the data understates what the app gets rather than overstating it.
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

/** A project's connectors split by whether an app would mount them. */
export interface PartitionedDataConnectors {
  mounted: DataConnectorRead[];
  skipped: DataConnectorRead[];
}

/**
 * Split a project's linked connectors into the ones an app mounts and the ones
 * it leaves behind.
 *
 * Both halves are needed: the panel lists the first and explains the second,
 * and a project whose connectors all fall into `skipped` needs a different
 * message from one that has no connectors at all.
 */
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
