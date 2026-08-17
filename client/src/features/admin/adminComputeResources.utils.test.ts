/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { poolRequiresIntegerCpu } from "./adminComputeResources.utils";

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

  it("returns false when remote is null", () => {
    expect(poolRequiresIntegerCpu(null)).toBe(false);
  });

  it("returns false when remote is undefined", () => {
    expect(poolRequiresIntegerCpu(undefined)).toBe(false);
  });
});
