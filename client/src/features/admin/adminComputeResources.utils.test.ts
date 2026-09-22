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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest";

import {
  buildResourceClassRemote,
  buildResourceFlavour,
  buildResourceFlavourPatch,
  poolRequiresIntegerCpu,
} from "./adminComputeResources.utils";

const FLAVOUR_FORM = {
  name: "  small  ",
  description: "",
  cpu: 1.5,
  memory: 8,
  gpu: 0,
  default_storage: 20,
  max_storage: 200,
};

describe("poolRequiresIntegerCpu", () => {
  it("returns true for a firecrest remote configuration", () => {
    expect(poolRequiresIntegerCpu({ kind: "firecrest" })).toBe(true);
  });

  it("returns false for a runai remote configuration", () => {
    expect(poolRequiresIntegerCpu({ kind: "runai" })).toBe(false);
  });

  it("returns false when no remote kind is selected", () => {
    expect(poolRequiresIntegerCpu({ kind: null })).toBe(false);
  });

  it("returns false when remote is undefined", () => {
    expect(poolRequiresIntegerCpu(undefined)).toBe(false);
  });
});

/* eslint-disable spellcheck/spell-checker */
describe("buildResourceClassRemote", () => {
  it("omits system_name and partition when both are empty strings", () => {
    expect(
      buildResourceClassRemote(
        { systemName: "", partition: "", forwardResourceValues: false },
        true,
      ),
    ).toEqual({ forward_resource_values: false });
  });

  it("returns the full snake_case payload when all fields are populated", () => {
    expect(
      buildResourceClassRemote(
        {
          systemName: "eiger",
          partition: "normal",
          forwardResourceValues: true,
        },
        true,
      ),
    ).toEqual({
      system_name: "eiger",
      partition: "normal",
      forward_resource_values: true,
    });
  });

  it("trims whitespace and omits an empty partition", () => {
    expect(
      buildResourceClassRemote(
        {
          systemName: "  eiger  ",
          partition: "",
          forwardResourceValues: false,
        },
        true,
      ),
    ).toEqual({
      system_name: "eiger",
      forward_resource_values: false,
    });
  });

  it("returns undefined when the pool is not firecrest", () => {
    expect(
      buildResourceClassRemote(
        {
          systemName: "eiger",
          partition: "normal",
          forwardResourceValues: true,
        },
        false,
      ),
    ).toBeUndefined();
  });
});
/* eslint-enable spellcheck/spell-checker */

describe("buildResourceFlavour", () => {
  it("omits an empty description", () => {
    expect(buildResourceFlavour(FLAVOUR_FORM)).toEqual({
      name: "small",
      cpu: 1.5,
      memory: 8,
      gpu: 0,
      default_storage: 20,
      max_storage: 200,
    });
  });

  it("keeps a description and coerces the numbers", () => {
    expect(
      buildResourceFlavour({
        ...FLAVOUR_FORM,
        description: " fits a node ",
        cpu: "2.5" as unknown as number,
        memory: "16" as unknown as number,
      }),
    ).toEqual({
      name: "small",
      description: "fits a node",
      cpu: 2.5,
      memory: 16,
      gpu: 0,
      default_storage: 20,
      max_storage: 200,
    });
  });
});

describe("buildResourceFlavourPatch", () => {
  it("sends an empty description, which the API reads as a reset", () => {
    expect(buildResourceFlavourPatch(FLAVOUR_FORM)).toEqual({
      name: "small",
      description: "",
      cpu: 1.5,
      memory: 8,
      gpu: 0,
      default_storage: 20,
      max_storage: 200,
    });
  });
});
