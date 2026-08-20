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
 * The property that stops an app from mounting a connector.
 *
 * Carried instead of a bare `false` so each row of the panel can name its own
 * cause. Without it the panel can only state the rule and leave the reader to
 * work out which of three conditions a given connector tripped — and the reader
 * cannot, because two of the three (credentials, integrations) are not visible
 * anywhere on the row.
 */
export type AppMountBlocker =
  | "not-public"
  | "needs-credentials"
  | "needs-integration"
  | "indeterminate";

/** Whether an app would mount a connector, and if not, what stopped it. */
export type AppMountState =
  | { mounted: true }
  | { mounted: false; blocker: AppMountBlocker };

const MOUNTED: AppMountState = { mounted: true };

/**
 * Whether an app would mount this data connector, and what blocked it if not.
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
 * Those cases report `indeterminate` rather than guessing at a cause, because a
 * wrong explanation on the row is worse than none — it sends the reader off to
 * change a setting that was never the problem.
 *
 * The order of the checks is the order of the backend's, so the blocker a
 * connector reports is the first one it trips rather than every one it trips: a
 * private S3 bucket with stored keys reports `not-public`, and fixing only that
 * leaves it reporting `needs-credentials`. That matches how the backend would
 * answer if asked twice, and it keeps the row to one cause at a time.
 */
export function evaluateAppMount(
  dataConnector: DataConnectorRead,
): AppMountState {
  const { storage, visibility } = dataConnector;

  if (visibility !== "public") {
    return { mounted: false, blocker: "not-public" };
  }
  if (storage?.sensitive_fields == null) {
    return { mounted: false, blocker: "indeterminate" };
  }
  if (storage.sensitive_fields.length > 0) {
    return { mounted: false, blocker: "needs-credentials" };
  }

  const storageType = storage.configuration?.["type"];
  if (typeof storageType !== "string") {
    return { mounted: false, blocker: "indeterminate" };
  }
  if (APP_OAUTH2_STORAGE_TYPES.has(storageType)) {
    return { mounted: false, blocker: "needs-integration" };
  }
  return MOUNTED;
}

/**
 * A connector as the panel lists it.
 *
 * `mountState` is absent when mounting is unconditional — a session or job
 * launcher mounts everything linked to the project, so there is no distinction
 * to draw and the panel says nothing about it. Its presence is what tells the
 * panel to label the rows, so the labels can never appear where they would be
 * meaningless.
 */
export interface DataConnectorListItem {
  dataConnector: DataConnectorRead;
  mountState?: AppMountState;
}

/**
 * List a project's linked connectors as an app sees them, mounted ones first.
 *
 * The panel lists every connector and dims the ones an app leaves behind, rather
 * than hiding them: a connector that is linked to the project but absent from
 * the panel reads as a bug or a lost link, whereas a dimmed row says the link is
 * fine and the app simply cannot use it.
 *
 * Mounted-first ordering is safe to impose because the incoming order is the
 * order the links came back in — nothing the reader is tracking — and it keeps
 * the dimmed rows out of the way of the list's actual answer.
 */
export function listDataConnectorsForApp(
  dataConnectors: DataConnectorRead[],
): DataConnectorListItem[] {
  const mounted: DataConnectorListItem[] = [];
  const skipped: DataConnectorListItem[] = [];

  for (const dataConnector of dataConnectors) {
    const mountState = evaluateAppMount(dataConnector);
    (mountState.mounted ? mounted : skipped).push({
      dataConnector,
      mountState,
    });
  }

  return [...mounted, ...skipped];
}
