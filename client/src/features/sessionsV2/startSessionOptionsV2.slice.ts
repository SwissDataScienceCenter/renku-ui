/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
  SessionRepository,
  StartSessionOptionsV2,
} from "./startSessionOptionsV2.types";
import { MIN_SESSION_STORAGE_GB } from "../session/startSessionOptions.constants";
import type {
  DockerImageStatus,
  SessionCloudStorage,
  SessionEnvironmentVariable,
} from "../session/startSessionOptions.types";

const initialState: StartSessionOptionsV2 = {
  cloudStorage: [],
  defaultUrl: "",
  dockerImageStatus: "unknown",
  environmentVariables: [],
  lfsAutoFetch: false,
  repositories: [],
  sessionClass: 0,
  storage: MIN_SESSION_STORAGE_GB,
};

const startSessionOptionsV2Slice = createSlice({
  name: "startSessionOptionsV2",
  initialState,
  reducers: {
    addCloudStorageItem: (
      state,
      action: PayloadAction<SessionCloudStorage>
    ) => {
      state.cloudStorage.push(action.payload);
    },
    addEnvironmentVariable: (state) => {
      state.environmentVariables.push({ name: "", value: "" });
    },
    removeCloudStorageItem: (
      state,
      action: PayloadAction<{ index: number }>
    ) => {
      state.cloudStorage.splice(action.payload.index, 1);
    },
    removeEnvironmentVariable: (
      state,
      action: PayloadAction<{ index: number }>
    ) => {
      state.environmentVariables.splice(action.payload.index, 1);
    },
    setCloudStorage: (state, action: PayloadAction<SessionCloudStorage[]>) => {
      state.cloudStorage.splice(0, -1, ...action.payload);
    },
    setDefaultUrl: (state, action: PayloadAction<string>) => {
      state.defaultUrl = action.payload;
    },
    setDockerImageStatus: (state, action: PayloadAction<DockerImageStatus>) => {
      state.dockerImageStatus = action.payload;
    },
    setLfsAutoFetch: (state, action: PayloadAction<boolean>) => {
      state.lfsAutoFetch = action.payload;
    },
    setRepositories: (state, action: PayloadAction<SessionRepository[]>) => {
      state.repositories.splice(0, Infinity, ...action.payload);
    },
    setSessionClass: (state, action: PayloadAction<number>) => {
      state.sessionClass = action.payload;
    },
    setStorage: (state, action: PayloadAction<number>) => {
      state.storage = action.payload;
    },
    updateCloudStorageItem: (
      state,
      action: PayloadAction<{ index: number; storage: SessionCloudStorage }>
    ) => {
      state.cloudStorage[action.payload.index] = action.payload.storage;
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
    updateRepository: (
      state,
      action: PayloadAction<UpdateRepositoryPayload>
    ) => {
      state.repositories[action.payload.index] = action.payload.repository;
    },
    reset: () => initialState,
  },
});

interface UpdateRepositoryPayload {
  index: number;
  repository: SessionRepository;
}

export default startSessionOptionsV2Slice;
