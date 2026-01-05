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

import { doiFromUrl } from "./dataConnectorUtils";

describe("Test doiFromUrl", () => {
  it("handles zenodo", () => {
    expect(doiFromUrl("https://zenodo.org/records/12345")).toBe(
      "10.5281/zenodo.12345"
    );
  });

  it("handles dataverse", () => {
    expect(
      doiFromUrl("https://dataverse.org/?persistentId=doi:10.1234/dataverse")
    ).toBe("10.1234/dataverse");
  });
  it("returns other input unchanged", () => {
    expect(doiFromUrl("https://example.com/some/path")).toBe(
      "https://example.com/some/path"
    );
    // eslint-disable-next-line spellcheck/spell-checker
    expect(doiFromUrl("10.1000/xyz123")).toBe("10.1000/xyz123");
  });
});
