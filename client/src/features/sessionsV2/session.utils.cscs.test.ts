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

import type { ResourcePoolWithId } from "./api/computeResources.api";
import { hasSlurmAccount, isCscsResourcePool } from "./session.utils";

function firecrestPool(apiUrl: string): Pick<ResourcePoolWithId, "remote"> {
  return {
    remote: { kind: "firecrest", api_url: apiUrl, system_name: "system" },
  };
}

describe("isCscsResourcePool", () => {
  it.each([
    "https://api.cscs.ch/hpc/firecrest/v2",
    "https://cscs.ch/firecrest",
    "https://firecrest.hpc.cscs.ch:8443/",
  ])("is true for a firecrest pool on %s", (apiUrl) => {
    expect(isCscsResourcePool(firecrestPool(apiUrl))).toBe(true);
  });

  it.each([
    "https://firecrest.example.org",
    "https://notcscs.ch/firecrest",
    "https://cscs.ch.example.org/firecrest",
    "not a url",
  ])("is false for a firecrest pool on %s", (apiUrl) => {
    expect(isCscsResourcePool(firecrestPool(apiUrl))).toBe(false);
  });

  it("is false for non-firecrest or local pools", () => {
    expect(
      isCscsResourcePool({
        remote: { kind: "runai", base_url: "https://runai.cscs.ch" },
      }),
    ).toBe(false);
    expect(isCscsResourcePool({})).toBe(false);
    expect(isCscsResourcePool(undefined)).toBe(false);
  });
});

describe("hasSlurmAccount", () => {
  it("is true when SLURM_ACCOUNT has a value", () => {
    expect(
      hasSlurmAccount({
        env_variables: [{ name: "SLURM_ACCOUNT", value: "g159" }],
      }),
    ).toBe(true);
  });

  it.each([
    { env_variables: undefined },
    { env_variables: [] },
    { env_variables: [{ name: "SLURM_ACCOUNT" }] },
    { env_variables: [{ name: "SLURM_ACCOUNT", value: "  " }] },
    { env_variables: [{ name: "slurm_account", value: "g159" }] },
    { env_variables: [{ name: "OTHER", value: "g159" }] },
  ])("is false for %j", (launcher) => {
    expect(hasSlurmAccount(launcher)).toBe(false);
  });
});
