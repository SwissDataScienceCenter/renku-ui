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

export interface NewProjectV2State {
  showProjectCreationModal: boolean;
  showGroupCreationModal: boolean;
}

const initialState: NewProjectV2State = {
  showProjectCreationModal: false,
  showGroupCreationModal: false,
};

export const projectV2NewSlice = createSlice({
  name: "newProjectV2",
  initialState,
  reducers: {
    reset: () => initialState,
    setGroupCreationModal: (state, action: PayloadAction<boolean>) => {
      state.showGroupCreationModal = action.payload;
    },
    setProjectCreationModal: (state, action: PayloadAction<boolean>) => {
      state.showProjectCreationModal = action.payload;
    },
    toggleGroupCreationModal: (state) => {
      state.showGroupCreationModal = !state.showGroupCreationModal;
    },
    toggleProjectCreationModal: (state) => {
      state.showProjectCreationModal = !state.showProjectCreationModal;
    },
  },
});

export const {
  reset,
  setGroupCreationModal,
  setProjectCreationModal,
  toggleGroupCreationModal,
  toggleProjectCreationModal,
} = projectV2NewSlice.actions;
