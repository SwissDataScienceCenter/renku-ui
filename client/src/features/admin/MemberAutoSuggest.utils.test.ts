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

import { buildTypeScopedSearchQuery } from "./MemberAutoSuggest.utils";

describe("buildTypeScopedSearchQuery", () => {
  it("prefixes the search term with a Group type filter", () => {
    expect(buildTypeScopedSearchQuery("acme", "Group")).toBe("type:Group acme");
  });

  it("prefixes the search term with a Project type filter", () => {
    expect(buildTypeScopedSearchQuery("my-project", "Project")).toBe(
      "type:Project my-project",
    );
  });

  it("preserves multi-word search terms", () => {
    expect(buildTypeScopedSearchQuery("hello world", "Group")).toBe(
      "type:Group hello world",
    );
  });

  it("trims trailing whitespace when the search term is empty", () => {
    expect(buildTypeScopedSearchQuery("", "Project")).toBe("type:Project");
  });
});
