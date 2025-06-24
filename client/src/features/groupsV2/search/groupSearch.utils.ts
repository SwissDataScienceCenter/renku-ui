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
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SearchQuery } from "~/features/searchV2/api/searchV2Api.generated-api";
import {
  KEY_VALUE_SEPARATOR,
  TERM_SEPARATOR,
} from "../../../features/searchV2/searchV2.constants";

// TYPES
interface FilterValue {
  value: string;
  label: string;
}

type FilterType = "string" | "enum" | "number";

interface BaseFilter {
  name: string;
  label: string;
  type: FilterType;
}

interface StringFilter extends BaseFilter {
  type: "string";
  defaultValue?: string;
}

interface EnumFilter extends BaseFilter {
  type: "enum";
  allowedValues: FilterValue[];
  defaultValue?: string;
}

interface NumberFilter extends BaseFilter {
  type: "number";
  maxValues?: number;
  minValues?: number;
  defaultValue?: number;
}

export type Filter = StringFilter | EnumFilter | NumberFilter;

// CONSTANTS
const FILTER_PAGE: NumberFilter = {
  name: "page",
  label: "Page",
  type: "number",
  defaultValue: 1,
  minValues: 1,
};

const FILTER_PER_PAGE: NumberFilter = {
  name: "perPage",
  label: "Per page",
  type: "number",
  defaultValue: 10,
  minValues: 1,
  maxValues: 100,
};

const FILTER_QUERY: StringFilter = {
  name: "q",
  label: "Query",
  type: "string",
  defaultValue: "",
};

const FILTER_CONTENT: EnumFilter = {
  name: "type",
  label: "Content",
  type: "enum",
  allowedValues: [
    { value: "project", label: "Project" },
    { value: "dataconnector", label: "Data Connector" },
  ],
  defaultValue: "project",
};

const FILTER_MEMBER: StringFilter = {
  name: "member",
  label: "Group member",
  type: "string",
};

const FILTER_KEWORD: StringFilter = {
  name: "keyword",
  label: "Keyword",
  type: "string",
};

const FILTER_VISIBILITY: EnumFilter = {
  name: "visibility",
  label: "Visibility",
  type: "enum",
  allowedValues: [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ],
};

const COMMON_FILTERS: Filter[] = [
  FILTER_CONTENT,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
];

export const PROJECT_FILTERS: Filter[] = [
  FILTER_MEMBER,
  FILTER_KEWORD,
  FILTER_VISIBILITY,
];

export const DATACONNECTORS_FILTERS: Filter[] = [
  FILTER_KEWORD,
  FILTER_VISIBILITY,
];

export type SearchQueryFilters = Partial<Record<string, string | number>>;

// export function parseSearchQuery(searchParams: URLSearchParams) {
//   getSearchQueryFilters(searchParams, COMMON_FILTERS);
// }

export function getSearchQueryFilters(
  searchParams: URLSearchParams,
  filters: Filter[] = COMMON_FILTERS
): SearchQueryFilters {
  return filters.reduce<SearchQueryFilters>((acc, filter) => {
    const raw = searchParams.get(filter.name);
    if (raw !== null) {
      acc[filter.name] = filter.type === "number" ? Number(raw) : raw;
    }
    return acc;
  }, {});
}

export function getSearchQueryMissingFilters(
  searchParams: URLSearchParams,
  filters: Filter[] = COMMON_FILTERS
): SearchQueryFilters {
  const existing = getSearchQueryFilters(searchParams, filters);
  return filters.reduce<SearchQueryFilters>((acc, filter) => {
    if (
      existing[filter.name] === undefined &&
      filter.defaultValue !== undefined
    ) {
      acc[filter.name] = filter.defaultValue;
    }
    return acc;
  }, {});
}

export function generateQueryParams(
  searchParams: URLSearchParams
): SearchQuery {
  const commonFilters = getSearchQueryFilters(searchParams, COMMON_FILTERS);
  // const specificFilters = getSearchQueryFilters(
  //   searchParams,
  //   searchParams.get("type") === "dataconnector"
  //     ? DATACONNECTORS_FILTERS
  //     : PROJECT_FILTERS
  // );
  const queryFilters = getSearchQueryFilters(searchParams, [
    FILTER_CONTENT,
    ...(searchParams.get("type") === "dataconnector"
      ? DATACONNECTORS_FILTERS
      : PROJECT_FILTERS),
  ]);

  const queryFiltersProcessed = Object.entries(queryFilters).reduce<string[]>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc = [...acc, `${key}${KEY_VALUE_SEPARATOR}${value}`];
      }
      return acc;
    },
    []
  );

  const query = [
    ...queryFiltersProcessed,
    commonFilters[FILTER_QUERY.name],
  ].join(TERM_SEPARATOR);
  return {
    q: query,
    page: (commonFilters[FILTER_PAGE.name] ??
      (FILTER_PAGE.defaultValue as number)) as number,
    per_page: (commonFilters[FILTER_PER_PAGE.name] ??
      FILTER_PER_PAGE.defaultValue) as number,
  };
}
