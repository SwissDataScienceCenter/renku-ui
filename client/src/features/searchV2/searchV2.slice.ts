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

export interface SearchV2State {
  search: {
    history: string[];
    lastSearch: string | null;
    query: string;
  };
  filters: {
    visibility: ("private" | "public")[];
    type: ("project" | "user")[];
    role: ("creator" | "member" | "none")[];
  };
}

export interface ToggleFilterPayload {
  filter: keyof SearchV2State["filters"];
  value: string;
}

const initialState: SearchV2State = {
  search: {
    history: [],
    lastSearch: null,
    query: "",
  },
  filters: {
    visibility: ["public", "private"],
    type: ["project"],
    role: ["creator", "member", "none"],
  },
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
    // toggleFilter: (state, action: PayloadAction<ToggleFilterPayload>) => {
    //   if (state.filters[action.payload.filter].includes(action.payload.value)) {
    //     state.filters[action.payload.filter] = state.filters[
    //       action.payload.filter
    //     ].filter((value) => value !== action.payload.value);
    //   } else {
    //     state.filters[action.payload.filter].push(action.payload.value);
    //   }
    // },
    reset: () => initialState,
  },
});

export const { setQuery, setSearch, reset } = searchV2Slice.actions;
