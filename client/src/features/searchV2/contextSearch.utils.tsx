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

import { ReactNode } from "react";

import type { SearchQuery } from "~/features/searchV2/api/searchV2Api.api";
import {
  ALL_FILTERS,
  COMMON_FILTERS,
  DATACONNECTORS_FILTERS,
  DATE_FILTER_CUSTOM_SEPARATOR,
  DEFAULT_INCLUDE_COUNTS,
  FILTER_CONTENT,
  FILTER_DATE,
  FILTER_MY_ROLE,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
  FILTER_VISIBILITY,
  NAMESPACE_FILTER,
  PROJECT_FILTERS,
  SELECTABLE_FILTERS,
  VALUE_SEPARATOR_AND,
  VALUE_SEPARATOR_OR,
} from "./contextSearch.constants";
import type {
  Filter,
  FilterWithValue,
  SearchQueryFilters,
} from "./contextSearch.types";
import { KEY_VALUE_SEPARATOR, TERM_SEPARATOR } from "./searchV2.constants";
import type {
  CreationDateFilter,
  ParseSearchQueryResult,
} from "./searchV2.types";

export function getSearchQueryFilters(
  searchParams: URLSearchParams,
  filters: Filter[] = COMMON_FILTERS
): SearchQueryFilters {
  return filters.reduce<SearchQueryFilters>((acc, filter) => {
    const raw = searchParams.get(filter.name);
    if (raw !== null) {
      if (filter.type === "number") {
        try {
          const parsed = parseInt(raw, 10);
          acc[filter.name] = {
            filter,
            value: parsed,
          };
          return acc;
        } catch {
          // Do not add the filter
          return acc;
        }
      }

      // The filter is string or enum here
      acc[filter.name] = { filter, value: raw };
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
    if (existing[filter.name] == null && filter.defaultValue != null) {
      acc[filter.name] = {
        filter,
        value: filter.defaultValue,
      } as FilterWithValue;
    }
    return acc;
  }, {});
}

export function generateQueryParams(
  searchParams: URLSearchParams,
  groupSlug?: string,
  ignoredParams: string[] = []
): SearchQuery {
  const commonFilters = getSearchQueryFilters(searchParams, COMMON_FILTERS);
  const queryFilters = getSearchQueryFilters(searchParams, [
    FILTER_CONTENT,
    ...(searchParams.get(FILTER_CONTENT.name) === "DataConnector"
      ? DATACONNECTORS_FILTERS
      : PROJECT_FILTERS),
  ]);
  const queryFiltersForGroup = groupSlug
    ? {
        ...queryFilters,
        namespace: {
          filter: NAMESPACE_FILTER,
          value: groupSlug,
        },
      }
    : queryFilters;
  const mustQuoteFilters = ALL_FILTERS.filter((filter) => filter.mustQuote).map(
    (filter) => filter.name
  );

  const queryFiltersProcessed = Object.entries(queryFiltersForGroup).reduce<
    string[]
  >((acc, [key, filterWithValue]) => {
    if (!ignoredParams.includes(key) && filterWithValue?.value != null) {
      // Use custom query term builder if available (e.g., date filters)
      if (filterWithValue.filter.buildQueryTerms) {
        return [
          ...acc,
          ...filterWithValue.filter.buildQueryTerms(key, filterWithValue.value),
        ];
      }

      const { value } = filterWithValue;
      const quote = mustQuoteFilters.includes(key) ? '"' : "";
      const values =
        typeof value === "string" && value.includes(VALUE_SEPARATOR_AND)
          ? value.split(VALUE_SEPARATOR_AND)
          : [value];
      for (const value of values) {
        acc = [...acc, `${key}${KEY_VALUE_SEPARATOR}${quote}${value}${quote}`];
      }
    }
    return acc;
  }, []);

  const query = [
    ...queryFiltersProcessed,
    (commonFilters[FILTER_QUERY.name] as FilterWithValue<"string">).value,
  ].join(TERM_SEPARATOR);
  return {
    q: query.trim(),
    page:
      (commonFilters[FILTER_PAGE.name] as FilterWithValue<"number">)?.value ??
      FILTER_PAGE.defaultValue,
    per_page:
      (commonFilters[FILTER_PER_PAGE.name] as FilterWithValue<"number">)
        ?.value ?? FILTER_PER_PAGE.defaultValue,
    include_counts: DEFAULT_INCLUDE_COUNTS,
  };
}

export function getQueryHumanReadable(
  searchParams: URLSearchParams,
  filters: Filter[] = SELECTABLE_FILTERS
): ReactNode {
  const filterNamesToLabel = filters.reduce<Record<string, ReactNode>>(
    (acc, filter) => {
      acc[filter.name] = filter.label;
      return acc;
    },
    {}
  );
  const queryFilters = getSearchQueryFilters(searchParams, filters);
  const validFilters = Object.entries(queryFilters).filter(
    ([, filterWithValue]) => filterWithValue?.value != null
  );
  const queryParts = validFilters.map(([key, filterWithValue], index) => (
    <span key={key}>
      {filterNamesToLabel[key] ?? key}: {filterWithValue?.value}
      {index < validFilters.length - 1 && <> + </>}
    </span>
  ));

  return <>{queryParts}</>;
}

export function mapParsedQueryToSearchParams(
  result: ParseSearchQueryResult,
  currentParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  // Map type filter (lowercase → capitalized to match context-search values)
  if (result.filters.type.values.length > 0) {
    const typeValue = capitalizeEntityType(result.filters.type.values[0]);
    params.set(FILTER_CONTENT.name, typeValue);
  }

  // Map role filter
  if (result.filters.role.values.length > 0) {
    params.set(
      FILTER_MY_ROLE.name,
      result.filters.role.values.join(VALUE_SEPARATOR_OR)
    );
  }

  // Map visibility filter
  if (result.filters.visibility.values.length > 0) {
    params.set(FILTER_VISIBILITY.name, result.filters.visibility.values[0]);
  }

  // Map date filter
  const dateValue = mapDateFilterToParam(result.dateFilters.created);
  if (dateValue) {
    params.set(FILTER_DATE.name, dateValue);
  }

  // Set free text query (without filter terms)
  params.set(FILTER_QUERY.name, result.searchBarQuery);

  // Reset page to first
  params.set(FILTER_PAGE.name, FILTER_PAGE.defaultValue.toString());

  return params;
}

function capitalizeEntityType(type: string): string {
  const matched = FILTER_CONTENT.allowedValues.find(
    (v) => v.value.toLowerCase() === type.toLowerCase()
  );
  return matched?.value ?? type;
}

function mapDateFilterToParam(filter: CreationDateFilter): string | null {
  const parts: string[] = [];

  if (filter.value.after != null) {
    const afterStr =
      typeof filter.value.after === "string"
        ? filter.value.after
        : filter.value.after.date.toISODate();
    if (afterStr) {
      parts.push(`>${afterStr}`);
    }
  }

  if (filter.value.before != null) {
    const beforeStr =
      typeof filter.value.before === "string"
        ? filter.value.before
        : filter.value.before.date.toISODate();
    if (beforeStr) {
      parts.push(`<${beforeStr}`);
    }
  }

  return parts.length > 0 ? parts.join(DATE_FILTER_CUSTOM_SEPARATOR) : null;
}

export function parseCustomDateFilter(value: string): {
  afterDate: string;
  beforeDate: string;
} {
  const parts = value.split(DATE_FILTER_CUSTOM_SEPARATOR);
  let afterDate = "";
  let beforeDate = "";
  for (const part of parts) {
    if (part.startsWith(">")) afterDate = part.slice(1);
    else if (part.startsWith("<")) beforeDate = part.slice(1);
  }
  return { afterDate, beforeDate };
}

export function buildCustomDateFilterValue(
  afterDate: string,
  beforeDate: string
): string {
  const parts: string[] = [];
  if (afterDate) parts.push(`>${afterDate}`);
  if (beforeDate) parts.push(`<${beforeDate}`);
  return parts.join(DATE_FILTER_CUSTOM_SEPARATOR);
}
