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

import type {
  DateFilter,
  FilterOptions,
  SearchV2State,
  SearchV2StateV2,
  SearchV2Totals,
  SetInitialQueryParams,
  SortingItem,
  SortingOption,
  ToggleFilterPayload,
  TypeFilterOption,
} from "./searchV2.types";
import { AVAILABLE_SORTING, buildSearchQuery2 } from "./searchV2.utils";
import { DateFilterTypes } from "../../components/dateFilter/DateFilter";
import {
  DEFAULT_SORTING_OPTION,
  DEFAULT_TYPE_FILTER_OPTION,
} from "./searchV2.constants";

const initialState: SearchV2StateV2 = {
  initialQuery: null,
  page: 1,
  perPage: 10,
  query: null,
  sort: DEFAULT_SORTING_OPTION,
  searchBarQuery: null,
  filters: {
    type: DEFAULT_TYPE_FILTER_OPTION,
  },
};

export const searchV2Slice = createSlice({
  name: "searchV2",
  initialState,
  reducers: {
    setInitialQuery: (state, action: PayloadAction<SetInitialQueryParams>) => {
      if (action.payload.query == null) {
        state.initialQuery = null;
        state.query = null;
        state.searchBarQuery = null;
        state.sort = DEFAULT_SORTING_OPTION;
        state.filters = { type: DEFAULT_TYPE_FILTER_OPTION };
      } else {
        state.initialQuery = action.payload.query;
        state.query = action.payload.query;
        state.searchBarQuery = action.payload.searchBarQuery;
        state.sort = action.payload.sort;
        state.filters = action.payload.filters;
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.perPage = action.payload;
    },
    setSort: (state, action: PayloadAction<SortingOption>) => {
      state.sort = action.payload;
      state.query = buildSearchQuery2(state);
    },
    setSearchBarQuery: (state, action: PayloadAction<string | null>) => {
      state.searchBarQuery = action.payload;
      state.query = buildSearchQuery2(state);
    },
    setTypeFilter: (
      state,
      action: PayloadAction<{
        key: keyof FilterOptions["type"];
        value: boolean;
      }>
    ) => {
      state.filters.type[action.payload.key] = action.payload.value;
      state.query = buildSearchQuery2(state);
    },
    reset: () => initialState,
  },
});

export const {
  setInitialQuery,
  setPage,
  setPerPage,
  setSort,
  setSearchBarQuery,
  reset,
} = searchV2Slice.actions;

// const initialState: SearchV2State = {
//   search: {
//     history: [],
//     lastSearch: null,
//     outdated: false,
//     page: 1,
//     perPage: 10,
//     query: "",
//     totalPages: 0,
//     totalResults: 0,
//   },
//   filters: {
//     role: [],
//     type: ["project"],
//     visibility: ["public", "private"],
//     created: {
//       option: DateFilterTypes.all,
//     },
//     createdBy: "",
//   },
//   sorting: AVAILABLE_SORTING.scoreDesc,
// };

// export const searchV2Slice = createSlice({
//   name: "searchV2",
//   initialState,
//   reducers: {
//     setPage: (state, action: PayloadAction<number>) => {
//       state.search.page = action.payload;
//       state.search.outdated = true;
//     },
//     setCreatedBy: (state, action: PayloadAction<string>) => {
//       state.filters.createdBy = action.payload;
//       state.search.outdated = true;
//     },
//     setQuery: (state, action: PayloadAction<string>) => {
//       state.search.query = action.payload;
//       // ? Mind we don't mark the query as outdated here to prevent unnecessary re-fetching while typing
//     },
//     setSearch: (state, action: PayloadAction<string>) => {
//       state.search.outdated = false;
//       state.search.lastSearch = action.payload;
//       state.search.history = [
//         ...state.search.history,
//         {
//           search: action.payload,
//           query: state.search.query,
//         },
//       ];
//     },
//     setSorting: (state, action: PayloadAction<SortingItem>) => {
//       state.sorting = action.payload;
//       state.search.outdated = true;
//     },
//     setTotals: (state, action: PayloadAction<SearchV2Totals>) => {
//       state.search.totalResults = action.payload.results;
//       state.search.totalPages = action.payload.pages;
//     },
//     setCreated: (state, action: PayloadAction<DateFilter>) => {
//       state.filters.created = action.payload;
//       state.search.outdated = true;
//     },
//     toggleFilter: (state, action: PayloadAction<ToggleFilterPayload>) => {
//       const arrayToUpdate =
//         action.payload.filter === "visibility"
//           ? state.filters.visibility
//           : action.payload.filter === "type"
//           ? state.filters.type
//           : state.filters.role;
//       const updatedArray = toggleArrayItem(
//         [...arrayToUpdate],
//         action.payload.value
//       ) as ("owner" | "member")[] &
//         ("project" | "user")[] &
//         ("private" | "public")[];

//       state.filters = {
//         ...state.filters,
//         [action.payload.filter]: updatedArray,
//       };
//       state.search.outdated = true;
//     },
//     reset: () => initialState,
//   },
// });

// // helper function to toggle array items
// function toggleArrayItem(array: string[], item: string) {
//   const index = array.indexOf(item);
//   if (index !== -1) {
//     array.splice(index, 1);
//   } else {
//     array.push(item);
//   }
//   return array;
// }

// export const {
//   setPage,
//   setQuery,
//   setSearch,
//   setSorting,
//   setCreated,
//   setCreatedBy,
//   setTotals,
//   toggleFilter,
//   reset,
// } = searchV2Slice.actions;
