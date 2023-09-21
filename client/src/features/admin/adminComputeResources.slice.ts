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
import { AdminComputeResources } from "./adminComputeResources.types";
import { createSliceSelector } from "../../utils/customHooks/UseSliceSelector";

const initialState: AdminComputeResources = {
  keycloakToken: "",
  keycloakTokenIsValid: false,
};

const adminComputeResourcesSlice = createSlice({
  name: "adminComputeResources",
  initialState,
  reducers: {
    setKeycloakToken: (state, action: PayloadAction<string>) => {
      state.keycloakToken = action.payload;
    },
    setKeycloakTokenIsValid: (state, action: PayloadAction<boolean>) => {
      state.keycloakTokenIsValid = action.payload;
    },
    reset: () => initialState,
  },
});

export default adminComputeResourcesSlice;
export const { setKeycloakToken, setKeycloakTokenIsValid } =
  adminComputeResourcesSlice.actions;

export const useAdminComputeResourcesSelector = createSliceSelector(
  adminComputeResourcesSlice
);
