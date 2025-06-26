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
import { SearchQueryFilters } from "~/features/searchV2/searchV2.types";
import { Filter } from "./groupSearch.types";
import {
  COMMON_FILTERS,
  DATACONNECTORS_FILTERS,
  FILTER_CONTENT,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
  PROJECT_FILTERS,
  SELECTABLE_FILTERS,
  VALUE_SEPARATOR_AND,
} from "./groupsSearch.constants";

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
  searchParams: URLSearchParams,
  groupSlug?: string,
  ignoredParams: string[] = []
): SearchQuery {
  const commonFilters = getSearchQueryFilters(searchParams, COMMON_FILTERS);
  const queryFilters = getSearchQueryFilters(searchParams, [
    FILTER_CONTENT,
    ...(searchParams.get("type") === "dataconnector"
      ? DATACONNECTORS_FILTERS
      : PROJECT_FILTERS),
  ]);
  const queryFiltersForGroup = groupSlug
    ? {
        ...queryFilters,
        namespace: groupSlug,
      }
    : queryFilters;

  const queryFiltersProcessed = Object.entries(queryFiltersForGroup).reduce<
    string[]
  >((acc, [key, value]) => {
    if (!ignoredParams.includes(key) && value !== undefined) {
      const values =
        typeof value === "string" && value.includes(VALUE_SEPARATOR_AND)
          ? value.split(VALUE_SEPARATOR_AND)
          : [value];
      for (const value of values) {
        acc = [...acc, `${key}${KEY_VALUE_SEPARATOR}${value}`];
      }
    }
    return acc;
  }, []);

  const query = [
    ...queryFiltersProcessed,
    commonFilters[FILTER_QUERY.name],
  ].join(TERM_SEPARATOR);
  return {
    q: query.trim(),
    page: (commonFilters[FILTER_PAGE.name] ??
      (FILTER_PAGE.defaultValue as number)) as number,
    per_page: (commonFilters[FILTER_PER_PAGE.name] ??
      FILTER_PER_PAGE.defaultValue) as number,
  };
}

export function getQueryHumanReadable(
  searchParams: URLSearchParams,
  filters: Filter[] = SELECTABLE_FILTERS
): string {
  const queryFilters = getSearchQueryFilters(searchParams, filters);
  const queryParts = Object.entries(queryFilters).reduce<string[]>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc.push(`${key}: ${value}`);
      }
      return acc;
    },
    []
  );
  return queryParts.join(", ");
}
