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
  type GetResourceFlavoursApiArg,
  type GetResourceFlavoursApiResponse,
  type GetResourcePoolsApiArg,
  type GetResourcePoolsApiResponse,
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
    getResourceFlavours: build.query<
      GetResourceFlavoursApiResponse,
      GetResourceFlavoursApiArg
    >({
      query: ({ resourceFlavourParams }) => ({
        url: "/resource_flavours",
        params: resourceFlavourParams,
      }),
    }),
  }),
});

// Adds tag handling for cache management
export const computeResourcesApi = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: [
    "ResourceClass",
    "ResourceFlavour",
    "ResourcePool",
    "ResourcePoolMember",
  ],
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
    getResourcePoolsByResourcePoolId: {
      providesTags: (result) =>
        result
          ? [{ id: result.id, type: "ResourcePool" }, "ResourcePool"]
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
        "ResourceFlavour",
      ],
    },
    patchResourcePoolsByResourcePoolIdClassesAndClassId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
        "ResourceClass",
        "ResourceFlavour",
      ],
    },
    deleteResourcePoolsByResourcePoolIdClassesAndClassId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
        "ResourceClass",
        "ResourceFlavour",
      ],
    },
    getResourceFlavours: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "ResourceFlavour" as const,
              })),
              "ResourceFlavour",
            ]
          : ["ResourceFlavour"],
    },
    getResourceFlavoursByResourceFlavourId: {
      providesTags: (result) =>
        result
          ? [{ id: result.id, type: "ResourceFlavour" as const }]
          : ["ResourceFlavour"],
    },
    getResourceFlavoursByResourceFlavourIdResourceClasses: {
      providesTags: (_result, _error, { resourceFlavourId }) => [
        { id: resourceFlavourId, type: "ResourceFlavour" as const },
        "ResourceClass",
      ],
    },
    postResourceFlavours: {
      invalidatesTags: ["ResourceFlavour"],
    },
    patchResourceFlavoursByResourceFlavourId: {
      invalidatesTags: ["ResourceFlavour", "ResourceClass", "ResourcePool"],
    },
    deleteResourceFlavoursByResourceFlavourId: {
      invalidatesTags: ["ResourceFlavour", "ResourceClass", "ResourcePool"],
    },
    deleteResourcePoolsByResourcePoolIdClassesAndClassIdResourceFlavour: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" as const },
        "ResourceClass",
        "ResourceFlavour",
      ],
    },
    getResourcePoolsByResourcePoolIdMembers: {
      providesTags: (result, _error, { resourcePoolId }) =>
        result
          ? [
              ...result.map((member) => ({
                id: `${member.member_type}-${member.id}`,
                type: "ResourcePoolMember" as const,
              })),
              { id: `LIST-${resourcePoolId}`, type: "ResourcePoolMember" },
            ]
          : [{ id: `LIST-${resourcePoolId}`, type: "ResourcePoolMember" }],
    },
    postResourcePoolsByResourcePoolIdMembers: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolMember" },
      ],
    },
    deleteResourcePoolsByResourcePoolIdMembersAndMemberTypeMemberId: {
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolMember" },
      ],
    },
  },
});

export const {
  // "resource pools" hooks
  useGetResourcePoolsQuery,
  useGetResourcePoolsByResourcePoolIdQuery,
  usePostResourcePoolsMutation,
  usePatchResourcePoolsByResourcePoolIdMutation,
  useDeleteResourcePoolsByResourcePoolIdMutation,

  // "resource classes" hooks
  useGetClassesByClassIdQuery,
  usePostResourcePoolsByResourcePoolIdClassesMutation,
  usePatchResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdMutation,

  // "resource flavours" hooks
  useGetResourceFlavoursQuery,
  useGetResourceFlavoursByResourceFlavourIdQuery,
  useGetResourceFlavoursByResourceFlavourIdResourceClassesQuery,
  usePostResourceFlavoursMutation,
  usePatchResourceFlavoursByResourceFlavourIdMutation,
  useDeleteResourceFlavoursByResourceFlavourIdMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdResourceFlavourMutation,

  // "members" hooks
  useGetResourcePoolsByResourcePoolIdMembersQuery,
  usePostResourcePoolsByResourcePoolIdMembersMutation,
  useDeleteResourcePoolsByResourcePoolIdMembersAndMemberTypeMemberIdMutation,
} = computeResourcesApi;

export type * from "./computeResources.generated-api";
