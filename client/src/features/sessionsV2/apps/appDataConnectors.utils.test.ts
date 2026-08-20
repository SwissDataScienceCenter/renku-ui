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

import { describe, expect, it } from "vitest";

import type {
  DataConnectorRead,
  RCloneOption,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  evaluateAppMount,
  listDataConnectorsForApp,
} from "./appDataConnectors.utils";

/** A sensitive-field entry, shaped enough for the predicate to count it. */
const SECRET_FIELD = {
  name: "secret_access_key",
  help: "The secret key.",
} as RCloneOption;

interface ConnectorOverrides {
  configuration?: Record<string, unknown>;
  name?: string;
  sensitiveFields?: RCloneOption[];
  visibility?: "private" | "public";
}

/**
 * A connector that clears every condition, so each test can break exactly one.
 * Cast rather than fully populated: the predicate reads four fields and the
 * generated type carries a dozen that would only be noise here.
 */
function makeDataConnector({
  configuration = { type: "s3", provider: "AWS" },
  name = "public-bucket",
  sensitiveFields = [],
  visibility = "public",
}: ConnectorOverrides = {}): DataConnectorRead {
  return {
    id: `id-${name}`,
    name,
    visibility,
    storage: {
      configuration,
      sensitive_fields: sensitiveFields,
      storage_type: (configuration["type"] as string) ?? "s3",
      source_path: "bucket/",
      target_path: name,
      readonly: true,
    },
  } as unknown as DataConnectorRead;
}

describe("evaluateAppMount", () => {
  it("mounts a public connector with no secrets and a plain storage type", () => {
    expect(evaluateAppMount(makeDataConnector())).toEqual({ mounted: true });
  });

  it("skips a private connector as not public", () => {
    expect(
      evaluateAppMount(makeDataConnector({ visibility: "private" })),
    ).toEqual({ mounted: false, blocker: "not-public" });
  });

  it("skips a public connector that carries static credentials", () => {
    expect(
      evaluateAppMount(makeDataConnector({ sensitiveFields: [SECRET_FIELD] })),
    ).toEqual({ mounted: false, blocker: "needs-credentials" });
  });

  // The load-bearing case, and the reason the OAuth set has to be duplicated at
  // all: an OAuth connector has no static secret fields, so the sensitive-field
  // check alone would wave a user's private Drive through.
  it.each(["drive", "dropbox"])(
    "skips a public %s connector as needing an integration",
    (storageType) => {
      expect(
        evaluateAppMount(
          makeDataConnector({
            configuration: { type: storageType },
            sensitiveFields: [],
          }),
        ),
      ).toEqual({ mounted: false, blocker: "needs-integration" });
    },
  );

  // The backend predicate reads configuration["type"]; storage_type records
  // where a DOI-derived connector came from and can disagree with it.
  it("reads the storage type from the configuration, not from storage_type", () => {
    const connector = makeDataConnector({ configuration: { type: "drive" } });
    connector.storage.storage_type = "doi";

    expect(evaluateAppMount(connector)).toEqual({
      mounted: false,
      blocker: "needs-integration",
    });
  });

  // The two fail-closed cases name no cause: the data needed to explain the row
  // is exactly the data that is missing.
  it("skips a connector whose configuration has no type without naming a cause", () => {
    expect(evaluateAppMount(makeDataConnector({ configuration: {} }))).toEqual({
      mounted: false,
      blocker: "indeterminate",
    });
  });

  it("skips a connector with no sensitive-field list without naming a cause", () => {
    const connector = makeDataConnector();
    // Fail-closed: an absent list is unknown, not empty.
    delete (connector.storage as { sensitive_fields?: unknown })
      .sensitive_fields;

    expect(evaluateAppMount(connector)).toEqual({
      mounted: false,
      blocker: "indeterminate",
    });
  });

  // The blocker is the first condition tripped, matching the backend's check
  // order, so a row never has to present two causes at once.
  it("reports only the first blocker when a connector trips several", () => {
    expect(
      evaluateAppMount(
        makeDataConnector({
          configuration: { type: "drive" },
          sensitiveFields: [SECRET_FIELD],
          visibility: "private",
        }),
      ),
    ).toEqual({ mounted: false, blocker: "not-public" });
  });
});

describe("listDataConnectorsForApp", () => {
  it("keeps every connector, mounted ones first, order preserved within each group", () => {
    const publicS3 = makeDataConnector({ name: "public-s3" });
    const privateS3 = makeDataConnector({
      name: "private-s3",
      visibility: "private",
    });
    const publicDrive = makeDataConnector({
      configuration: { type: "drive" },
      name: "public-drive",
    });
    const publicAzure = makeDataConnector({
      configuration: { type: "azureblob" },
      name: "public-azure",
    });

    const listed = listDataConnectorsForApp([
      publicS3,
      privateS3,
      publicDrive,
      publicAzure,
    ]);

    expect(
      listed.map(({ dataConnector, mountState }) => [
        dataConnector.name,
        mountState,
      ]),
    ).toEqual([
      ["public-s3", { mounted: true }],
      ["public-azure", { mounted: true }],
      ["private-s3", { mounted: false, blocker: "not-public" }],
      ["public-drive", { mounted: false, blocker: "needs-integration" }],
    ]);
  });

  // Every row carries a state, so the panel never has to treat a missing one as
  // "mounted" — that is what distinguishes an app's list from a session's.
  it("gives every connector a mount state, including when none qualify", () => {
    const listed = listDataConnectorsForApp([
      makeDataConnector({ name: "private-s3", visibility: "private" }),
      makeDataConnector({
        name: "with-secret",
        sensitiveFields: [SECRET_FIELD],
      }),
    ]);

    expect(listed.map(({ mountState }) => mountState)).toEqual([
      { mounted: false, blocker: "not-public" },
      { mounted: false, blocker: "needs-credentials" },
    ]);
  });

  it("returns an empty list for a project with no connectors", () => {
    expect(listDataConnectorsForApp([])).toEqual([]);
  });
});
