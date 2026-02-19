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

import {
  DEFAULT_CREATION_DATE_FILTER,
  DEFAULT_ROLE_FILTER,
  DEFAULT_TYPE_FILTER,
  DEFAULT_VISIBILITY_FILTER,
} from "./searchV2.constants";
import { buildSearchQuery, parseSearchQuery } from "./searchV2.utils";

describe("Renku 2.0 search utilities", () => {
  describe("parseSearchQuery()", () => {
    it("parses the empty string", () => {
      const { canonicalQuery, dateFilters, filters, searchBarQuery } =
        parseSearchQuery("");

      expect(canonicalQuery).toBe("");
      expect(searchBarQuery).toBe("");

      expect(dateFilters.created.value).toStrictEqual({});

      expect(filters.role.values).toStrictEqual([]);
      expect(filters.type.values).toStrictEqual([]);
      expect(filters.visibility.values).toStrictEqual([]);
    });

    it("parses a query with filters", () => {
      const query =
        "role:editor type:group,user visibility:private created>today-31d test";
      const { canonicalQuery, dateFilters, filters, searchBarQuery } =
        parseSearchQuery(query);

      expect(canonicalQuery).toBe(query);
      expect(searchBarQuery).toBe("test");

      expect(dateFilters.created.value).toStrictEqual({ after: "today-31d" });

      expect(filters.role.values).toStrictEqual(["editor"]);
      expect(filters.type.values).toStrictEqual(["group", "user"]);
      expect(filters.visibility.values).toStrictEqual(["private"]);
    });
  });

  describe("buildSearchQuery()", () => {
    it("builds the empty query", () => {
      const result = buildSearchQuery({
        dateFilters: {
          created: DEFAULT_CREATION_DATE_FILTER,
        },
        filters: {
          role: DEFAULT_ROLE_FILTER,
          type: DEFAULT_TYPE_FILTER,
          visibility: DEFAULT_VISIBILITY_FILTER,
        },
        searchBarQuery: "",
      });

      expect(result).toBe("");
    });

    it("builds a complex query", () => {
      const result = buildSearchQuery({
        dateFilters: {
          created: {
            key: "created",
            value: {
              before: "today-90d",
            },
          },
        },
        filters: {
          role: { key: "role", values: ["editor"] },
          type: { key: "type", values: ["group", "user"] },
          visibility: { key: "visibility", values: ["private"] },
        },
        searchBarQuery: "test",
      });

      expect(result).toBe(
        "role:editor type:group,user visibility:private created<today-90d test"
      );
    });
  });
});
