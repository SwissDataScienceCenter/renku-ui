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

import { buildSearchQuery } from "./searchV2.utils";
import { SearchV2State } from "./searchV2.types";
import { DateFilterTypes } from "../../components/dateFilter/DateFilter.tsx";

describe("Test the searchV2.utils functions", () => {
  it("function buildSearchQuery ", () => {
    const searchState: SearchV2State = {
      filters: {
        role: [],
        type: [],
        visibility: [],
        created: {
          option: DateFilterTypes.all,
        },
        createdBy: "",
      },
      search: {
        history: [],
        lastSearch: "something else",
        outdated: false,
        page: 1,
        perPage: 10,
        query: "test",
        totalPages: 0,
        totalResults: 0,
      },
      sorting: {
        friendlyName: "Best match",
        sortingString: "score-desc",
      },
    };

    // Adds sorting to the default string
    expect(buildSearchQuery(searchState)).toEqual("sort:score-desc test");

    // Adds filters to the default string
    searchState.filters = {
      role: ["creator", "member"],
      type: ["project"],
      visibility: ["private"],
      created: {
        option: DateFilterTypes.all,
      },
      createdBy: "",
    };
    expect(buildSearchQuery(searchState)).toEqual(
      "sort:score-desc role:creator,member type:project visibility:private test"
    );

    // Let users override sorting
    searchState.search.query = "test sort:name-asc";
    expect(buildSearchQuery(searchState)).toEqual(
      "role:creator,member type:project visibility:private test sort:name-asc"
    );

    // Let users override filters
    searchState.search.query = "test sort:name-desc type:user role:none";
    expect(buildSearchQuery(searchState)).toEqual(
      "visibility:private test sort:name-desc type:user role:none"
    );

    //Update date filter
    searchState.filters.created.option = DateFilterTypes.last90days;
    expect(buildSearchQuery(searchState)).toEqual(
      "visibility:private created>today-90d test sort:name-desc type:user role:none"
    );

    //Update createdBy filter
    searchState.filters.createdBy = "abc";
    expect(buildSearchQuery(searchState)).toEqual(
      "visibility:private created>today-90d createdBy:abc test sort:name-desc type:user role:none"
    );
  });
});
