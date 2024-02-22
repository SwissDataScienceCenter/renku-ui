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

import {
  SearchV2State,
  SortingItem,
  ToggleFilterPayload,
} from "./searchV2.types";
import { AVAILABLE_SORTING } from "./searchV2.utils";

const initialState: SearchV2State = {
  search: {
    history: [],
    lastSearch: null,
    query: "",
  },
  filters: {
    role: ["creator", "member", "none"],
    type: ["project"],
    visibility: ["public", "private"],
  },
  sorting: AVAILABLE_SORTING.scoreDesc,
};

export const searchV2Slice = createSlice({
  name: "searchV2",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search.lastSearch = action.payload;
      state.search.history = [...state.search.history, action.payload];
    },
    setSorting: (state, action: PayloadAction<SortingItem>) => {
      state.sorting = action.payload;
    },
    toggleFilter: (state, action: PayloadAction<ToggleFilterPayload>) => {
      const arrayToUpdate =
        action.payload.filter === "visibility"
          ? state.filters.visibility
          : action.payload.filter === "type"
          ? state.filters.type
          : state.filters.role;
      const updatedArray = toggleArrayItem(
        [...arrayToUpdate],
        action.payload.value
      ) as ("creator" | "member" | "none")[] &
        ("project" | "user")[] &
        ("private" | "public")[];

      state.filters = {
        ...state.filters,
        [action.payload.filter]: updatedArray,
      };
    },
    reset: () => initialState,
  },
});

// helper function to toggle array items
function toggleArrayItem(array: string[], item: string) {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  } else {
    array.push(item);
  }
  return array;
}

export const { reset, setQuery, setSearch, setSorting, toggleFilter } =
  searchV2Slice.actions;
