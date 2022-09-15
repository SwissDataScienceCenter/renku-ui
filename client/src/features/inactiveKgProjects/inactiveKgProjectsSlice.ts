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
import { InactiveKgProjects } from "./InactiveKgProjects";

const initialState: InactiveKgProjects[] = [];

type RootStateInactiveProjects = { kgInactiveProjects: InactiveKgProjects[] };
interface ActivationStatus {
  id: number;
  progress: number;
}

export const kgInactiveProjectsSlice = createSlice({
  name: "kgInactiveProjects",
  initialState,
  reducers: {
    addFullList: (state, action: PayloadAction<InactiveKgProjects[]>) => {
      return action.payload;
    },
    updateList: (state, action: PayloadAction<InactiveKgProjects>) => {
      return state.map(p => {
        if (p.id === action.payload.id)
          p = action.payload;
        return p;
      });
    },
    updateProgress: (state, action: PayloadAction<ActivationStatus>) => {
      return state.map(p => {
        if (p.id === action.payload.id)
          p = { ...p, progressActivation: action.payload.progress };
        return p;
      });
    },
    reset: () => initialState
  },
});

export const { updateList, addFullList, updateProgress } =
  kgInactiveProjectsSlice.actions;
export const useInactiveProjectSelector: TypedUseSelectorHook<RootStateInactiveProjects> =
  useSelector;
export default kgInactiveProjectsSlice;
