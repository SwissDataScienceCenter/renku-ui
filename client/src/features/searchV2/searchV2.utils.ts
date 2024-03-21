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

import { DateFilterTypes } from "../../components/dateFilter/DateFilter";
import {
  DateFilter,
  DateFilterItems,
  SearchV2State,
  SortingItems,
} from "./searchV2.types";

export const AVAILABLE_FILTERS = {
  role: {
    owner: "Owner",
    member: "Member",
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
    friendlyName: "Score: best match",
    sortingString: "score-desc",
  },
  dateDesc: {
    friendlyName: "Date: recently created",
    sortingString: "date-desc",
  },
  dateAsc: {
    friendlyName: "Date: older",
    sortingString: "date-asc",
  },
  titleAsc: {
    friendlyName: "Name: alphabetical",
    sortingString: "name-asc",
  },
  titleDesc: {
    friendlyName: "Name: reverse",
    sortingString: "name-desc",
  },
};

export const AVAILABLE_DATE_FILTERS: DateFilterItems = {
  all: {
    friendlyName: "All",
    getDateString: () => "",
  },
  lastWeek: {
    friendlyName: "Last Week",
    getDateString: (filter: string) => `${filter}>today-7d`,
  },
  lastMonth: {
    friendlyName: "Last Month",
    getDateString: (filter: string) => `${filter}>today-31d`,
  },
  last90days: {
    friendlyName: "Last 90 days",
    getDateString: (filter: string) => `${filter}>today-90d`,
  },
  older: {
    friendlyName: "Older",
    getDateString: (filter: string) => `${filter}>today+90d`,
  },
  custom: {
    friendlyName: "Custom",
    getDateString: (filter: string, from?: string, to?: string) => {
      const filters = [];
      if (from) filters.push(`${filter}>${from}-1d`);

      if (to) filters.push(`${filter}<${to}+1d`);
      return filters.join(" ");
    },
  },
};

const DATE_FILTERS = ["created"];

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
    if (DATE_FILTERS.includes(filterName) || filterName === "createdBy")
      continue;
    const filter = searchState.filters[
      filterName as keyof SearchV2State["filters"]
    ] as string[];
    const filterPrefix = `${filterName}${FILTER_ASSIGNMENT_CHAR}`;

    const totalAvailableFilters = Object.keys(
      AVAILABLE_FILTERS[filterName as "role" | "visibility" | "type"]
    ).length;
    // Exclude empty filters and filters where all members are selected
    if (
      filter.length > 0 &&
      filter.length < totalAvailableFilters &&
      !query.includes(filterPrefix)
    ) {
      searchQueryItems.push(`${filterPrefix}${filter.join(",")}`);
    }
  }

  // add date filters
  DATE_FILTERS.map((filter: string) => {
    const dateFilter = searchState.filters[
      filter as keyof SearchV2State["filters"]
    ] as DateFilter;
    if (dateFilter.option !== DateFilterTypes.all) {
      const dateStringFilter = AVAILABLE_DATE_FILTERS[
        dateFilter.option
      ].getDateString("created", dateFilter.from, dateFilter.to);
      searchQueryItems.push(dateStringFilter);
    }
  });

  // add createdBy filter
  if (searchState.filters.createdBy)
    searchQueryItems.push(`createdBy:${searchState.filters.createdBy}`);

  searchQueryItems.push(query);

  return searchQueryItems.join(" ");
};
