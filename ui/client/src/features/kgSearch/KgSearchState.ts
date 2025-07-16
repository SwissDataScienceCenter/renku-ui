/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import {
  DateFilterTypes,
  dateFilterTypeToSinceAndUntil,
  stringToDateFilter,
} from "../../components/dateFilter/DateFilter";
import {
  SortingOptions,
  stringToSortingOption,
} from "../../components/sortingEntities/SortingEntities";
import {
  TypeEntitySelection,
  arrayToTypeEntitySelection,
} from "../../components/typeEntityFilter/TypeEntityFilter";
import { arrayToUserRolesFilter } from "../../components/userRolesFilter/userRoles.utils";
import { UserRoles } from "../../components/userRolesFilter/userRolesFilter.types";
import {
  VisibilitiesFilter,
  arrayToVisibilitiesFilter,
} from "../../components/visibilityFilter/VisibilityFilter";
import { KgSearchState } from "./KgSearch.types";

const numKeys = ["page", "perPage"] as const;
type KgStateNumKey = (typeof numKeys)[number];
type KgStateSortKey = "sort";
const stringKeys = ["phrase"] as const;
type KgStateStrKey = (typeof stringKeys)[number];
const dateBoundsKey = ["since", "until"] as const;
type KgStateDateBoundsKey = (typeof dateBoundsKey)[number];
type KgStateUserRoleKey = "role";
type KgStateTypeDateFilterKey = "typeDate";
type KgStateTypeKey = "type";
type KgStateVisibilityKey = "visibility";
type KgStateKey =
  | KgStateNumKey
  | KgStateStrKey
  | KgStateSortKey
  | KgStateTypeDateFilterKey
  | KgStateDateBoundsKey
  | KgStateUserRoleKey
  | KgStateTypeKey
  | KgStateVisibilityKey;

// In some cases, the date fields need to be handled separately
type KgStateSimpleKey = Exclude<
  KgStateKey,
  KgStateTypeDateFilterKey | KgStateDateBoundsKey
>;

type KgStateVal<T extends KgStateSimpleKey> = T extends KgStateUserRoleKey
  ? UserRoles
  : T extends KgStateSortKey
  ? SortingOptions
  : T extends KgStateTypeKey
  ? TypeEntitySelection
  : T extends KgStateVisibilityKey
  ? VisibilitiesFilter
  : T extends KgStateNumKey
  ? number
  : string;

export const defaultSearchState: KgSearchState = {
  page: 1,
  perPage: 24,
  phrase: "",
  role: { owner: false, maintainer: false, reader: false },
  since: "",
  sort: SortingOptions.DescMatchingScore,
  type: { project: true, dataset: false },
  typeDate: DateFilterTypes.all,
  until: "",
  visibility: { private: true, public: true, internal: true },
};

export const searchStringToState = (searchString: string): KgSearchState => {
  const queryParams = new URLSearchParams(searchString);
  const page = queryParameterStateValue(queryParams, "page");
  const perPage = queryParameterStateValue(queryParams, "perPage");
  const phrase = queryParameterStateValue(queryParams, "phrase");
  const role = queryParameterStateValue(queryParams, "role");
  const sort = queryParameterStateValue(queryParams, "sort");
  const type = queryParameterStateValue(queryParams, "type");
  const visibility = queryParameterStateValue(queryParams, "visibility");
  const { since, typeDate, until } = queryParameterDateStateValue(queryParams);
  return {
    phrase,
    sort,
    page,
    perPage,
    type,
    role,
    visibility,
    since,
    until,
    typeDate,
  };
};

const queryParameterStateValue = <T extends KgStateSimpleKey>(
  qp: URLSearchParams,
  key: T
): KgStateVal<T> => {
  const result = qp.get(key) ?? defaultSearchState[key];
  if (isSortKey(key)) {
    const value = qp.get(key);
    if (value == null) return defaultSearchState.sort as KgStateVal<T>;
    return stringToSortingOption(value) as KgStateVal<T>;
  }
  if (isTypeKey(key)) {
    const value = qp.getAll(key);
    if (value.length < 1) return defaultSearchState.type as KgStateVal<T>;
    return arrayToTypeEntitySelection(value) as KgStateVal<T>;
  }
  if (isTypeDateKey(key)) {
    const value = qp.get(key);
    if (value == null) return defaultSearchState.typeDate as KgStateVal<T>;
    return stringToDateFilter(value) as KgStateVal<T>;
  }
  if (isUserRoleKey(key)) {
    const value = qp.getAll(key);
    if (value.length < 1) return defaultSearchState.role as KgStateVal<T>;
    return arrayToUserRolesFilter(value) as KgStateVal<T>;
  }
  if (isVisibilityKey(key)) {
    const value = qp.getAll(key);
    if (value.length < 1) return defaultSearchState.visibility as KgStateVal<T>;
    return arrayToVisibilitiesFilter(value) as KgStateVal<T>;
  }
  if (isNumKey(key)) return +result as KgStateVal<T>;
  return result as KgStateVal<T>;
};

/**
 * The date parameters need to be handled specially.
 * @param qp Query parameters
 * @returns since, typeDate, until
 */
const queryParameterDateStateValue = (
  qp: URLSearchParams
): Pick<KgSearchState, "since" | "typeDate" | "until"> => {
  const typeDateString = qp.get("typeDate");
  const typeDate =
    stringToDateFilter(typeDateString ?? "") ?? defaultSearchState.typeDate;
  const { since, until } = dateFilterTypeToSinceAndUntil(typeDate);
  if (typeDate !== DateFilterTypes.custom) return { since, typeDate, until };
  const sinceStr = qp.get("since") ?? "";
  const untilStr = qp.get("until") ?? "";
  return { since: sinceStr, typeDate, until: untilStr };
};

const isNumKey = (key: unknown): key is KgStateNumKey => {
  return (numKeys as readonly unknown[]).includes(key);
};

const isSortKey = (key: unknown): key is KgStateSortKey => {
  return key === "sort";
};

const isTypeKey = (key: unknown): key is KgStateTypeKey => {
  return key === "type";
};

const isTypeDateKey = (key: unknown): key is KgStateTypeDateFilterKey => {
  return key === "typeDate";
};

const isUserRoleKey = (key: unknown): key is KgStateUserRoleKey => {
  return key === "role";
};

const isVisibilityKey = (key: unknown): key is KgStateVisibilityKey => {
  return key === "visibility";
};

export const stateToSearchString = (state: Partial<KgSearchState>): string => {
  const stateMap: string[][] = [];
  for (const key of stringKeys) {
    const val = state[key];
    if (val != null && val !== defaultSearchState[key])
      stateMap.push([key, val]);
  }
  for (const key of numKeys) {
    const val = state[key];
    if (val != null && val !== defaultSearchState[key])
      stateMap.push([key, val.toString()]);
  }
  {
    const key = "sort";
    const val = state[key];
    if (val != null && val !== defaultSearchState[key])
      stateMap.push([key, val.toString()]);
  }
  {
    const key = "role";
    const val = state[key];
    if (val != null && !isInitialEqualToObject(key, val)) {
      Object.keys(val).forEach((k) => {
        if (val[k as keyof typeof val] === true) stateMap.push([key, k]);
      });
    }
  }
  {
    const key = "typeDate";
    const val = state[key];
    if (val != null && val !== defaultSearchState[key])
      stateMap.push([key, val.toString()]);
  }
  for (const key of dateBoundsKey) {
    const typeDate = state["typeDate"];
    const val = state[key];
    // Only set the bounds if the date is custom, otherwise they are computed
    if (typeDate === DateFilterTypes.custom)
      stateMap.push([key, val?.toString() ?? ""]);
  }
  {
    const key = "type";
    const val = state[key];
    if (val != null && !isInitialEqualToObject(key, val)) {
      Object.keys(val).forEach((k) => {
        if (val[k as keyof typeof val] === true) stateMap.push([key, k]);
      });
    }
  }
  {
    const key = "visibility";
    const val = state[key];
    if (val != null && !isInitialEqualToObject(key, val)) {
      Object.keys(val).forEach((k) => {
        if (val[k as keyof typeof val] === true) stateMap.push([key, k]);
      });
    }
  }
  const searchParams = new URLSearchParams(stateMap);
  return searchParams.toString();
};

function isInitialEqualToObject(
  key: KgStateTypeKey | KgStateUserRoleKey | KgStateVisibilityKey,
  value?: TypeEntitySelection | UserRoles | VisibilitiesFilter | null
) {
  // treat an missing value as same as initial
  if (value == null) return true;
  const initial = defaultSearchState[key];
  for (const k of Object.keys(initial))
    if (value[k as keyof typeof value] != initial[k as keyof typeof initial])
      return false;

  return true;
}
