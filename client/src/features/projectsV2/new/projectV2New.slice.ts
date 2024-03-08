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

import type { Project } from "../projectV2.types";

type NewProjectV2Step = 0 | 1 | 2 | 3;

export interface NewProjectV2State {
  project: Project;
  currentStep: NewProjectV2Step;
}

const initialState: NewProjectV2State = {
  project: {
    access: {
      members: [],
      visibility: "private",
    },
    content: {
      repositories: [],
    },
    metadata: {
      name: "",
      namespace: "",
      slug: "",
      description: "",
    },
  },
  currentStep: 0,
};

export const projectV2NewSlice = createSlice({
  name: "newProjectV2",
  initialState,
  reducers: {
    projectWasCreated: (state) => {
      state.project = initialState.project;
    },
    setAccess: (state, action: PayloadAction<Project["access"]>) => {
      state.project.access = action.payload;
    },
    setContent: (state, action: PayloadAction<Project["content"]>) => {
      state.project.content = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<NewProjectV2Step>) => {
      state.currentStep = action.payload;
    },
    setMetadata: (state, action: PayloadAction<Project["metadata"]>) => {
      state.project.metadata = action.payload;
    },
    reset: () => initialState,
  },
});

export const {
  projectWasCreated,
  setAccess,
  setContent,
  setCurrentStep,
  setMetadata,
  reset,
} = projectV2NewSlice.actions;
