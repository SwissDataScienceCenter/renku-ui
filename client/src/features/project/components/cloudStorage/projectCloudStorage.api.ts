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
import { sortBy } from "lodash-es";
import {
  AddCloudStorageForProjectParams,
  CloudStorage,
  CloudStorageSchema,
  DeleteCloudStorageParams,
  GetCloudStorageForProjectParams,
  UpdateCloudStorageParams,
  ValidateCloudStorageConfigurationParams,
} from "./projectCloudStorage.types";

const projectCloudStorageApi = createApi({
  reducerPath: "projectCloudStorage",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["CloudStorage"],
  endpoints: (builder) => ({
    getCloudStorageForProject: builder.query<
      CloudStorage[],
      GetCloudStorageForProjectParams
    >({
      query: ({ project_id }) => {
        return {
          url: "storage",
          params: { project_id },
        };
      },
      transformResponse: (list: CloudStorage[]) =>
        sortBy(list, [({ storage }) => storage.name]),
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
    updateCloudStorage: builder.mutation<
      CloudStorage,
      UpdateCloudStorageParams
    >({
      query: ({ storage_id, ...params }) => {
        return {
          method: "PUT",
          url: `storage/${storage_id}`,
          body: { ...params },
        };
      },
      invalidatesTags: (_result, _error, { storage_id }) => [
        { id: storage_id, type: "CloudStorage" },
      ],
    }),
    deleteCloudStorage: builder.mutation<void, DeleteCloudStorageParams>({
      query: ({ project_id, storage_id }) => {
        return {
          method: "DELETE",
          url: `storage/${storage_id}`,
          body: { project_id },
        };
      },
      invalidatesTags: [{ id: "LIST", type: "CloudStorage" }],
    }),
    validateCloudStorageConfiguration: builder.mutation<
      unknown,
      ValidateCloudStorageConfigurationParams
    >({
      query: ({ configuration }) => {
        return {
          method: "POST",
          url: "storage_schema/validate",
          body: { ...configuration },
        };
      },
    }),
    getCloudStorageSchema: builder.query<CloudStorageSchema[], void>({
      query: () => {
        return {
          method: "GET",
          url: "storage_schema",
        };
      },
    }),
  }),
});
export default projectCloudStorageApi;

export const {
  useGetCloudStorageForProjectQuery,
  useAddCloudStorageForProjectMutation,
  useUpdateCloudStorageMutation,
  useDeleteCloudStorageMutation,
  useValidateCloudStorageConfigurationMutation,
  useGetCloudStorageSchemaQuery,
} = projectCloudStorageApi;
