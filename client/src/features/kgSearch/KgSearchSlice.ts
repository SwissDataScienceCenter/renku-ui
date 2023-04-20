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
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { KgSearchState } from "./KgSearch";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { DateFilterTypes } from "../../components/dateFilter/DateFilter";

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
  initialState,
  reducers: {
    setPhrase: (state, action: PayloadAction<string>) => {
      console.log("redux: setPhrase", { action });
      state.phrase = action.payload;
    },
    reset: () => initialState,
  },
});

// export const useKgSearchSelector: TypedUseSelectorHook<KgSearchState> = useSelector;
