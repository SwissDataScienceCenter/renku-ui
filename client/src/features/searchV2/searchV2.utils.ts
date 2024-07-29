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

import { DateTime } from "luxon";
import { toNumericRole } from "../ProjectPageV2/utils/roleUtils";
import {
  CREATION_DATE_FILTER_KEY,
  DATE_AFTER_LEEWAY,
  DATE_BEFORE_LEEWAY,
  DATE_FILTER_AFTER_KNOWN_VALUES,
  DATE_FILTER_BEFORE_KNOWN_VALUES,
  DEFAULT_ROLE_FILTER,
  DEFAULT_SORT_BY,
  DEFAULT_TYPE_FILTER,
  DEFAULT_VISIBILITY_FILTER,
  KEY_GREATER_THAN_VALUE,
  KEY_LESS_THAN_VALUE,
  KEY_VALUE_SEPARATOR,
  ROLE_FILTER_ALLOWED_VALUES,
  ROLE_FILTER_KEY,
  SORT_BY_ALLOWED_VALUES,
  SORT_BY_KEY,
  TERM_SEPARATOR,
  TYPE_FILTER_ALLOWED_VALUES,
  TYPE_FILTER_KEY,
  VALUES_SEPARATOR,
  VISIBILITY_FILTER_ALLOWED_VALUES,
  VISIBILITY_FILTER_KEY,
} from "./searchV2.constants";
import type {
  AfterDateValue,
  BeforeDateValue,
  CreationDateFilter,
  InterpretedTerm,
  ParseSearchQueryResult,
  RoleFilter,
  SearchDateFilter,
  SearchDateFilters,
  SearchFilter,
  SearchFilters,
  SearchOption,
  SearchV2State,
  SortBy,
  TypeFilter,
  VisibilityFilter,
} from "./searchV2.types";

export function parseSearchQuery(query: string): ParseSearchQueryResult {
  const terms = query
    .split(TERM_SEPARATOR)
    .filter((term) => term != "")
    .map(parseTerm);

  const reversedTerms = [...terms].reverse();

  // Retain the last filter option only
  const roleFilter = reversedTerms.find(
    isRoleFilterInterpretation
  )?.interpretation;

  // Retain the last filter option only
  const typeFilter = reversedTerms.find(
    isTypeFilterInterpretation
  )?.interpretation;

  // Retain the last filter option only
  const visibilityFilter = reversedTerms.find(
    isVisibilityFilterInterpretation
  )?.interpretation;

  const filters: SearchFilters = {
    role: roleFilter ?? DEFAULT_ROLE_FILTER,
    type: typeFilter ?? DEFAULT_TYPE_FILTER,
    visibility: visibilityFilter ?? DEFAULT_VISIBILITY_FILTER,
  };

  const createdAfterFilterValue = reversedTerms
    .filter(isCreationDateFilterInterpretation)
    .map(({ interpretation }) => interpretation)
    .find(({ value }) => value.after != null)?.value.after;
  const createdBeforeFilterValue = reversedTerms
    .filter(isCreationDateFilterInterpretation)
    .map(({ interpretation }) => interpretation)
    .find(({ value }) => value != null)?.value.before;
  const creationDateFilter: CreationDateFilter = {
    key: "created",
    value: mergeDateFilterValues(
      createdAfterFilterValue,
      createdBeforeFilterValue
    ),
  };

  const dateFilters: SearchDateFilters = {
    created: creationDateFilter,
  };

  // Retain the last sorting option only
  const sortByOption = reversedTerms.find(
    isSortByInterpretation
  )?.interpretation;

  const optionsAsTerms = [
    roleFilter,
    typeFilter,
    visibilityFilter,
    creationDateFilter,
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
    dateFilters,
    filters,
    searchBarQuery,
    sortBy: sortByOption ?? DEFAULT_SORT_BY,
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
    const [allowedValues, hasDisallowedValue] = filterAllowedValues(
      values,
      ROLE_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(
      allowedValues,
      (a, b) => toNumericRole(b) - toNumericRole(a)
    );
    if (!hasDisallowedValue) {
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
    const [allowedValues, hasDisallowedValue] = filterAllowedValues(
      values,
      TYPE_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(allowedValues);
    if (!hasDisallowedValue) {
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
    const [allowedValues, hasDisallowedValue] = filterAllowedValues(
      values,
      VISIBILITY_FILTER_ALLOWED_VALUES
    );
    const matchedValues = makeValuesSetAsArray(allowedValues);
    if (!hasDisallowedValue) {
      return {
        term,
        interpretation: {
          key: "visibility",
          values: matchedValues,
        },
      };
    }
  }

  if (
    termLower.startsWith(`${CREATION_DATE_FILTER_KEY}${KEY_GREATER_THAN_VALUE}`)
  ) {
    const filterValue = termLower.slice(
      CREATION_DATE_FILTER_KEY.length + KEY_GREATER_THAN_VALUE.length
    );
    const matchedKnownValue = DATE_FILTER_AFTER_KNOWN_VALUES.find(
      (value) => value === filterValue
    );
    if (matchedKnownValue) {
      return {
        term,
        interpretation: {
          key: "created",
          value: {
            after: matchedKnownValue,
          },
        },
      };
    }
    if (filterValue.endsWith(DATE_AFTER_LEEWAY)) {
      const filterValue_ = filterValue.slice(0, -DATE_AFTER_LEEWAY.length);
      const parsed = DateTime.fromISO(filterValue_, { zone: "utc" });
      if (parsed.isValid && filterValue_ === parsed.toISODate()) {
        return {
          term,
          interpretation: {
            key: "created",
            value: {
              after: { date: parsed },
            },
          },
        };
      }
    }
  }
  if (
    termLower.startsWith(`${CREATION_DATE_FILTER_KEY}${KEY_LESS_THAN_VALUE}`)
  ) {
    const filterValue = termLower.slice(
      CREATION_DATE_FILTER_KEY.length + KEY_LESS_THAN_VALUE.length
    );
    const matchedKnownValue = DATE_FILTER_BEFORE_KNOWN_VALUES.find(
      (value) => value === filterValue
    );
    if (matchedKnownValue) {
      return {
        term,
        interpretation: {
          key: "created",
          value: {
            before: matchedKnownValue,
          },
        },
      };
    }
    if (filterValue.endsWith(DATE_BEFORE_LEEWAY)) {
      const filterValue_ = filterValue.slice(0, -DATE_BEFORE_LEEWAY.length);
      const parsed = DateTime.fromISO(filterValue_, { zone: "utc" });
      if (parsed.isValid && filterValue_ === parsed.toISODate()) {
        return {
          term,
          interpretation: {
            key: "created",
            value: {
              before: { date: parsed },
            },
          },
        };
      }
    }
  }

  if (termLower.startsWith(`${SORT_BY_KEY}${KEY_VALUE_SEPARATOR}`)) {
    const sortValue = termLower.slice(
      SORT_BY_KEY.length + KEY_VALUE_SEPARATOR.length
    );
    const matched = SORT_BY_ALLOWED_VALUES.find((value) => value === sortValue);
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

function isCreationDateFilterInterpretation(
  term: InterpretedTerm
): term is InterpretedTerm & { interpretation: CreationDateFilter } {
  return term.interpretation?.key === "created";
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

  if (
    option.key === "created" &&
    option.value.after == null &&
    option.value.before == null
  ) {
    return "";
  }
  if (option.key === "created") {
    const afterValueStr =
      typeof option.value.after === "string"
        ? option.value.after
        : option.value.after?.date != null
        ? `${option.value.after.date.toISODate()}${DATE_AFTER_LEEWAY}`
        : "";
    const afterStr = afterValueStr
      ? `${CREATION_DATE_FILTER_KEY}${KEY_GREATER_THAN_VALUE}${afterValueStr}`
      : "";
    const beforeValueStr =
      typeof option.value.before === "string"
        ? option.value.before
        : option.value.before?.date != null
        ? `${option.value.before.date.toISODate()}${DATE_BEFORE_LEEWAY}`
        : "";
    const beforeStr = beforeValueStr
      ? `${CREATION_DATE_FILTER_KEY}${KEY_LESS_THAN_VALUE}${beforeValueStr}`
      : "";
    return [afterStr, beforeStr]
      .filter((term) => term != "")
      .join(TERM_SEPARATOR);
  }

  if (option.key === "sort" && option.value === DEFAULT_SORT_BY.value) {
    return "";
  }
  if (option.key === "sort") {
    return `${SORT_BY_KEY}${KEY_VALUE_SEPARATOR}${option.value}`;
  }

  return "";
}

function mergeDateFilterValues(
  after: AfterDateValue | undefined,
  before: BeforeDateValue | undefined
): {
  after?: AfterDateValue;
  before?: BeforeDateValue;
} {
  const merged = {
    ...(after != null ? { after } : {}),
    ...(before != null ? { before } : {}),
  };

  if (merged.after == null || merged.before == null) {
    return merged;
  }

  // ? Providing both `after` and `before` as predefined tokens is not supported
  const today = DateTime.utc().startOf("day");
  if (typeof merged.after === "string") {
    const adjusted: AfterDateValue =
      merged.after === "today-7d"
        ? { date: today.minus({ days: 7 }) }
        : merged.after === "today-31d"
        ? { date: today.minus({ days: 31 }) }
        : { date: today.minus({ days: 90 }) };
    merged.after = adjusted;
  }
  if (typeof merged.before === "string") {
    const adjusted: BeforeDateValue = { date: today.minus({ days: 90 }) };
    merged.before = adjusted;
  }

  return merged;
}

export function buildSearchQuery2(
  state: Pick<
    SearchV2State,
    "searchBarQuery" | "sortBy" | "filters" | "dateFilters"
  >
): string {
  const { dateFilters, filters, searchBarQuery, sortBy } = state;

  const optionsAsTerms = [
    filters.role,
    filters.type,
    filters.visibility,
    dateFilters.created,
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

export function dateFiltersAsArray(
  dateFilters: SearchDateFilters
): SearchDateFilter[] {
  return [dateFilters.created];
}
