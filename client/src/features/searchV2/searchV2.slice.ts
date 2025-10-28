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
import { toNumericRole } from "../ProjectPageV2/utils/roleUtils";
import type { Role } from "../projectsV2/api/projectV2.api";
import {
  DEFAULT_CREATION_DATE_FILTER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_ROLE_FILTER,
  DEFAULT_SORT_BY,
  DEFAULT_TYPE_FILTER,
  DEFAULT_VISIBILITY_FILTER,
  FIRST_PAGE,
} from "./searchV2.constants";
import type {
  CreationDateFilter,
  SearchEntityType,
  SearchEntityVisibility,
  SearchV2State,
  SetInitialQueryParams,
  SortBy,
} from "./searchV2.types";
import { buildSearchQuery, valuesAsSet } from "./searchV2.utils";

const initialState: SearchV2State = {
  dateFilters: {
    created: DEFAULT_CREATION_DATE_FILTER,
  },
  filters: {
    role: DEFAULT_ROLE_FILTER,
    type: DEFAULT_TYPE_FILTER,
    visibility: DEFAULT_VISIBILITY_FILTER,
  },
  initialQuery: "",
  page: FIRST_PAGE,
  perPage: DEFAULT_PAGE_SIZE,
  query: "",
  searchBarQuery: "",
  sortBy: DEFAULT_SORT_BY,
};

export const searchV2Slice = createSlice({
  name: "searchV2",
  initialState,
  reducers: {
    setInitialQuery: (state, action: PayloadAction<SetInitialQueryParams>) => {
      const { dateFilters, filters, query, searchBarQuery, sortBy } =
        action.payload;
      state.initialQuery = query;
      state.query = query;
      state.searchBarQuery = searchBarQuery;
      state.filters = filters;
      state.dateFilters = dateFilters;
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
      state.query = buildSearchQuery(state);
    },
    setSearchBarQuery: (state, action: PayloadAction<string>) => {
      state.searchBarQuery = action.payload;
      state.query = buildSearchQuery(state);
    },
    toggleRoleFilterValue: (state, action: PayloadAction<Role>) => {
      const asSet = valuesAsSet(state.filters.role.values);
      if (asSet.has(action.payload)) {
        asSet.delete(action.payload);
      } else {
        asSet.add(action.payload);
      }
      state.filters.role.values = Array.from(asSet).sort(
        (a, b) => toNumericRole(b) - toNumericRole(a)
      );
      state.query = buildSearchQuery(state);
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
      state.query = buildSearchQuery(state);
    },
    toggleVisibilityFilterValue: (
      state,
      action: PayloadAction<SearchEntityVisibility>
    ) => {
      const asSet = valuesAsSet(state.filters.visibility.values);
      if (asSet.has(action.payload)) {
        asSet.delete(action.payload);
      } else {
        asSet.add(action.payload);
      }
      state.filters.visibility.values = Array.from(asSet).sort();
      state.query = buildSearchQuery(state);
    },
    selectCreationDateFilter: (
      state,
      action: PayloadAction<CreationDateFilter>
    ) => {
      state.dateFilters.created = action.payload;
      state.query = buildSearchQuery(state);
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
  toggleRoleFilterValue,
  toggleTypeFilterValue,
  toggleVisibilityFilterValue,
  selectCreationDateFilter,
  reset,
} = searchV2Slice.actions;
