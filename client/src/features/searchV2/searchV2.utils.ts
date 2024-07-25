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
  CREATION_DATE_FILTER_KEY,
  KEY_GREATER_THAN_VALUE,
  DATE_FILTER_AFTER_KNOWN_VALUES,
  KEY_LESS_THAN_VALUE,
  DATE_FILTER_BEFORE_KNOWN_VALUES,
  DATE_AFTER_LEEWAY,
  DATE_BEFORE_LEEWAY,
} from "./searchV2.constants";
import type {
  CreationDateFilter,
  InterpretedTerm,
  ParseSearchQueryResult,
  RoleFilter,
  SearchDateFilters,
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

  const reversedTerms = [...terms].reverse();

  // Retain the last filter option only
  const roleFilterOption = reversedTerms.find(
    isRoleFilterInterpretation
  )?.interpretation;

  // Retain the last filter option only
  const typeFilterOption = reversedTerms.find(
    isTypeFilterInterpretation
  )?.interpretation;

  // Retain the last filter option only
  const visibilityFilterOption = reversedTerms.find(
    isVisibilityFilterInterpretation
  )?.interpretation;

  const filters: SearchFilters = {
    role: roleFilterOption ?? DEFAULT_ROLE_FILTER,
    type: typeFilterOption ?? DEFAULT_TYPE_FILTER,
    visibility: visibilityFilterOption ?? DEFAULT_VISIBILITY_FILTER,
  };

  const createdAfterFilterOption = reversedTerms
    .filter(isCreationDateFilterInterpretation)
    .map(({ interpretation }) => interpretation)
    .find(({ after }) => after != null)?.after;
  const createdBeforeFilterOption = reversedTerms
    .filter(isCreationDateFilterInterpretation)
    .map(({ interpretation }) => interpretation)
    .find(({ before }) => before != null)?.before;
  const creationDateFilterOption: CreationDateFilter = {
    key: "created",
    ...(createdAfterFilterOption != null
      ? { after: createdAfterFilterOption }
      : {}),
    ...(createdBeforeFilterOption != null
      ? { before: createdBeforeFilterOption }
      : {}),
  };

  const dateFilters: SearchDateFilters = {
    created: creationDateFilterOption,
  };

  // Retain the last sorting option only
  const sortByOption = reversedTerms.find(
    isSortByInterpretation
  )?.interpretation;

  const optionsAsTerms = [
    roleFilterOption,
    typeFilterOption,
    visibilityFilterOption,
    creationDateFilterOption,
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
          after: matchedKnownValue,
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
            after: { date: parsed },
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
          before: matchedKnownValue,
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
            before: { date: parsed },
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
    option.after == null &&
    option.before == null
  ) {
    return "";
  }
  if (option.key === "created") {
    const afterValueStr =
      typeof option.after === "string"
        ? option.after
        : option.after?.date != null
        ? `${option.after.date.toISODate()}${DATE_AFTER_LEEWAY}`
        : "";
    const afterStr = afterValueStr
      ? `${CREATION_DATE_FILTER_KEY}${KEY_GREATER_THAN_VALUE}${afterValueStr}`
      : "";
    const beforeValueStr =
      typeof option.before === "string"
        ? option.before
        : option.before?.date != null
        ? `${option.before.date.toISODate()}${DATE_BEFORE_LEEWAY}`
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

export function buildSearchQuery2(
  state: Pick<
    SearchV2StateV2,
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
