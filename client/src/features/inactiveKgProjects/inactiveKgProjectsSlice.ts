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
import { createSliceSelector } from "../../utils/customHooks/UseSliceSelector";
import { ActivationStatusProgressError } from "./InactiveKgProjectsApi";
import type { InactiveKgProjects } from "./inactiveKgProjects.types";

const initialState: InactiveKgProjects[] = [];

export enum ActivationStatusProgressSpecial {
  QUEUED = -1,
}

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
    updateAllSelected(state, action: PayloadAction<boolean>) {
      return state.map((p) => {
        return { ...p, selected: action.payload };
      });
    },
    updateList: (state, action: PayloadAction<InactiveKgProjects>) => {
      return state.map((p) => {
        if (p.id === action.payload.id) p = action.payload;
        return p;
      });
    },
    updateProgress: (state, action: PayloadAction<ActivationStatus>) => {
      return state.map((p) => {
        const isProgressError =
          ActivationStatusProgressError.TIMEOUT === action.payload.progress ||
          ActivationStatusProgressError.UNKNOWN === action.payload.progress;
        return p.id === action.payload.id
          ? {
              ...p,
              progressActivation: action.payload.progress,
              selected: !isProgressError,
            }
          : p;
      });
    },
    reset: () => initialState,
  },
});

export const { addFullList, updateAllSelected, updateList, updateProgress } =
  kgInactiveProjectsSlice.actions;

export const useInactiveProjectSelector = createSliceSelector(
  kgInactiveProjectsSlice
);
