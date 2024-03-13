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

import { RepositorySupport, SessionConfigV2 } from "./sessionConfigV2.types";

const initialState: SessionConfigV2 = {
  repositorySupport: {},
  projectSupport: {},
};

const sessionConfigV2Slice = createSlice({
  name: "sessionConfigV2",
  initialState,
  reducers: {
    initializeRepository: (state, action: PayloadAction<string>) => {
      const url = action.payload;
      state.repositorySupport[url] = {
        isLoading: true,
        supportsSessions: false,
      };
    },
    setRepositorySupport: (
      state,
      action: PayloadAction<SetRepositorySupportPayload>
    ) => {
      const { url, ...support } = action.payload;
      state.repositorySupport[url] = support;
    },
    initializeProject: (
      state,
      action: PayloadAction<InitializeProjectPayload>
    ) => {
      const { projectId, repositories } = action.payload;
      state.projectSupport[projectId] = {
        isLoading: repositories.length > 0,
        repositories,
        repositoriesConfig: repositories.map(() => ({
          isLoading: true,
          supportsSessions: false,
        })),
      };
    },
    updateProjectRepository: (
      state,
      action: PayloadAction<UpdateProjectRepositoryPayload>
    ) => {
      const { projectId, index, ...support } = action.payload;
      const projectSupport = state.projectSupport[projectId];

      if (!projectSupport) {
        throw new Error(
          `Error: state for project ${projectId} is not initialized`
        );
      }

      projectSupport.repositoriesConfig[index] = support;

      // Check if everything is loaded
      if (
        projectSupport.repositoriesConfig.every(({ isLoading }) => !isLoading)
      ) {
        projectSupport.isLoading = false;
      }
    },
    reset: () => initialState,
  },
});

type SetRepositorySupportPayload = { url: string } & RepositorySupport & {
    isLoading: false;
  };

interface InitializeProjectPayload {
  projectId: string;
  repositories: string[];
}

type UpdateProjectRepositoryPayload = {
  projectId: string;
  index: number;
} & RepositorySupport & {
    isLoading: false;
  };

export default sessionConfigV2Slice;
