/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { toNumericRole } from "./roleUtils";

describe("Test toNumericRole", () => {
  it("ordering", () => {
    expect(toNumericRole("owner")).toBeGreaterThan(toNumericRole("editor"));
    expect(toNumericRole("owner")).toBeGreaterThan(toNumericRole("viewer"));
    expect(toNumericRole("owner")).toBeGreaterThan(toNumericRole("none"));
    expect(toNumericRole("editor")).toBeGreaterThan(toNumericRole("viewer"));
    expect(toNumericRole("editor")).toBeGreaterThan(toNumericRole("none"));
    expect(toNumericRole("viewer")).toBeGreaterThan(toNumericRole("none"));
  });

  it("conversion", () => {
    expect(toNumericRole("foo")).toEqual(toNumericRole("none"));
  });
});
