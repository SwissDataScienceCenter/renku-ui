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

import { createSlice } from "@reduxjs/toolkit";

import { projectCoreApi } from "./projectCoreApi";
import { versionsApi } from "../versions/versionsApi";
import { ProjectSlice } from "./Project";
import { createSliceSelector } from "../../utils/customHooks/UseSliceSelector";

const initialState: ProjectSlice = {
  migration: {
    cached: {
      branch: undefined,
      coreVersions: undefined,
      gitUrl: undefined,
      metadataVersion: undefined,
    },
    backendAvailable: undefined,
    computed: false,
    versionUrl: undefined,
  },
};

export const projectSlice = createSlice({
  name: "project",
  initialState: initialState,
  reducers: {},
  // ? The reducers computes project compatibility when both core versions on project migrations
  // ? become available. We could (greatly) simplify by requiring the core versions to be fetched
  // ? before showing any project relate feature.
  // ? In that case, we could ditch this logic and compute `backendAvailable` and `versionUrl`
  // ? after fetching the migration status.
  extraReducers: (builder) => {
    builder.addMatcher(
      projectCoreApi.endpoints.getMigrationStatus.matchPending,
      (state, payload) => {
        // ? reset backend availability when querying new projects
        if (
          (state.migration.cached.gitUrl &&
            state.migration.cached.gitUrl !==
              payload.meta.arg.originalArgs.gitUrl) ||
          (state.migration.cached.branch &&
            state.migration.cached.branch !==
              payload.meta.arg.originalArgs.branch)
        ) {
          state.migration.backendAvailable = undefined;
          state.migration.computed = false;
          state.migration.versionUrl = undefined;
          state.migration.cached.branch = undefined;
          state.migration.cached.gitUrl = undefined;
          state.migration.cached.metadataVersion = undefined;
        }
      }
    ),
      builder.addMatcher(
        versionsApi.endpoints.getCoreVersions.matchFulfilled,
        (state, payload) => {
          // store core available versions for convenience
          const coreVersions = payload.payload.metadataVersions;
          state.migration.cached.coreVersions = coreVersions;
          // ? In the unlikely case the migration status was fetched earlier, let's update the state
          if (
            state.migration.cached.metadataVersion &&
            !state.migration.computed
          ) {
            const data = computeBackendData(
              coreVersions,
              state.migration.cached.metadataVersion
            );
            state.migration.versionUrl = data.versionUrl;
            state.migration.backendAvailable = data.backendAvailable;
          }
        }
      ),
      builder.addMatcher(
        projectCoreApi.endpoints.getMigrationStatus.matchFulfilled,
        (state, payload) => {
          // update backend availability when fetching migration for another project
          state.migration.cached.branch = payload.meta.arg.originalArgs.branch;
          state.migration.cached.gitUrl = payload.meta.arg.originalArgs.gitUrl;
          if (
            payload.payload.details !== undefined &&
            payload.payload.details.core_compatibility_status.type ===
              "detail" &&
            payload.payload.details.core_compatibility_status
              .current_metadata_version
          ) {
            const metadataVersion = parseInt(
              payload.payload.details.core_compatibility_status
                .project_metadata_version
            );
            state.migration.cached.metadataVersion = metadataVersion;
            const data = computeBackendData(
              state.migration.cached.coreVersions,
              metadataVersion
            );
            state.migration.versionUrl = data.versionUrl;
            state.migration.backendAvailable = data.backendAvailable;
          } else {
            state.migration.cached.metadataVersion = undefined;
            state.migration.versionUrl = undefined;
            state.migration.backendAvailable = false;
          }
          state.migration.computed = true;
        }
      );
  },
});

interface BackendData {
  backendAvailable: boolean;
  versionUrl?: string;
}
/**
 * Verify whether the backend is available or not, and computer the correct version url
 */
function computeBackendData(
  availableVersions?: number[],
  projectVersion?: number
): BackendData {
  const data: BackendData = {
    backendAvailable: false,
    versionUrl: undefined,
  };
  if (!availableVersions || !projectVersion) return data;
  if (availableVersions.includes(projectVersion)) {
    data.backendAvailable = true;
    data.versionUrl = "/" + projectVersion;
  }
  return data;
}

export const useProjectSelector = createSliceSelector(projectSlice);
