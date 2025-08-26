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
  computeResourcesGeneratedApi,
  type GetResourcePoolsApiResponse,
  type GetResourcePoolsApiArg,
} from "./computeResources.generated-api";

// Fixes some API endpoints
const withFixedEndpoints = computeResourcesGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getResourcePools: build.query<
      GetResourcePoolsApiResponse,
      GetResourcePoolsApiArg
    >({
      query: ({ resourcePoolsParams }) => ({
        url: "/resource_pools",
        params: resourcePoolsParams,
      }),
    }),
  }),
});

// Adds tag handling for cache management
export const computeResourcesApi = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["ResourceClass", "ResourcePool", "ResourcePoolUser"],
  endpoints: {
    getResourcePools: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "ResourcePool" as const,
              })),
            ]
          : ["ResourcePool"],
    },
    postResourcePools: {
      invalidatesTags: ["ResourcePool", "ResourceClass"],
    },
    patchResourcePoolsByResourcePoolId: {
      invalidatesTags: (result, _error, { resourcePoolId }) =>
        result
          ? [{ id: resourcePoolId, type: "ResourcePool" }, "ResourceClass"]
          : ["ResourcePool", "ResourceClass"],
    },
    deleteResourcePoolsByResourcePoolId: {
      invalidatesTags: ["ResourcePool", "ResourceClass"],
    },
    getClassesByClassId: {
      providesTags: ["ResourceClass"],
    },
    postResourcePoolsByResourcePoolIdClasses: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
        "ResourceClass",
      ],
    },
    patchResourcePoolsByResourcePoolIdClassesAndClassId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
        "ResourceClass",
      ],
    },
    deleteResourcePoolsByResourcePoolIdClassesAndClassId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
        "ResourceClass",
      ],
    },
    getResourcePoolsByResourcePoolIdUsers: {
      providesTags: (result, _error, { resourcePoolId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "ResourcePoolUser" as const,
              })),
              { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
            ]
          : [{ id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" }],
    },
    postResourcePoolsByResourcePoolIdUsers: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
      ],
    },
    deleteResourcePoolsByResourcePoolIdUsersAndUserId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
      ],
    },
  },
});

export const {
  // "resource pools" hooks
  useGetResourcePoolsQuery,
  usePostResourcePoolsMutation,
  usePatchResourcePoolsByResourcePoolIdMutation,
  useDeleteResourcePoolsByResourcePoolIdMutation,

  // "resource classes" hooks
  useGetClassesByClassIdQuery,
  usePostResourcePoolsByResourcePoolIdClassesMutation,
  usePatchResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdMutation,

  // "users" hooks
  useGetResourcePoolsByResourcePoolIdUsersQuery,
  usePostResourcePoolsByResourcePoolIdUsersMutation,
  useDeleteResourcePoolsByResourcePoolIdUsersAndUserIdMutation,
} = computeResourcesApi;

export type * from "./computeResources.generated-api";
