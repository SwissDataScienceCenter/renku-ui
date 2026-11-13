/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import {
  projectCloudStorageGeneratedApi,
  type GetProjectStorageV2ApiArg,
  type GetProjectStorageV2ApiResponse,
} from "./projectCloudStorage.generated-api";

// Fixes some API endpoints
const withFixedEndpoints = projectCloudStorageGeneratedApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectStorageV2: build.query<
      GetProjectStorageV2ApiResponse,
      GetProjectStorageV2ApiArg
    >({
      query: ({ params }) => ({
        url: `/project_storage_v2`,
        params,
      }),
    }),
  }),
  overrideExisting: true,
});

// Adds tag handling for cache management
const projectCloudStorageApi = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: [
    "CloudStorageSchema",
    "ProjectStorage",
    "ProjectStorageAllow",
    "ProjectStorageV2",
  ],
  endpoints: {
    getStorageSchema: {
      providesTags: ["CloudStorageSchema"],
    },
    getProjectsByProjectIdStorage: {
      providesTags: ["ProjectStorage"],
    },
    postStorage: {
      invalidatesTags: ["ProjectStorage"],
    },
    deleteStorageByStorageId: {
      invalidatesTags: ["ProjectStorage"],
    },
    patchStorageByStorageId: {
      invalidatesTags: ["ProjectStorage"],
    },
    getStorageAllow: {
      providesTags: ["ProjectStorageAllow"],
    },
    getStorageAllowByProjectId: {
      providesTags: ["ProjectStorageAllow"],
    },
    postStorageAllow: {
      invalidatesTags: ["ProjectStorageAllow"],
    },
    deleteStorageAllowByProjectId: {
      invalidatesTags: ["ProjectStorageAllow"],
    },
    patchStorageAllowByProjectId: {
      invalidatesTags: ["ProjectStorageAllow"],
    },
    getProjectStorageV2: {
      providesTags: (result, _error, { params }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "ProjectStorageV2" as const,
              })),
              {
                id: `LIST-${params?.project_id}-${params?.storage_quota_id}`,
                type: "ProjectStorageV2",
              },
            ]
          : [
              {
                id: `LIST-${params?.project_id}-${params?.storage_quota_id}`,
                type: "ProjectStorageV2",
              },
            ],
    },
    postProjectStorageV2: {
      invalidatesTags: (
        _result,
        _error,
        { projectStoragePostV2: { project_id, storage_quota_id } },
      ) => [
        {
          id: `LIST-${project_id}-${storage_quota_id}`,
          type: "ProjectStorageV2",
        },
        {
          id: `LIST-${undefined}-${storage_quota_id}`,
          type: "ProjectStorageV2",
        },
        {
          id: `LIST-${project_id}-${undefined}`,
          type: "ProjectStorageV2",
        },
        {
          id: `LIST-${undefined}-${undefined}`,
          type: "ProjectStorageV2",
        },
      ],
    },
  },
});

export const {
  useGetStorageSchemaQuery,
  usePostStorageSchemaTestConnectionMutation,
  useGetProjectsByProjectIdStorageQuery,
  usePostStorageMutation,
  useDeleteStorageByStorageIdMutation,
  usePatchStorageByStorageIdMutation,
  useGetStorageAllowQuery,
  useGetStorageAllowByProjectIdQuery,
  usePostStorageAllowMutation,
  useDeleteStorageAllowByProjectIdMutation,
  usePatchStorageAllowByProjectIdMutation,

  // "project storage v2" hooks
  useGetProjectStorageV2Query,
  usePostProjectStorageV2Mutation,
} = projectCloudStorageApi;

export type * from "./projectCloudStorage.generated-api";
