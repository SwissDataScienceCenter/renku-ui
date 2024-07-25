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

import { toNumericRole } from "../ProjectPageV2/utils/roleUtils";
import {
  TERM_SEPARATOR,
  DEFAULT_SORT_BY,
  TYPE_FILTER_KEY,
  KEY_VALUE_SEPARATOR,
  VALUES_SEPARATOR,
  TYPE_FILTER_ALLOWED_VALUES,
  SORT_BY_KEY,
  SORT_BY_ALLOWED_VALUES,
  ROLE_FILTER_KEY,
  ROLE_FILTER_ALLOWED_VALUES,
  DEFAULT_ROLE_FILTER,
  DEFAULT_TYPE_FILTER,
  DEFAULT_VISIBILITY_FILTER,
  VISIBILITY_FILTER_KEY,
  VISIBILITY_FILTER_ALLOWED_VALUES,
} from "./searchV2.constants";
import type {
  InterpretedTerm,
  ParseSearchQueryResult,
  RoleFilter,
  SearchFilter,
  SearchFilters,
  SearchOption,
  SearchV2StateV2,
  SortBy,
  TypeFilter,
  VisibilityFilter,
} from "./searchV2.types";

export function parseSearchQuery(query: string): ParseSearchQueryResult {
  const terms = query
    .split(TERM_SEPARATOR)
    .filter((term) => term != "")
    .map(parseTerm);

  // Retain the last filter option only
  const roleFilterOption = [...terms]
    .reverse()
    .find(isRoleFilterInterpretation)?.interpretation;

  // Retain the last filter option only
  const typeFilterOption = [...terms]
    .reverse()
    .find(isTypeFilterInterpretation)?.interpretation;

  // Retain the last filter option only
  const visibilityFilterOption = [...terms]
    .reverse()
    .find(isVisibilityFilterInterpretation)?.interpretation;

  const filters: SearchFilters = {
    role: roleFilterOption ?? DEFAULT_ROLE_FILTER,
    type: typeFilterOption ?? DEFAULT_TYPE_FILTER,
    visibility: visibilityFilterOption ?? DEFAULT_VISIBILITY_FILTER,
  };

  // Retain the last sorting option only
  const sortByOption =
    [...terms].reverse().find(isSortByInterpretation)?.interpretation ??
    DEFAULT_SORT_BY;

  const optionsAsTerms = [
    roleFilterOption,
    typeFilterOption,
    visibilityFilterOption,
    sortByOption,
  ]
    .map(asQueryTerm)
    .filter((term) => term !== "");

  const uninterpretedTerms = terms
    .filter(({ interpretation }) => interpretation == null)
    .map(({ term }) => term);

  const canonicalQuery = [...optionsAsTerms, ...uninterpretedTerms].join(" ");

  const searchBarQuery = uninterpretedTerms.join(" ");

  return {
    canonicalQuery,
    filters,
    searchBarQuery,
    sortBy: sortByOption,
  };
}

/** Attempt to parse `term` as a search option */
export function parseTerm(term: string): InterpretedTerm {
  const termLower = term.toLowerCase();

  if (termLower.startsWith(`${ROLE_FILTER_KEY}${KEY_VALUE_SEPARATOR}`)) {
    const filterValues = termLower.slice(
      ROLE_FILTER_KEY.length + KEY_VALUE_SEPARATOR.length
    );
    const values = filterValues.split(`${VALUES_SEPARATOR}`);
    const [allowedValues, hasUnallowedValue] = filterAllowedValues(
      values,
      ROLE_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(
      allowedValues,
      (a, b) => toNumericRole(b) - toNumericRole(a)
    );
    if (!hasUnallowedValue) {
      return {
        term,
        interpretation: {
          key: "role",
          values: matchedValues,
        },
      };
    }
  }

  if (termLower.startsWith(`${TYPE_FILTER_KEY}${KEY_VALUE_SEPARATOR}`)) {
    const filterValues = termLower.slice(
      TYPE_FILTER_KEY.length + KEY_VALUE_SEPARATOR.length
    );
    const values = filterValues.split(`${VALUES_SEPARATOR}`);
    const [allowedValues, hasUnallowedValue] = filterAllowedValues(
      values,
      TYPE_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(allowedValues);
    if (!hasUnallowedValue) {
      return {
        term,
        interpretation: {
          key: "type",
          values: matchedValues,
        },
      };
    }
  }

  if (termLower.startsWith(`${VISIBILITY_FILTER_KEY}${KEY_VALUE_SEPARATOR}`)) {
    const filterValues = termLower.slice(
      VISIBILITY_FILTER_KEY.length + KEY_VALUE_SEPARATOR.length
    );
    const values = filterValues.split(`${VALUES_SEPARATOR}`);
    const [allowedValues, hasUnallowedValue] = filterAllowedValues(
      values,
      VISIBILITY_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(allowedValues);
    if (!hasUnallowedValue) {
      return {
        term,
        interpretation: {
          key: "visibility",
          values: matchedValues,
        },
      };
    }
  }

  if (termLower.startsWith(`${SORT_BY_KEY}${KEY_VALUE_SEPARATOR}`)) {
    const sortValue = termLower.slice(
      SORT_BY_KEY.length + KEY_VALUE_SEPARATOR.length
    );
    const matched = SORT_BY_ALLOWED_VALUES.find(
      (option) => option === sortValue
    );
    if (matched) {
      return {
        term,
        interpretation: {
          key: "sort",
          value: matched,
        },
      };
    }
  }

  return {
    term,
    interpretation: null,
  };
}

export function valuesAsSet<T>(values: T[]): Set<T> {
  return values.reduce((set, value) => set.add(value), new Set<T>());
}

export function makeValuesSetAsArray<T extends string>(
  values: T[],
  compareFn?: ((a: T, b: T) => number) | undefined
): T[] {
  return Array.from(valuesAsSet(values)).sort(compareFn);
}

export function filterAllowedValues<T extends string>(
  values: string[],
  allowedValues: T[]
): [T[], boolean] {
  function isAllowed(value: string): value is T {
    return !!allowedValues.find((allowedValue) => value === allowedValue);
  }
  return [
    values.filter(isAllowed),
    !!values.find((value) => !isAllowed(value)),
  ];
}

function isRoleFilterInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: RoleFilter } {
  return term.interpretation?.key === "role";
}

function isTypeFilterInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: TypeFilter } {
  return term.interpretation?.key === "type";
}

function isVisibilityFilterInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: VisibilityFilter } {
  return term.interpretation?.key === "visibility";
}

function isSortByInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: SortBy } {
  return term.interpretation?.key === "sort";
}

function asQueryTerm(option: SearchOption | null | undefined): string {
  if (option == null) {
    return "";
  }

  if (option.key === "role" && option.values.length == 0) {
    return "";
  }
  if (option.key === "role") {
    const valuesStr = option.values.join(VALUES_SEPARATOR);
    return `${ROLE_FILTER_KEY}${KEY_VALUE_SEPARATOR}${valuesStr}`;
  }

  if (option.key === "type" && option.values.length == 0) {
    return "";
  }
  if (option.key === "type") {
    const valuesStr = option.values.join(VALUES_SEPARATOR);
    return `${TYPE_FILTER_KEY}${KEY_VALUE_SEPARATOR}${valuesStr}`;
  }

  if (option.key === "visibility" && option.values.length == 0) {
    return "";
  }
  if (option.key === "visibility") {
    const valuesStr = option.values.join(VALUES_SEPARATOR);
    return `${VISIBILITY_FILTER_KEY}${KEY_VALUE_SEPARATOR}${valuesStr}`;
  }

  if (option.key === "sort" && option.value === DEFAULT_SORT_BY.value) {
    return "";
  }
  if (option.key === "sort") {
    return `${SORT_BY_KEY}${KEY_VALUE_SEPARATOR}${option.value}`;
  }

  return "";
}

export function buildSearchQuery2(
  state: Pick<SearchV2StateV2, "searchBarQuery" | "sortBy" | "filters">
): string {
  const { filters, searchBarQuery, sortBy } = state;

  const optionsAsTerms = [
    filters.role,
    filters.type,
    filters.visibility,
    sortBy,
  ]
    .map(asQueryTerm)
    .filter((term) => term !== "");

  const draftQuery = [...optionsAsTerms, searchBarQuery].join(" ");

  const { canonicalQuery } = parseSearchQuery(draftQuery);

  return canonicalQuery;
}

export function filtersAsArray(filters: SearchFilters): SearchFilter[] {
  return [filters.role, filters.type, filters.visibility];
}
