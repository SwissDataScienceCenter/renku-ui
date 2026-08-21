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
  appWillMount,
  partitionDataConnectorsForApp,
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

describe("appWillMount", () => {
  it("mounts a public connector with no secrets and a plain storage type", () => {
    expect(appWillMount(makeDataConnector())).toBe(true);
  });

  it("skips a private connector", () => {
    expect(appWillMount(makeDataConnector({ visibility: "private" }))).toBe(
      false,
    );
  });

  it("skips a public connector that carries static credentials", () => {
    expect(
      appWillMount(makeDataConnector({ sensitiveFields: [SECRET_FIELD] })),
    ).toBe(false);
  });

  // The load-bearing case, and the reason the OAuth set has to be duplicated at
  // all: an OAuth connector has no static secret fields, so the sensitive-field
  // check alone would wave a user's private Drive through.
  it.each(["drive", "dropbox"])(
    "skips a public %s connector even with no sensitive fields",
    (storageType) => {
      expect(
        appWillMount(
          makeDataConnector({
            configuration: { type: storageType },
            sensitiveFields: [],
          }),
        ),
      ).toBe(false);
    },
  );

  // The backend predicate reads configuration["type"]; storage_type records
  // where a DOI-derived connector came from and can disagree with it.
  it("reads the storage type from the configuration, not from storage_type", () => {
    const connector = makeDataConnector({ configuration: { type: "drive" } });
    connector.storage.storage_type = "doi";

    expect(appWillMount(connector)).toBe(false);
  });

  it("skips a connector whose configuration has no type", () => {
    expect(appWillMount(makeDataConnector({ configuration: {} }))).toBe(false);
  });

  it("skips a connector with no sensitive-field list at all", () => {
    const connector = makeDataConnector();
    // Fail-closed: an absent list is unknown, not empty.
    delete (connector.storage as { sensitive_fields?: unknown })
      .sensitive_fields;

    expect(appWillMount(connector)).toBe(false);
  });
});

describe("partitionDataConnectorsForApp", () => {
  it("splits connectors while preserving their order in each half", () => {
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

    const { mounted, skipped } = partitionDataConnectorsForApp([
      publicS3,
      privateS3,
      publicDrive,
      publicAzure,
    ]);

    expect(mounted.map(({ name }) => name)).toEqual([
      "public-s3",
      "public-azure",
    ]);
    expect(skipped.map(({ name }) => name)).toEqual([
      "private-s3",
      "public-drive",
    ]);
  });

  it("returns two empty halves for a project with no connectors", () => {
    expect(partitionDataConnectorsForApp([])).toEqual({
      mounted: [],
      skipped: [],
    });
  });
});
