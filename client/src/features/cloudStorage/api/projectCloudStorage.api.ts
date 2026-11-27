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

import { processPaginationHeaders } from "~/utils/helpers/kgPagination.utils";
import type { AbstractKgPaginatedResponse } from "~/utils/types/pagination.types";
import {
  projectCloudStorageGeneratedApi,
  type GetStorageAllowApiArg,
  type ProjectStorageAllowList,
} from "./projectCloudStorage.generated-api";

export interface GetStorageAllowPagedApiResponse extends AbstractKgPaginatedResponse {
  projects: ProjectStorageAllowList;
}

// Adds a paginated version of the storage allow list endpoint
const withPagedEndpoints = projectCloudStorageGeneratedApi.injectEndpoints({
  endpoints: (builder) => ({
    getStorageAllowPaged: builder.query<
      GetStorageAllowPagedApiResponse,
      GetStorageAllowApiArg
    >({
      query: ({ params }) => ({
        url: "/storage/allow",
        params,
      }),
      transformResponse: (response, meta, { params }) => {
        const projects = response as ProjectStorageAllowList;
        const headerResponse = processPaginationHeaders(
          meta?.response?.headers,
          { page: params?.page, perPage: params?.per_page },
          projects,
        );
        return { projects, ...headerResponse };
      },
    }),
  }),
});

// Adds tag handling for cache management
const projectCloudStorageApi = withPagedEndpoints.enhanceEndpoints({
  addTagTypes: ["CloudStorageSchema", "ProjectStorage", "ProjectStorageAllow"],
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
    getStorageAllowPaged: {
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
  useGetStorageAllowPagedQuery,
  useGetStorageAllowByProjectIdQuery,
  usePostStorageAllowMutation,
  useDeleteStorageAllowByProjectIdMutation,
  usePatchStorageAllowByProjectIdMutation,
} = projectCloudStorageApi;

export type * from "./projectCloudStorage.generated-api";
