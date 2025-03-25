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
import {
  Display,
  DoiPage,
  FaviconStatus,
  ProjectConfig,
  SessionConfig,
} from "./display.types";

const initialState: Display = {
  favicon: "general",
  doiPage: "link",
  modals: {
    ssh: {
      show: false,
      projectPath: "",
      gitUrl: "",
      branch: "",
    },
    sessionLogs: {
      show: false,
      targetServer: "",
    },
  },
};

export const displaySlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    setFavicon: (state, action: PayloadAction<FaviconStatus>) => {
      state.favicon = action.payload;
    },
    resetFavicon: (state) => {
      state.favicon = initialState.favicon;
    },
    showSshModal: (state, action: PayloadAction<ProjectConfig>) => {
      state.modals.ssh = {
        show: true,
        projectPath: action.payload.projectPath,
        gitUrl: action.payload.gitUrl,
        branch: action.payload.branch,
      };
    },
    hideSshModal: (state) => {
      state.modals.ssh.show = false;
    },
    toggleSshModal: (state) => {
      state.modals.ssh.show = !state.modals.ssh.show;
    },

    showSessionLogsModal: (state, action: PayloadAction<SessionConfig>) => {
      state.modals.sessionLogs = {
        show: true,
        targetServer: action.payload.targetServer,
      };
    },
    hideSessionLogsModal: (state) => {
      state.modals.sessionLogs.show = false;
    },
    toggleSessionLogsModal: (state, action: PayloadAction<SessionConfig>) => {
      state.modals.sessionLogs = {
        show: !state.modals.sessionLogs.show,
        targetServer: action.payload.targetServer ?? "",
      };
    },

    setDoiPage: (state, action: PayloadAction<DoiPage>) => {
      state.doiPage = action.payload;
    },

    reset: () => initialState,
  },
});

export const {
  showSshModal,
  hideSshModal,
  toggleSshModal,
  toggleSessionLogsModal,
  reset,
  resetFavicon,
  setFavicon,
  setDoiPage,
} = displaySlice.actions;
