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
 * limitations under the License.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_SORT_BY, DEFAULT_TYPE_FILTER } from "./searchV2.constants";
import type {
  SearchEntityType,
  SearchV2StateV2,
  SetInitialQueryParams,
  SortBy,
} from "./searchV2.types";
import { buildSearchQuery2, valuesAsSet } from "./searchV2.utils";

// import type {
//   DateFilter,
//   FilterOptions,
//   SearchEntityType,
//   SearchV2State,
//   SearchV2StateV2,
//   SearchV2Totals,
//   SetInitialQueryParams,
//   SortingItem,
//   SortingOption,
//   ToggleFilterPayload,
//   TypeFilterOption,
// } from "./searchV2.types";
// import {
//   AVAILABLE_SORTING,
//   buildSearchQuery2,
//   makeValuesSetAsArray,
//   valuesAsSet,
// } from "./searchV2.utils";
// import { DateFilterTypes } from "../../components/dateFilter/DateFilter";
// import {
//   DEFAULT_SORTING_OPTION,
//   DEFAULT_TYPE_FILTER_OPTION,
// } from "./searchV2.constants";

const initialState: SearchV2StateV2 = {
  filters: {
    type: DEFAULT_TYPE_FILTER,
  },
  initialQuery: "",
  page: 1,
  perPage: 10,
  query: "",
  searchBarQuery: "",
  sortBy: DEFAULT_SORT_BY,
};

export const searchV2Slice = createSlice({
  name: "searchV2",
  initialState,
  reducers: {
    setInitialQuery: (state, action: PayloadAction<SetInitialQueryParams>) => {
      const { filters, query, searchBarQuery, sortBy } = action.payload;
      state.initialQuery = query;
      state.query = query;
      state.searchBarQuery = searchBarQuery;
      state.filters = filters;
      state.sortBy = sortBy;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.perPage = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
      state.query = buildSearchQuery2(state);
    },
    setSearchBarQuery: (state, action: PayloadAction<string>) => {
      state.searchBarQuery = action.payload;
      state.query = buildSearchQuery2(state);
    },
    toggleTypeFilterValue: (
      state,
      action: PayloadAction<{
        value: SearchEntityType;
      }>
    ) => {
      const asSet = valuesAsSet(state.filters.type.values);
      if (asSet.has(action.payload.value)) {
        asSet.delete(action.payload.value);
      } else {
        asSet.add(action.payload.value);
      }
      state.filters.type.values = Array.from(asSet).sort();
      state.query = buildSearchQuery2(state);
    },
    reset: () => initialState,
  },
});

export const {
  setInitialQuery,
  setPage,
  setPerPage,
  setSortBy,
  setSearchBarQuery,
  reset,
} = searchV2Slice.actions;
