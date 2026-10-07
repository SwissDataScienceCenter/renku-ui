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

import type { DataConnectorToProjectLink } from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  getExcludedSecretSlotIds,
  getIncludedDataConnectorIds,
  isLauncherResourceIncluded,
  resolveDataConnectorAccessPolicy,
  resolveSecretAccessPolicy,
} from "./launcherResources.constants";

describe("isLauncherResourceIncluded", () => {
  it("keeps resources with no saved policy", () => {
    expect(isLauncherResourceIncluded(undefined)).toBe(true);
  });

  it("keeps included data connector and secret policies", () => {
    expect(isLauncherResourceIncluded("readOnly")).toBe(true);
    expect(isLauncherResourceIncluded("readWrite")).toBe(true);
    expect(isLauncherResourceIncluded("included")).toBe(true);
  });

  it("drops an explicit excluded policy", () => {
    expect(isLauncherResourceIncluded("excluded")).toBe(false);
  });
});

describe("getIncludedDataConnectorIds", () => {
  const links = [
    { id: "link-included", data_connector_id: "connector-included" },
    { id: "link-excluded", data_connector_id: "connector-excluded" },
    { id: "link-default", data_connector_id: "connector-default" },
  ] as DataConnectorToProjectLink[];

  it("returns undefined until both lists are loaded", () => {
    expect(getIncludedDataConnectorIds(undefined, [])).toBeUndefined();
    expect(getIncludedDataConnectorIds(links, undefined)).toBeUndefined();
  });

  it("drops only connectors whose saved policy is excluded", () => {
    expect(
      getIncludedDataConnectorIds(links, [
        { data_connector_link_id: "link-included", policy: "readOnly" },
        { data_connector_link_id: "link-excluded", policy: "excluded" },
      ]),
    ).toEqual(["connector-included", "connector-default"]);
  });

  it("returns an empty list when every connector is excluded", () => {
    expect(
      getIncludedDataConnectorIds(
        [
          { id: "link-excluded", data_connector_id: "connector-excluded" },
        ] as DataConnectorToProjectLink[],
        [{ data_connector_link_id: "link-excluded", policy: "excluded" }],
      ),
    ).toEqual([]);
  });
});

describe("resolveDataConnectorAccessPolicy", () => {
  it("defaults a read-only connector with no saved policy to read-only", () => {
    expect(resolveDataConnectorAccessPolicy(true, undefined)).toBe("readOnly");
  });

  it("downgrades a saved read-write policy on a read-only connector", () => {
    expect(resolveDataConnectorAccessPolicy(true, "readWrite")).toBe(
      "readOnly",
    );
  });

  it("keeps an explicit excluded policy on a read-only connector", () => {
    expect(resolveDataConnectorAccessPolicy(true, "excluded")).toBe("excluded");
  });
});

describe("resolveSecretAccessPolicy", () => {
  it("defaults a secret with no saved policy to included", () => {
    expect(resolveSecretAccessPolicy(undefined)).toBe("included");
  });
});

describe("getExcludedSecretSlotIds", () => {
  it("returns undefined until policies are loaded", () => {
    expect(getExcludedSecretSlotIds(undefined)).toBeUndefined();
  });

  it("collects only excluded secret slots", () => {
    expect(
      getExcludedSecretSlotIds([
        { secret_slot_id: "slot-included", policy: "included" },
        { secret_slot_id: "slot-excluded", policy: "excluded" },
      ]),
    ).toEqual(new Set(["slot-excluded"]));
  });
});
