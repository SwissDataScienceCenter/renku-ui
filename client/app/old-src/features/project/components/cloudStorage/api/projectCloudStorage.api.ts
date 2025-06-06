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
  type GetStorageApiArg,
  type GetStorageApiResponse,
} from "./projectCloudStorage.generated-api";

// Fixes some API endpoints
const withFixedEndpoints = projectCloudStorageGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getStorage: build.query<GetStorageApiResponse, GetStorageApiArg>({
      query: ({ storageParams }) => ({
        url: "/storage",
        params: storageParams,
      }),
    }),
  }),
});

// Adds tag handling for cache management
const projectCloudStorageApi = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["CloudStorage", "CloudStorageSchema"],
  endpoints: {
    getStorageByStorageId: {
      providesTags: (result) =>
        result
          ? [
              { id: result.storage.storage_id, type: "CloudStorage" },
              "CloudStorage",
            ]
          : ["CloudStorage"],
    },
    putStorageByStorageId: {
      invalidatesTags: (result) =>
        result
          ? [{ id: result.storage.storage_id, type: "CloudStorage" }]
          : ["CloudStorage"],
    },
    patchStorageByStorageId: {
      invalidatesTags: (result) =>
        result
          ? [{ id: result.storage.storage_id, type: "CloudStorage" }]
          : ["CloudStorage"],
    },
    deleteStorageByStorageId: {
      invalidatesTags: ["CloudStorage"],
    },
    getStorage: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ storage }) => ({
                id: storage.storage_id,
                type: "CloudStorage" as const,
              })),
              "CloudStorage",
            ]
          : ["CloudStorage"],
    },
    postStorage: {
      invalidatesTags: ["CloudStorage"],
    },
    getStorageSchema: {
      providesTags: ["CloudStorageSchema"],
    },
  },
});

export const {
  useDeleteStorageByStorageIdMutation,
  useGetStorageQuery,
  useGetStorageSchemaQuery,
  usePatchStorageByStorageIdMutation,
  usePostStorageMutation,
  usePostStorageSchemaTestConnectionMutation,
} = projectCloudStorageApi;

export type * from "./projectCloudStorage.generated-api";
