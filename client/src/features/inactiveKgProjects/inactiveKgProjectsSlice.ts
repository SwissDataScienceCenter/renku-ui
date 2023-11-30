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
import type { InactiveKgProjects } from "./inactiveKgProjects.types";
import { ActivationStatusProgressError } from "./InactiveKgProjectsApi";

export interface KgInactiveProjectsState {
  inactiveProjects: InactiveKgProjects[];
  activationStatus: {
    activationStartedAt: number | null;
    isActivating: boolean;
    isActivationSlow: boolean | null;
    lastUpdateAt: number | null;
  };
}

const initialState: KgInactiveProjectsState = {
  inactiveProjects: [],
  activationStatus: {
    activationStartedAt: null,
    isActivating: false,
    isActivationSlow: null,
    lastUpdateAt: null,
  },
};

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
      state.inactiveProjects = action.payload;
      return state;
    },
    setActivating: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.activationStatus.isActivating = true;
        state.activationStatus.activationStartedAt = Date.now();
        state.activationStatus.isActivationSlow = false;
      } else {
        state.activationStatus.isActivating = false;
        state.activationStatus.activationStartedAt = null;
        state.activationStatus.isActivationSlow = null;
      }
      return state;
    },
    setActivationSlow: (state, action: PayloadAction<boolean>) => {
      if (state.activationStatus.isActivating) {
        state.activationStatus.isActivationSlow = action.payload;
      }
      return state;
    },
    updateAllSelected(state, action: PayloadAction<boolean>) {
      state.inactiveProjects = state.inactiveProjects.map((p) => {
        return { ...p, selected: action.payload };
      });
      return state;
    },
    updateList: (state, action: PayloadAction<InactiveKgProjects>) => {
      state.inactiveProjects = state.inactiveProjects.map((p) => {
        if (p.id === action.payload.id) p = action.payload;
        return p;
      });
      return state;
    },
    updateProgress: (state, action: PayloadAction<ActivationStatus>) => {
      state.inactiveProjects = state.inactiveProjects.map((p) => {
        const isProgressError =
          ActivationStatusProgressError.TIMEOUT === action.payload.progress ||
          ActivationStatusProgressError.UNKNOWN === action.payload.progress ||
          ActivationStatusProgressError.WEB_SOCKET_ERROR ===
            action.payload.progress;
        return p.id === action.payload.id
          ? {
              ...p,
              progressActivation: action.payload.progress,
              selected: !isProgressError,
            }
          : p;
      });
      state.activationStatus.lastUpdateAt = Date.now();
      return state;
    },
    reset: () => initialState,
  },
});

export const {
  addFullList,
  setActivating,
  setActivationSlow,
  updateAllSelected,
  updateList,
  updateProgress,
} = kgInactiveProjectsSlice.actions;
