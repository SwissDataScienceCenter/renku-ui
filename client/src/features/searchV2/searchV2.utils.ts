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
 * limitations under the License
 */

import { SearchV2State, SortingItems } from "./searchV2.types";

export const AVAILABLE_FILTERS = {
  role: {
    creator: "Creator",
    member: "Member",
    none: "None",
  },
  type: {
    project: "Project",
    user: "User",
  },
  visibility: {
    private: "Private",
    public: "Public",
  },
};

export const ANONYMOUS_USERS_EXCLUDE_FILTERS: (keyof typeof AVAILABLE_FILTERS)[] =
  ["visibility"];

export const AVAILABLE_SORTING: SortingItems = {
  scoreDesc: {
    friendlyName: "Best match",
    sortingString: "score-desc",
  },
  dateDesc: {
    friendlyName: "Recently created",
    sortingString: "date-desc",
  },
  dateAsc: {
    friendlyName: "Older",
    sortingString: "date-asc",
  },
  titleAsc: {
    friendlyName: "Title: alphabetical",
    sortingString: "title-asc",
  },
  titleDesc: {
    friendlyName: "Title: reverse",
    sortingString: "title-desc",
  },
};

export const SORT_KEY = "sort";

export const FILTER_ASSIGNMENT_CHAR = ":";

export const buildSearchQuery = (searchState: SearchV2State): string => {
  const query = searchState.search.query;
  const searchQueryItems: string[] = [];

  // Add sorting unless already re-defined by the user
  const sortPrefix = `${SORT_KEY}${FILTER_ASSIGNMENT_CHAR}`;
  if (!query.includes(sortPrefix))
    searchQueryItems.push(`${sortPrefix}${searchState.sorting.sortingString}`);

  for (const filterName in searchState.filters) {
    const filter =
      searchState.filters[filterName as keyof SearchV2State["filters"]];
    const filterPrefix = `${filterName}${FILTER_ASSIGNMENT_CHAR}`;

    // Exclude empty filters and filters where all members are selected
    if (
      filter.length > 0 &&
      filter.length <
        Object.keys(
          AVAILABLE_FILTERS[filterName as keyof SearchV2State["filters"]]
        ).length &&
      !query.includes(filterPrefix)
    ) {
      searchQueryItems.push(`${filterPrefix}${filter.join(",")}`);
    }
  }
  searchQueryItems.push(query);

  return searchQueryItems.join(" ");
};
