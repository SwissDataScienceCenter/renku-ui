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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny, TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { KgAuthor, KgSearchState } from "./KgSearch";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { DateFilterTypes, DatesFilter } from "../../components/dateFilter/DateFilter";
import { searchStringToStateV2, stateToSearchStringV2 } from "./KgSearchState";
import { useLocation } from "react-router";
import { useCallback } from "react";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";

const initialState: KgSearchState = {
  author: "all",
  page: 1,
  perPage: 24,
  phrase: "",
  since: "",
  sort: SortingOptions.DescMatchingScore,
  type: { project: true, dataset: false, },
  typeDate: DateFilterTypes.all,
  until: "",
  visibility: { private: true, public: true, internal: true },
};

export const kgSearchSlice = createSlice({
  name: 'kgSearchSlice',
  initialState: () => {
    // const location = useLocation();
    const location = window.location;
    const state = searchStringToStateV2(location.search);

    // // Normalize search string in the URL bar
    // const search = stateToSearchStringV2(state);
    // if (search !== location.search.slice(1)) {
    //   console.log("history.replace", { search, init: location.search });
    //   window.history.replaceState({ search });
    // }

    return state;
  },
  reducers: {
    // initializeFromSearchString: (state, action: PayloadAction<string>) => {
    //   console.log("redux: initializeFromSearchString", { action });
    //   return searchStringToStateV2(action.payload)
    // },
    updateFromSearchString: (state, action: PayloadAction<string>) => {
      console.log("redux: updateFromSearchString", { action });
      const newState = searchStringToStateV2(action.payload);
      state.author = newState.author;
      state.since = newState.since;
      state.until = newState.until;
      state.typeDate = newState.typeDate;
      state.phrase = newState.phrase;
      state.page = newState.page;
      state.sort = newState.sort;
      state.type.project = newState.type.project;
      state.type.dataset = newState.type.dataset;
      state.visibility.public = newState.visibility.public;
      state.visibility.internal = newState.visibility.internal;
      state.visibility.private = newState.visibility.private;
    },
    setAuthor: (state, action: PayloadAction<KgAuthor>) => {
      console.log("redux: setAuthor", { action });
      state.author = action.payload;
    },
    setDates: (state, action: PayloadAction<DatesFilter>) => {
      console.log("redux: setDates", { action });
      state.since = action.payload.since ?? "";
      state.until = action.payload.until ?? "";
      state.typeDate = action.payload.type ?? DateFilterTypes.all;
    },
    setMyProjects: (state) => {
      console.log("redux: setMyProjects");
      state.type.project = true;
      state.type.dataset = false;
      state.author = 'user';
      state.phrase = "";
      state.page = 1;
    },
    setMyDatasets: (state) => {
      console.log("redux: setMyDatasets");
      state.type.project = false;
      state.type.dataset = true;
      state.author = 'user';
      state.phrase = "";
      state.page = 1;
    },
    setPhrase: (state, action: PayloadAction<string>) => {
      console.log("redux: setPhrase", { action });
      state.phrase = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      console.log("redux: setPage", { action });
      state.page = action.payload;
    },
    setSort: (state, action: PayloadAction<SortingOptions>) => {
      console.log("redux: setSort", { action });
      state.sort = action.payload;
    },
    setType: (state, action: PayloadAction<TypeEntitySelection>) => {
      console.log("redux: setType", { action });
      state.type.project = action.payload.project;
      state.type.dataset = action.payload.dataset;
    },
    setVisibility: (state, action: PayloadAction<VisibilitiesFilter>) => {
      console.log("redux: setVisibility", { action });
      state.visibility.public = action.payload.public;
      state.visibility.internal = action.payload.internal;
      state.visibility.private = action.payload.private;
    },
    reset: () => {
      console.log("redux: reset");
      return initialState;
    },
  },
});

export const useKgSearchSlice = () => {
  const kgSearchState = useSelector((state: RootStateOrAny) => state[kgSearchSlice.name] as KgSearchState);
  const dispatch = useDispatch();

  const updateFromSearchString = useCallback((search: string) => dispatch(kgSearchSlice.actions.updateFromSearchString(search)), [dispatch]);
  const setAuthor = useCallback((author: KgAuthor) => dispatch(kgSearchSlice.actions.setAuthor(author)), [dispatch]);
  const setDates = useCallback((dates: DatesFilter) => dispatch(kgSearchSlice.actions.setDates(dates)), [dispatch]);
  const setMyProjects = useCallback(() => dispatch(kgSearchSlice.actions.setMyProjects()), [dispatch]);
  const setMyDatasets = useCallback(() => dispatch(kgSearchSlice.actions.setMyDatasets()), [dispatch]);
  const setPhrase = useCallback((phrase: string) => dispatch(kgSearchSlice.actions.setPhrase(phrase)), [dispatch]);
  const setPage = useCallback((page: number) => dispatch(kgSearchSlice.actions.setPage(page)), [dispatch]);
  const setSort = useCallback((sort: SortingOptions) => dispatch(kgSearchSlice.actions.setSort(sort)), [dispatch]);
  const setType = useCallback((type: TypeEntitySelection) => dispatch(kgSearchSlice.actions.setType(type)), [dispatch]);
  const setVisibility = useCallback((visibility: VisibilitiesFilter) => dispatch(kgSearchSlice.actions.setVisibility(visibility)), [dispatch]);
  const reset = useCallback(() => dispatch(kgSearchSlice.actions.reset()), [dispatch]);

  return {
    kgSearchState,
    updateFromSearchString,
    setAuthor,
    setDates,
    setMyProjects,
    setMyDatasets,
    setPhrase,
    setPage,
    setSort,
    setType,
    setVisibility,
    reset,
  }
}
