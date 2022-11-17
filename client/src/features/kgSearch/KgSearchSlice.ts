/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { TypeEntitySelection } from "../../utils/components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../utils/components/visibilityFilter/VisibilityFilter";
import { SortingOptions } from "../../utils/components/sortingEntities/SortingEntities";
import { KgAuthor } from "./KgSearch";
import { dateFilterTypes, DatesFilter } from "../../utils/components/dateFilter/DateFilter";

export interface KgSearchFormState {
  phrase: string;
  sort: SortingOptions;
  page: number;
  perPage: number;
  type: TypeEntitySelection;
  author: KgAuthor;
  visibility: VisibilitiesFilter;
  since: string;
  until: string;
  typeDate: dateFilterTypes;
}

const initialState: KgSearchFormState = {
  phrase: "",
  sort: SortingOptions.AscTitle,
  page: 1,
  perPage: 24,
  type: {
    project: true,
    dataset: true,
  },
  author: "all",
  visibility: {
    private: false,
    public: false,
    internal: false,
  },
  since: "",
  until: "",
  typeDate: dateFilterTypes.all
};

type RootStateWithKgSearchForm = { kgSearchForm: KgSearchFormState };

export const kgSearchFormSlice = createSlice({
  name: "kgSearchForm",
  initialState,
  reducers: {
    setAuthor: (state, action: PayloadAction<KgAuthor>) => {
      state.author = action.payload;
      state.page = 1;
    },
    setPhrase: (state, action: PayloadAction<string>) => {
      state.phrase = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<SortingOptions>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setType: (state, action: PayloadAction<TypeEntitySelection>) => {
      state.type = action.payload;
      state.page = 1;
    },
    setDates: (state, action: PayloadAction<DatesFilter>) => {
      state.since = action.payload.since ?? "";
      state.until = action.payload.until ?? "";
      state.typeDate = action.payload.type ?? dateFilterTypes.all;
    },
    setVisibility: (state, action: PayloadAction<VisibilitiesFilter>) => {
      state.visibility = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => { state.page = action.payload; },
    setMyProjects: (state, action: PayloadAction) => {
      state.type = {
        project: true,
        dataset: false,
      };
      state.author = "user";
      state.phrase = "";
      state.page = 1;
    },
    setMyDatasets: (state, action: PayloadAction) => {
      state.type = {
        project: false,
        dataset: true,
      };
      state.author = "user";
      state.phrase = "";
      state.page = 1;
    },
    removeFilters: (state, action: PayloadAction) => {
      state.type = initialState.type;
      state.author = initialState.author;
      state.page = initialState.page;
      state.typeDate = initialState.typeDate;
      state.since = initialState.since;
      state.until = initialState.until;
      state.visibility = initialState.visibility;
      state.sort = initialState.sort;
    },
    reset: () => initialState
  },
});

export const {
  setAuthor, setDates, setVisibility, setPage, setPhrase, setSort, setType,
  setMyDatasets, setMyProjects, reset, removeFilters } =
  kgSearchFormSlice.actions;
export const useKgSearchFormSelector: TypedUseSelectorHook<RootStateWithKgSearchForm> =
  useSelector;
export default kgSearchFormSlice;
