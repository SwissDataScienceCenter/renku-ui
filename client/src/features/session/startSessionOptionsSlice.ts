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
import { createSliceSelector } from "../../utils/customHooks/UseSliceSelector";
import { StartSessionOptions } from "./startSessionOptions";
import { MIN_SESSION_STORAGE_GB } from "./startSessionOptions.constants";

const initialState: StartSessionOptions = {
  defaultUrl: "",
  sessionClass: 0,
  storage: MIN_SESSION_STORAGE_GB,
  lfsAutoFetch: false,
};

export const startSessionOptionsSlice = createSlice({
  name: "startSessionOptions",
  initialState,
  reducers: {
    setDefaultUrl: (state, action: PayloadAction<string>) => {
      state.defaultUrl = action.payload;
    },
    setSessionClass: (state, action: PayloadAction<number>) => {
      state.sessionClass = action.payload;
    },
    setStorage: (state, action: PayloadAction<number>) => {
      state.storage = action.payload;
    },
    setLfsAutoFetch: (state, action: PayloadAction<boolean>) => {
      state.lfsAutoFetch = action.payload;
    },
    reset: () => initialState,
  },
});

export const {
  setDefaultUrl,
  setSessionClass,
  setStorage,
  setLfsAutoFetch,
  reset,
} = startSessionOptionsSlice.actions;

export const useStartSessionOptionsSelector = createSliceSelector(
  startSessionOptionsSlice
);
