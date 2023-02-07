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

import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import type { History } from "history";

import {
  TypeEntitySelection,
  arrayToTypeEntitySelection,
} from "../../utils/components/typeEntityFilter/TypeEntityFilter";
import {
  VisibilitiesFilter,
  arrayToVisibilitiesFilter,
} from "../../utils/components/visibilityFilter/VisibilityFilter";
import { SortingOptions, stringToSortingOption } from "../../utils/components/sortingEntities/SortingEntities";
import { KgAuthor } from "./KgSearch";
import {
  DateFilterTypes,
  DatesFilter,
  dateFilterTypeToSinceAndUntil,
  stringToDateFilter,
} from "../../utils/components/dateFilter/DateFilter";

export interface KgSearchFormState {
  author: KgAuthor;
  page: number;
  perPage: number;
  phrase: string;
  since: string;
  sort: SortingOptions;
  type: TypeEntitySelection;
  typeDate: DateFilterTypes;
  until: string;
  visibility: VisibilitiesFilter;
}

type KgStateAuthorKey = "author";
const numKeys = ["page", "perPage"] as const;
type KgStateNumKey = typeof numKeys[number];
type KgStateSortKey = "sort";
const stringKeys = ["phrase"] as const;
type KgStateStrKey = typeof stringKeys[number];
const dateBoundsKey = ["since", "until"] as const;
type KgStateDateBoundsKey = typeof dateBoundsKey[number];
type KgStateTypeDateFilterKey = "typeDate";
type KgStateTypeKey = "type";
type KgStateVisibilityKey = "visibility";
type KgStateKey =
  | KgStateAuthorKey
  | KgStateNumKey
  | KgStateStrKey
  | KgStateSortKey
  | KgStateTypeDateFilterKey
  | KgStateDateBoundsKey
  | KgStateTypeKey
  | KgStateVisibilityKey;

// In some cases, the date fields need to be handled separately
type KgStateSimpleKey = Exclude<KgStateKey, KgStateTypeDateFilterKey | KgStateDateBoundsKey>;

const initialState: KgSearchFormState = {
  phrase: "",
  sort: SortingOptions.DescMatchingScore,
  page: 1,
  perPage: 24,
  type: {
    project: true,
    dataset: false,
  },
  author: "all",
  visibility: {
    private: true,
    public: true,
    internal: true,
  },
  since: "",
  until: "",
  typeDate: DateFilterTypes.all,
};

type KgStateVal<T extends KgStateSimpleKey> = T extends KgStateAuthorKey
  ? KgAuthor
  : T extends KgStateSortKey
  ? SortingOptions
  : T extends KgStateTypeKey
  ? TypeEntitySelection
  : T extends KgStateVisibilityKey
  ? VisibilitiesFilter
  : T extends KgStateNumKey
  ? number
  : string;

function isAuthorKey(key: any): key is KgStateAuthorKey {
  return key === "author";
}

function isNumKey(key: any): key is KgStateNumKey {
  return numKeys.includes(key);
}

function isSortKey(key: any): key is KgStateSortKey {
  return key === "sort";
}

function isTypeKey(key: any): key is KgStateTypeKey {
  return key === "type";
}

function isTypeDateKey(key: any): key is KgStateTypeDateFilterKey {
  return key === "typeDate";
}

function isVisibilityKey(key: any): key is KgStateVisibilityKey {
  return key === "visibility";
}

// function isStringKey(key: any): key is KgStateStrKey {
//   return stringKeys.includes(key);
// }

function queryParameterStateValue<T extends KgStateSimpleKey>(qp: URLSearchParams, key: T): KgStateVal<T> {
  const result = qp.get(key) ?? initialState[key];
  if (isAuthorKey(key)) return result as KgStateVal<T>;
  if (isSortKey(key)) {
    const value = qp.get(key);
    if (value == null) return initialState.sort as KgStateVal<T>;
    return stringToSortingOption(value) as KgStateVal<T>;
  }
  if (isTypeKey(key)) {
    const value = qp.getAll(key);
    if (value.length < 1) return initialState.type as KgStateVal<T>;
    return arrayToTypeEntitySelection(value) as KgStateVal<T>;
  }
  if (isTypeDateKey(key)) {
    const value = qp.get(key);
    if (value == null) return initialState.typeDate as KgStateVal<T>;
    return stringToDateFilter(value) as KgStateVal<T>;
  }
  if (isVisibilityKey(key)) {
    const value = qp.getAll(key);
    if (value.length < 1) return initialState.visibility as KgStateVal<T>;
    return arrayToVisibilitiesFilter(value) as KgStateVal<T>;
  }
  if (isNumKey(key)) return +result as KgStateVal<T>;
  return result as KgStateVal<T>;
}

/**
 * The date parameters need to be handled specially.
 * @param qp Query parameters
 * @returns since, typeDate, until
 */
function queryParameterDateStateValue(qp: URLSearchParams): Pick<KgSearchFormState, "since" | "typeDate" | "until"> {
  const typeDateString = qp.get("typeDate");
  const typeDate = stringToDateFilter(typeDateString ?? "") ?? initialState.typeDate;
  const { since, until } = dateFilterTypeToSinceAndUntil(typeDate);
  if (typeDate !== DateFilterTypes.custom) return { since, typeDate, until };
  const sinceStr = qp.get("since") ?? "";
  const untilStr = qp.get("until") ?? "";
  return { since: sinceStr, typeDate, until: untilStr };
}

function searchStringToState(searchString: string): KgSearchFormState {
  const queryParams = new URLSearchParams(searchString);
  const author = queryParameterStateValue(queryParams, "author");
  const page = queryParameterStateValue(queryParams, "page");
  const perPage = queryParameterStateValue(queryParams, "perPage");
  const phrase = queryParameterStateValue(queryParams, "phrase");
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
    author,
    visibility,
    since,
    until,
    typeDate,
  };
}

function isInitialEqualToObject(
  key: KgStateTypeKey | KgStateVisibilityKey,
  value?: TypeEntitySelection | VisibilitiesFilter | null
) {
  // treat an missing value as same as initial
  if (value == null) return true;
  const initial = initialState[key];
  for (const k of Object.keys(initial))
    if (value[k as keyof typeof value] != initial[k as keyof typeof initial]) return false;

  return true;
}

function stateToSearchString(state: Partial<KgSearchFormState>): string {
  const stateMap: string[][] = [];
  for (const key of stringKeys) {
    const val = state[key];
    if (val != null && val !== initialState[key]) stateMap.push([key, val]);
  }
  for (const key of numKeys) {
    const val = state[key];
    if (val != null && val !== initialState[key]) stateMap.push([key, val.toString()]);
  }
  {
    const key = "sort";
    const val = state[key];
    if (val != null && val !== initialState[key]) stateMap.push([key, val.toString()]);
  }
  {
    const key = "author";
    const val = state[key];
    if (val != null && val !== initialState[key]) stateMap.push([key, val.toString()]);
  }
  {
    const key = "typeDate";
    const val = state[key];
    if (val != null && val !== initialState[key]) stateMap.push([key, val.toString()]);
  }
  for (const key of dateBoundsKey) {
    const typeDate = state["typeDate"];
    const val = state[key];
    // Only set the bounds if the date is custom, otherwise they are computed
    if (typeDate === DateFilterTypes.custom) stateMap.push([key, val?.toString() ?? ""]);
  }
  {
    const key = "type";
    const val = state[key];
    if (!isInitialEqualToObject(key, val)) {
      Object.keys(val!).forEach((k) => {
        if (val![k as keyof typeof val] === true) stateMap.push([key, k]);
      });
    }
  }
  {
    const key = "visibility";
    const val = state[key];
    if (!isInitialEqualToObject(key, val)) {
      Object.keys(val!).forEach((k) => {
        if (val![k as keyof typeof val] === true) stateMap.push([key, k]);
      });
    }
  }
  const searchParams = new URLSearchParams(stateMap);
  return searchParams.toString();
}

function pushStateUpdate(searchState: Partial<KgSearchFormState>, history: History<unknown>, resetPage = true) {
  if (resetPage === true) searchState.page = 1;
  const search = stateToSearchString(searchState);
  history.push({ search });
}

function useKgSearchState() {
  const location = useLocation();
  const history = useHistory();
  const searchState = searchStringToState(location.search);

  const setAuthor = (author: KgAuthor) => {
    searchState.author = author;
    pushStateUpdate(searchState, history);
  };
  const setDates = (filter: DatesFilter) => {
    searchState.since = filter.since ?? "";
    searchState.until = filter.until ?? "";
    searchState.typeDate = filter.type ?? DateFilterTypes.all;
    pushStateUpdate(searchState, history);
  };
  const setMyProjects = () => {
    searchState.type = {
      project: true,
      dataset: false,
    };
    searchState.author = "user";
    searchState.phrase = "";
    searchState.page = 1;
    pushStateUpdate(searchState, history);
  };
  const setMyDatasets = () => {
    searchState.type = {
      project: false,
      dataset: true,
    };
    searchState.author = "user";
    searchState.phrase = "";
    searchState.page = 1;
    pushStateUpdate(searchState, history);
  };
  const setPhrase = (userPhrase: string) => {
    const phrase = encodeURIComponent(userPhrase);
    searchState.phrase = phrase;
    pushStateUpdate(searchState, history);
  };
  const setPage = (page: number) => {
    searchState.page = page;
    pushStateUpdate(searchState, history, false);
  };
  const setSort = (sort: SortingOptions) => {
    searchState.sort = sort;
    pushStateUpdate(searchState, history);
  };
  const setType = (type: TypeEntitySelection) => {
    searchState.type = type;
    pushStateUpdate(searchState, history);
  };
  //  setMyDatasets, setMyProjects
  const setVisibility = (visibility: VisibilitiesFilter) => {
    searchState.visibility = visibility;
    pushStateUpdate(searchState, history);
  };
  const removeFilters = () => {
    pushStateUpdate(initialState, history);
  };
  return {
    searchState,
    removeFilters,
    setAuthor,
    setDates,
    setMyDatasets,
    setMyProjects,
    setPage,
    setPhrase,
    setSort,
    setType,
    setVisibility,
  };
}

export { useKgSearchState };
