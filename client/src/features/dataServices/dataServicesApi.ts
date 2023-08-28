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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import {
  AddCloudStorageForProjectParams,
  CloudStorage,
  GetCloudStorageForProjectParams,
  ResourcePool,
  ResourcePoolsQueryParams,
  UpdateCloudStorageForProjectParams,
} from "./dataServices.types";

export const dataServicesApi = createApi({
  reducerPath: "dataServices",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["CloudStorage", "ResourcePool"],
  endpoints: (builder) => ({
    getResourcePools: builder.query<ResourcePool[], ResourcePoolsQueryParams>({
      query: ({ cpuRequest, gpuRequest, memoryRequest, storageRequest }) => {
        const params = {
          ...(cpuRequest ? { cpu: cpuRequest } : {}),
          ...(gpuRequest ? { gpu: gpuRequest } : {}),
          ...(memoryRequest ? { memory: memoryRequest } : {}),
          ...(storageRequest ? { max_storage: storageRequest } : {}),
        };
        return {
          url: "resource_pools",
          params,
        };
      },
      providesTags: ["ResourcePool"],
    }),
    getCloudStorageForProject: builder.query<
      { storage: CloudStorage }[],
      GetCloudStorageForProjectParams
    >({
      query: ({ project_id }) => {
        return {
          url: "storage",
          params: { project_id },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ storage }) =>
                  ({ id: storage.storage_id, type: "CloudStorage" } as const)
              ),
              { id: "LIST", type: "CloudStorage" },
            ]
          : [{ id: "LIST", type: "CloudStorage" }],
    }),
    addCloudStorageForProject: builder.mutation<
      CloudStorage,
      AddCloudStorageForProjectParams
    >({
      query: (params) => {
        return {
          method: "POST",
          url: "storage",
          body: { ...params },
        };
      },
      invalidatesTags: [{ id: "LIST", type: "CloudStorage" }],
    }),
    updateCloudStorageForProjectParams: builder.mutation<
      CloudStorage,
      UpdateCloudStorageForProjectParams
    >({
      query: ({ configuration, storage_id, source_path, target_path }) => {
        return {
          method: "PATCH",
          url: `storage/${storage_id}`,
          body: { configuration, source_path, target_path },
        };
      },
      invalidatesTags: (_result, _error, { storage_id }) => [
        { id: storage_id, type: "CloudStorage" },
      ],
    }),
  }),
});

export const {
  useGetResourcePoolsQuery,
  useGetCloudStorageForProjectQuery,
  useAddCloudStorageForProjectMutation,
  useUpdateCloudStorageForProjectParamsMutation,
} = dataServicesApi;
