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
import type { Role } from "../projectsV2/api/projectV2.api";
import { DEFAULT_SORTING_OPTION, SORTING_OPTIONS } from "./searchV2.constants";
import type {
  DateFilter,
  DateFilterItems,
  SearchEntityType,
  SearchV2State,
  SearchV2StateV2,
  SortingItems,
  SortingOption,
} from "./searchV2.types";

const ROLE_FILTER: { [key in Role]: string } = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
};

export const AVAILABLE_FILTERS = {
  // role: ROLE_FILTER,
  // type: {
  //   project: "Project",
  //   group: "Group",
  //   user: "User",
  // },
  // visibility: {
  //   private: "Private",
  //   public: "Public",
  // },
};

export const ANONYMOUS_USERS_EXCLUDE_FILTERS: (keyof typeof AVAILABLE_FILTERS)[] =
  []; //["visibility", "role"];

export const AVAILABLE_SORTING: SortingItems = {
  scoreDesc: {
    friendlyName: "Score: best match",
    sortingString: "score-desc",
  },
  dateDesc: {
    friendlyName: "Date: recently created",
    sortingString: "created-desc",
  },
  dateAsc: {
    friendlyName: "Date: older",
    sortingString: "created-asc",
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
      AVAILABLE_FILTERS[filterName as never /*"role" | "visibility" | "type"*/]
    ).length;
    // Exclude empty filters and filters where all members are selected, only role should add the filter even if both are selected
    if (
      filter.length > 0 &&
      (filter.length < totalAvailableFilters || filterName == "role") &&
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

  if (query) {
    searchQueryItems.push(query);
  }

  return searchQueryItems.join(" ");
};

export function parseSearchQuery(query: string) {
  const terms = query
    .split(" ")
    .filter((term) => term != "")
    .map(parseTerm);

  // Retain the last filter value only
  const typeFilterOption = [...terms].reverse().find(isTypeFilterInterpretation)
    ?.interpretation.values;

  // Retain the last sorting option only
  const sortingOption = [...terms].reverse().find(isSortingInterpretation)
    ?.interpretation?.sortingOption;

  const uninterpretedTerms = terms
    .filter(({ interpretation }) => interpretation == null)
    .map(({ term }) => term);

  const canonicalQuery = [
    // TODO
    ...(sortingOption && sortingOption.key !== DEFAULT_SORTING_OPTION.key
      ? [asQueryTerm(sortingOption)]
      : []),
    ...uninterpretedTerms,
  ].join(" ");

  const searchBarQuery = uninterpretedTerms.join(" ");

  return { canonicalQuery, searchBarQuery, sortingOption };
}

function parseTerm(term: string): InterpretedTerm {
  const termLower = term.toLowerCase();

  if (termLower.startsWith(`${SORT_KEY}:`)) {
    const sortValue = termLower.slice(SORT_KEY.length + 1);
    const matched = SORTING_OPTIONS.find((option) => option.key === sortValue);
    if (matched) {
      return {
        term,
        interpretation: {
          key: "sort",
          sortingOption: matched,
        },
      };
    }
  }

  return {
    term,
    interpretation: null,
  };
}

interface InterpretedTerm {
  term: string;
  interpretation: Interpretation | null;
}

type Interpretation = TypeFilterInterpretation | SortingInterpretation;

interface TypeFilterInterpretation {
  key: "type";
  values: Set<SearchEntityType>;
}

interface SortingInterpretation {
  key: "sort";
  sortingOption: SortingOption;
}

function isTypeFilterInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: TypeFilterInterpretation } {
  return term.interpretation?.key === "type";
}

function isSortingInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: SortingInterpretation } {
  return term.interpretation?.key === "sort";
}

function asQueryTerm(filter: SortingOption): string {
  return `${SORT_KEY}:${filter.key}`;
}

export function buildSearchQuery2(
  state: Pick<SearchV2StateV2, "searchBarQuery" | "sort">
): string {
  const { searchBarQuery, sort } = state;

  const draftQuery = [
    ...(sort && sort.key !== DEFAULT_SORTING_OPTION.key
      ? [asQueryTerm(sort)]
      : []),
    searchBarQuery,
  ].join(" ");

  const { canonicalQuery } = parseSearchQuery(draftQuery);

  return canonicalQuery;
}
