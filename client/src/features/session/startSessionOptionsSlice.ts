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
import { MIN_SESSION_STORAGE_GB } from "./startSessionOptions.constants";
import {
  DockerImageBuildStatus,
  DockerImageStatus,
  SessionCloudStorageMount,
  SessionCloudStorageV2,
  SessionEnvironmentVariable,
  StartSessionOptions,
} from "./startSessionOptions.types";

const initialState: StartSessionOptions = {
  branch: "",
  cloudStorage: [],
  cloudStorageV2: [],
  commit: "",
  defaultUrl: "",
  dockerImageBuildStatus: "unknown",
  dockerImageStatus: "unknown",
  environmentVariables: [],
  lfsAutoFetch: false,
  pinnedDockerImage: "",
  sessionClass: 0,
  storage: MIN_SESSION_STORAGE_GB,
};

export const startSessionOptionsSlice = createSlice({
  name: "startSessionOptions",
  initialState,
  reducers: {
    addCloudStorageMount: (state) => {
      state.cloudStorage.push({ bucket: "", endpoint: "" });
    },
    addCloudStorageV2: (
      state,
      action: PayloadAction<SessionCloudStorageV2>
    ) => {
      state.cloudStorageV2.push(action.payload);
    },
    addEnvironmentVariable: (state) => {
      state.environmentVariables.push({ name: "", value: "" });
    },
    removeCloudStorageMount: (
      state,
      action: PayloadAction<{ index: number }>
    ) => {
      state.cloudStorage.splice(action.payload.index, 1);
    },
    removeCloudStorageV2: (state, action: PayloadAction<{ index: number }>) => {
      state.cloudStorageV2.splice(action.payload.index, 1);
    },
    removeEnvironmentVariable: (
      state,
      action: PayloadAction<{ index: number }>
    ) => {
      state.environmentVariables.splice(action.payload.index, 1);
    },
    setBranch: (state, action: PayloadAction<string>) => {
      state.branch = action.payload;
      // Also reset the commit when a branch is set
      state.commit = "";
      // Also reset the docker image status when a branch is set
      state.dockerImageStatus = "unknown";
    },
    setCloudStorageV2: (
      state,
      action: PayloadAction<SessionCloudStorageV2[]>
    ) => {
      state.cloudStorageV2.splice(0, -1, ...action.payload);
    },
    setCommit: (state, action: PayloadAction<string>) => {
      state.commit = action.payload;
      // Also reset the docker image status when a commit is set
      state.dockerImageBuildStatus = "unknown";
      state.dockerImageStatus = "unknown";
    },
    setDefaultUrl: (state, action: PayloadAction<string>) => {
      state.defaultUrl = action.payload;
    },
    setDockerImageBuildStatus: (
      state,
      action: PayloadAction<DockerImageBuildStatus>
    ) => {
      state.dockerImageBuildStatus = action.payload;
    },
    setDockerImageStatus: (state, action: PayloadAction<DockerImageStatus>) => {
      state.dockerImageStatus = action.payload;
    },
    setLfsAutoFetch: (state, action: PayloadAction<boolean>) => {
      state.lfsAutoFetch = action.payload;
    },
    setPinnedDockerImage: (state, action: PayloadAction<string>) => {
      state.pinnedDockerImage = action.payload;
    },
    setSessionClass: (state, action: PayloadAction<number>) => {
      state.sessionClass = action.payload;
    },
    setStorage: (state, action: PayloadAction<number>) => {
      state.storage = action.payload;
    },
    updateCloudStorageMount: (
      state,
      action: PayloadAction<{
        index: number;
        mount: SessionCloudStorageMount;
      }>
    ) => {
      state.cloudStorage[action.payload.index] = action.payload.mount;
    },
    updateCloudStorageV2Item: (
      state,
      action: PayloadAction<{ index: number; storage: SessionCloudStorageV2 }>
    ) => {
      state.cloudStorageV2[action.payload.index] = action.payload.storage;
    },
    updateEnvironmentVariable: (
      state,
      action: PayloadAction<{
        index: number;
        variable: SessionEnvironmentVariable;
      }>
    ) => {
      state.environmentVariables[action.payload.index] =
        action.payload.variable;
    },
    reset: () => initialState,
  },
});

export const {
  addCloudStorageMount,
  addCloudStorageV2,
  addEnvironmentVariable,
  removeCloudStorageMount,
  removeCloudStorageV2,
  removeEnvironmentVariable,
  setBranch,
  setCloudStorageV2,
  setCommit,
  setDefaultUrl,
  setDockerImageBuildStatus,
  setDockerImageStatus,
  setLfsAutoFetch,
  setPinnedDockerImage,
  setSessionClass,
  setStorage,
  updateCloudStorageMount,
  updateCloudStorageV2Item,
  updateEnvironmentVariable,
  reset,
} = startSessionOptionsSlice.actions;

export const useStartSessionOptionsSelector = createSliceSelector(
  startSessionOptionsSlice
);
