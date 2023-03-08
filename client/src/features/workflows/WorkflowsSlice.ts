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

import { WorkflowsDisplay } from "./Workflows";


type RootStateWorkflowsDisplay = WorkflowsDisplay;
const initialState: WorkflowsDisplay = {
  details: {},
  expanded: [],
  orderAscending: true,
  orderProperty: "workflowType",
  showInactive: false,
};

interface WorkflowsTogglePayload {
  workflowId: string;
}

interface WorkflowsSetOrderPropertyPayload {
  newProperty: string;
}

interface WorkflowsSetDetailPayload {
  targetDetails: Record<string, any>; // ? There are many types, not sure it makes sense to add specific types
}

export const workflowsSlice = createSlice({
  name: "workflowsDisplay",
  initialState,
  reducers: {
    toggleExpanded(state, action: PayloadAction<WorkflowsTogglePayload>) {
      if (state.expanded.includes(action.payload.workflowId))
        state.expanded = state.expanded.filter((e: any) => e !== action.payload.workflowId);
      else
        state.expanded = [...state.expanded, action.payload.workflowId];
    },
    toggleInactive(state) {
      state.showInactive = !state.showInactive;
    },
    toggleAscending(state) {
      state.orderAscending = !state.orderAscending;
    },
    setOrderProperty(state, action: PayloadAction<WorkflowsSetOrderPropertyPayload>) {
      state.orderProperty = action.payload.newProperty;
    },
    setDetail(state, action: PayloadAction<WorkflowsSetDetailPayload>) {
      state.details = action.payload.targetDetails;
    },
    reset: () => initialState
  },
});

export const useWorkflowsSelector: TypedUseSelectorHook<RootStateWorkflowsDisplay> = useSelector;
export default workflowsSlice;
