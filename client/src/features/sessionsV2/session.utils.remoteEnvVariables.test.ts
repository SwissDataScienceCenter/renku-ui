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
import type { RemotePoolRequiredEnvVariable } from "./session.constants";
import {
  applyEnvVariableOverrides,
  getEnvVariableOverridesFromSearchParams,
  getMissingRequiredEnvVariables,
  getRequiredEnvVariables,
  getResourcePoolRemoteKind,
  isEnvVariableSet,
  matchesRemotePool,
} from "./session.utils";
import { remotePoolNeedsAttention } from "./sessionLaunchValidation.utils";

type Pool = Pick<ResourcePoolWithId, "remote">;

function firecrestPool(apiUrl: string): Pool {
  return {
    remote: { kind: "firecrest", api_url: apiUrl, system_name: "system" },
  };
}

function runaiPool(baseUrl: string): Pool {
  return { remote: { kind: "runai", base_url: baseUrl } };
}

const CSCS_MATCH = { kind: "firecrest", apiDomain: "cscs.ch" } as const;

describe("matchesRemotePool", () => {
  it.each([
    "https://api.cscs.ch/hpc/firecrest/v2",
    "https://cscs.ch/firecrest",
    "https://firecrest.hpc.cscs.ch:8443/",
  ])("matches a firecrest pool on %s", (apiUrl) => {
    expect(matchesRemotePool(firecrestPool(apiUrl), CSCS_MATCH)).toBe(true);
  });

  it.each([
    "https://firecrest.example.org",
    "https://notcscs.ch/firecrest",
    "https://cscs.ch.example.org/firecrest",
    "not a url",
  ])("does not match a firecrest pool on %s", (apiUrl) => {
    expect(matchesRemotePool(firecrestPool(apiUrl), CSCS_MATCH)).toBe(false);
  });

  it("does not match a different kind, or local pools", () => {
    expect(
      matchesRemotePool(runaiPool("https://runai.cscs.ch"), CSCS_MATCH),
    ).toBe(false);
    expect(matchesRemotePool({}, CSCS_MATCH)).toBe(false);
    expect(matchesRemotePool(undefined, CSCS_MATCH)).toBe(false);
  });

  it("uses the base URL for runai pools", () => {
    expect(
      matchesRemotePool(runaiPool("https://runai.example.org"), {
        kind: "runai",
        apiDomain: "example.org",
      }),
    ).toBe(true);
  });
});

describe("getResourcePoolRemoteKind", () => {
  it("uses the remote kind, then the cluster, and is null for local pools", () => {
    expect(getResourcePoolRemoteKind(firecrestPool("https://a.b"))).toBe(
      "firecrest",
    );
    expect(getResourcePoolRemoteKind(runaiPool("https://a.b"))).toBe("runai");
    expect(
      getResourcePoolRemoteKind({ cluster_id: "01JEXAMPLECLUSTER0000000000" }),
    ).toBe("cluster");
    expect(getResourcePoolRemoteKind({})).toBeNull();
    expect(getResourcePoolRemoteKind(undefined)).toBeNull();
  });
});

describe("isEnvVariableSet", () => {
  it("is true when the variable has a value", () => {
    expect(
      isEnvVariableSet(
        { env_variables: [{ name: "SLURM_ACCOUNT", value: "g159" }] },
        "SLURM_ACCOUNT",
      ),
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
    expect(isEnvVariableSet(launcher, "SLURM_ACCOUNT")).toBe(false);
  });
});

describe("required environment variables", () => {
  const requirements: RemotePoolRequiredEnvVariable[] = [
    {
      match: CSCS_MATCH,
      platformName: "CSCS",
      name: "SLURM_ACCOUNT",
      valueDescription: "your CSCS project",
    },
    {
      match: { kind: "runai", apiDomain: "example.org" },
      platformName: "Example",
      name: "EXAMPLE_PROJECT",
      valueDescription: "your Example project",
    },
  ];
  const cscsPool = firecrestPool("https://api.cscs.ch/firecrest");

  it("selects only the requirements matching the pool", () => {
    expect(
      getRequiredEnvVariables(cscsPool, requirements).map(({ name }) => name),
    ).toEqual(["SLURM_ACCOUNT"]);
    expect(
      getRequiredEnvVariables(
        runaiPool("https://runai.example.org"),
        requirements,
      ).map(({ name }) => name),
    ).toEqual(["EXAMPLE_PROJECT"]);
    expect(getRequiredEnvVariables({}, requirements)).toEqual([]);
  });

  it("reports the required variables the launcher does not set", () => {
    expect(
      getMissingRequiredEnvVariables(
        { env_variables: [] },
        cscsPool,
        requirements,
      ).map(({ name }) => name),
    ).toEqual(["SLURM_ACCOUNT"]);
    expect(
      getMissingRequiredEnvVariables(
        { env_variables: [{ name: "SLURM_ACCOUNT", value: "g159" }] },
        cscsPool,
        requirements,
      ),
    ).toEqual([]);
  });

  it("includes the CSCS SLURM_ACCOUNT rule by default", () => {
    expect(
      getMissingRequiredEnvVariables({ env_variables: [] }, cscsPool).map(
        ({ name }) => name,
      ),
    ).toEqual(["SLURM_ACCOUNT"]);
  });
});

describe("launch-time environment variable overrides", () => {
  it("reads valid variable names from the launch URL", () => {
    expect(
      getEnvVariableOverridesFromSearchParams(
        new URLSearchParams("SLURM_ACCOUNT=g159&RENKU_FOO=bar"),
      ),
    ).toEqual([{ name: "SLURM_ACCOUNT", value: "g159" }]);
  });

  it("lets overrides replace or add to the launcher variables", () => {
    expect(
      applyEnvVariableOverrides(
        [
          { name: "SLURM_ACCOUNT", value: "" },
          { name: "OTHER", value: "1" },
        ],
        [{ name: "SLURM_ACCOUNT", value: "g159" }],
      ),
    ).toEqual([
      { name: "OTHER", value: "1" },
      { name: "SLURM_ACCOUNT", value: "g159" },
    ]);
    expect(
      applyEnvVariableOverrides(undefined, [{ name: "A", value: "1" }]),
    ).toEqual([{ name: "A", value: "1" }]);
  });
});

describe("remotePoolNeedsAttention", () => {
  const missing: RemotePoolRequiredEnvVariable[] = [
    {
      match: CSCS_MATCH,
      platformName: "CSCS",
      name: "SLURM_ACCOUNT",
      valueDescription: "your CSCS project",
    },
  ];

  it("needs attention for missing variables or a confirmed image mismatch", () => {
    expect(remotePoolNeedsAttention(missing, true)).toBe(true);
    expect(remotePoolNeedsAttention([], false)).toBe(true);
  });

  it("does not block when everything matches or the image is unknown", () => {
    expect(remotePoolNeedsAttention([], true)).toBe(false);
    expect(remotePoolNeedsAttention([], undefined)).toBe(false);
  });
});
