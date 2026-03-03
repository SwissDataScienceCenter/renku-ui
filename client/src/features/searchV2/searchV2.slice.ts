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

import type { RootState } from "../../store/store";
import type { SearchQuery } from "./api/searchV2Api.api";
import {
  DEFAULT_CONTENT_TYPE,
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE,
} from "./searchV2.constants";
import type {
  ApplyParsedSearchParams,
  InitFromUrlParams,
  SearchV2State,
} from "./searchV2.types";
import { buildApiQuery } from "./searchV2.utils";

const initialState: SearchV2State = {
  query: "",
  contentType: DEFAULT_CONTENT_TYPE,
  visibility: "",
  role: "",
  keywords: "",
  directMember: "",
  created: "",
  page: FIRST_PAGE,
  perPage: DEFAULT_PAGE_SIZE,
  namespace: undefined,
  includeCounts: true,
  searchBarFilterKeys: [],
};

export const searchV2Slice = createSlice({
  name: "searchV2",
  initialState,
  reducers: {
    initFromUrl: (state, action: PayloadAction<InitFromUrlParams>) => {
      const p = action.payload;
      state.query = p.query;
      state.contentType = p.contentType;
      state.visibility = p.visibility;
      state.role = p.role;
      state.keywords = p.keywords;
      state.directMember = p.directMember;
      state.created = p.created;
      state.page = p.page;
      state.perPage = p.perPage;
      state.searchBarFilterKeys = [];
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.page = FIRST_PAGE;
    },
    setContentType: (state, action: PayloadAction<string>) => {
      state.contentType = action.payload;
      state.page = FIRST_PAGE;
    },
    setVisibility: (state, action: PayloadAction<string>) => {
      state.visibility = action.payload;
      state.page = FIRST_PAGE;
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
      state.page = FIRST_PAGE;
    },
    setKeywords: (state, action: PayloadAction<string>) => {
      state.keywords = action.payload;
      state.page = FIRST_PAGE;
    },
    toggleKeyword: (state, action: PayloadAction<string>) => {
      const separator = "+";
      const current = state.keywords ? state.keywords.split(separator) : [];
      const idx = current.indexOf(action.payload);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(action.payload);
      }
      state.keywords = current.join(separator);
      state.page = FIRST_PAGE;
    },
    setDirectMember: (state, action: PayloadAction<string>) => {
      state.directMember = action.payload;
      state.page = FIRST_PAGE;
    },
    setCreated: (state, action: PayloadAction<string>) => {
      state.created = action.payload;
      state.page = FIRST_PAGE;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.perPage = action.payload;
      state.page = FIRST_PAGE;
    },
    setNamespace: (state, action: PayloadAction<string | undefined>) => {
      state.namespace = action.payload;
    },
    applyParsedSearch: (
      state,
      action: PayloadAction<ApplyParsedSearchParams>
    ) => {
      const { query, contentType, visibility, role, created } = action.payload;
      state.query = query;
      if (contentType != null) state.contentType = contentType;
      if (visibility != null) state.visibility = visibility;
      if (role != null) state.role = role;
      if (created != null) state.created = created;
      state.page = FIRST_PAGE;

      const keys: string[] = [];
      if (contentType != null) keys.push("contentType");
      if (visibility != null) keys.push("visibility");
      if (role != null) keys.push("role");
      if (created != null) keys.push("created");
      state.searchBarFilterKeys = keys;
    },
    reset: () => initialState,
  },
});

export const {
  initFromUrl,
  setQuery,
  setContentType,
  setVisibility,
  setRole,
  setKeywords,
  toggleKeyword,
  setDirectMember,
  setCreated,
  setPage,
  setPerPage,
  setNamespace,
  applyParsedSearch,
  reset,
} = searchV2Slice.actions;

export function selectSearchApiQuery(state: RootState): SearchQuery {
  return buildApiQuery(state.searchV2);
}
