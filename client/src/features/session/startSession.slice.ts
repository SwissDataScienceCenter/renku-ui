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
import { StepsProgressBar } from "../../components/progress/ProgressSteps";
import { StartSession } from "./startSession.types";

const initialState: StartSession = {
  error: null,
  errorMessage: "",
  starting: false,
  steps: [],
};

const startSessionSlice = createSlice({
  name: "startSession",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      state.error = action.payload.error;
      state.errorMessage = action.payload.errorMessage ?? "";

      state.starting = false;
    },
    setStarting: (state, action: PayloadAction<boolean>) => {
      state.starting = action.payload;
    },
    setSteps: (state, action: PayloadAction<StepsProgressBar[]>) => {
      state.steps.splice(0, -1, ...action.payload);
    },
    updateStepStatus: (
      state,
      action: PayloadAction<Omit<StepsProgressBar, "step">>
    ) => {
      const step = state.steps.find((step) => step.id === action.payload.id);
      if (step) {
        step.status = action.payload.status;
      }
    },
    reset: () => initialState,
  },
});

type SetErrorPayload = Pick<StartSession, "error"> &
  Partial<Pick<StartSession, "errorMessage">>;

export default startSessionSlice;
export const { setError, setStarting, setSteps, updateStepStatus, reset } =
  startSessionSlice.actions;
