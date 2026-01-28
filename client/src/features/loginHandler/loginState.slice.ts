/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { LoginState } from "./loginState.types";

const initialState: LoginState = {
  isLoggedIn: false,
  shouldBeLoggedIn: false,
};

export const loginStateSlice = createSlice({
  name: "loginState",
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setShouldBeLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.shouldBeLoggedIn = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setIsLoggedIn, setShouldBeLoggedIn, reset } =
  loginStateSlice.actions;
