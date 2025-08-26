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

import { computeResourcesGeneratedApi } from "./computeResources.generated-api";

// Adds tag handling for cache management
export const computeResourcesApi =
  computeResourcesGeneratedApi.enhanceEndpoints({
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
  // useGetResourcePoolsByResourcePoolIdClassesQuery,
  usePostResourcePoolsByResourcePoolIdClassesMutation,
  usePatchResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdMutation,

  // "users" hooks
  useGetResourcePoolsByResourcePoolIdUsersQuery,
  usePostResourcePoolsByResourcePoolIdUsersMutation,
  useDeleteResourcePoolsByResourcePoolIdUsersAndUserIdMutation,

  //   useGetResourcePoolsByResourcePoolIdClassesAndClassIdQuery,

  //     getClusters: build.query<GetClustersApiResponse, GetClustersApiArg>({
  //       query: () => ({ url: `/clusters` }),
  //     }),
  //     postClusters: build.mutation<PostClustersApiResponse, PostClustersApiArg>({
  //       query: (queryArg) => ({
  //         url: `/clusters`,
  //         method: "POST",
  //         body: queryArg.cluster,
  //       }),
  //     }),
  //     getClustersByClusterId: build.query<
  //       GetClustersByClusterIdApiResponse,
  //       GetClustersByClusterIdApiArg
  //     >({
  //       query: (queryArg) => ({ url: `/clusters/${queryArg.clusterId}` }),
  //     }),
  //     putClustersByClusterId: build.mutation<
  //       PutClustersByClusterIdApiResponse,
  //       PutClustersByClusterIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/clusters/${queryArg.clusterId}`,
  //         method: "PUT",
  //         body: queryArg.cluster,
  //       }),
  //     }),
  //     patchClustersByClusterId: build.mutation<
  //       PatchClustersByClusterIdApiResponse,
  //       PatchClustersByClusterIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/clusters/${queryArg.clusterId}`,
  //         method: "PATCH",
  //         body: queryArg.clusterPatch,
  //       }),
  //     }),
  //     deleteClustersByClusterId: build.mutation<
  //       DeleteClustersByClusterIdApiResponse,
  //       DeleteClustersByClusterIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/clusters/${queryArg.clusterId}`,
  //         method: "DELETE",
  //       }),
  //     }),
  //     getError: build.query<GetErrorApiResponse, GetErrorApiArg>({
  //       query: () => ({ url: `/error` }),
  //     }),
  //     getResourcePools: build.query<
  //       GetResourcePoolsApiResponse,
  //       GetResourcePoolsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools`,
  //         params: { resource_pools_params: queryArg.resourcePoolsParams },
  //       }),
  //     }),
  //     postResourcePools: build.mutation<
  //       PostResourcePoolsApiResponse,
  //       PostResourcePoolsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools`,
  //         method: "POST",
  //         body: queryArg.resourcePool,
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolId: build.query<
  //       GetResourcePoolsByResourcePoolIdApiResponse,
  //       GetResourcePoolsByResourcePoolIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}`,
  //       }),
  //     }),
  //     putResourcePoolsByResourcePoolId: build.mutation<
  //       PutResourcePoolsByResourcePoolIdApiResponse,
  //       PutResourcePoolsByResourcePoolIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}`,
  //         method: "PUT",
  //         body: queryArg.resourcePoolPut,
  //       }),
  //     }),
  //     patchResourcePoolsByResourcePoolId: build.mutation<
  //       PatchResourcePoolsByResourcePoolIdApiResponse,
  //       PatchResourcePoolsByResourcePoolIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}`,
  //         method: "PATCH",
  //         body: queryArg.resourcePoolPatch,
  //       }),
  //     }),
  //     deleteResourcePoolsByResourcePoolId: build.mutation<
  //       DeleteResourcePoolsByResourcePoolIdApiResponse,
  //       DeleteResourcePoolsByResourcePoolIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}`,
  //         method: "DELETE",
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolIdClasses: build.query<
  //       GetResourcePoolsByResourcePoolIdClassesApiResponse,
  //       GetResourcePoolsByResourcePoolIdClassesApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes`,
  //         params: { resource_class_params: queryArg.resourceClassParams },
  //       }),
  //     }),
  //     postResourcePoolsByResourcePoolIdClasses: build.mutation<
  //       PostResourcePoolsByResourcePoolIdClassesApiResponse,
  //       PostResourcePoolsByResourcePoolIdClassesApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes`,
  //         method: "POST",
  //         body: queryArg.resourceClass,
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolIdClassesAndClassId: build.query<
  //       GetResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
  //       GetResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
  //       }),
  //     }),
  //     putResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
  //       PutResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
  //       PutResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
  //         method: "PUT",
  //         body: queryArg.resourceClass,
  //       }),
  //     }),
  //     patchResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
  //       PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
  //       PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
  //         method: "PATCH",
  //         body: queryArg.resourceClassPatch,
  //       }),
  //     }),
  //     deleteResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
  //       DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
  //       DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
  //         method: "DELETE",
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolIdClassesAndClassIdTolerations: build.query<
  //       GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse,
  //       GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/tolerations`,
  //       }),
  //     }),
  //     deleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerations:
  //       build.mutation<
  //         DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse,
  //         DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg
  //       >({
  //         query: (queryArg) => ({
  //           url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/tolerations`,
  //           method: "DELETE",
  //         }),
  //       }),
  //     getResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinities:
  //       build.query<
  //         GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse,
  //         GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg
  //       >({
  //         query: (queryArg) => ({
  //           url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/node_affinities`,
  //         }),
  //       }),
  //     deleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinities:
  //       build.mutation<
  //         DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse,
  //         DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg
  //       >({
  //         query: (queryArg) => ({
  //           url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/node_affinities`,
  //           method: "DELETE",
  //         }),
  //       }),
  //     getResourcePoolsByResourcePoolIdUsers: build.query<
  //       GetResourcePoolsByResourcePoolIdUsersApiResponse,
  //       GetResourcePoolsByResourcePoolIdUsersApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/users`,
  //       }),
  //     }),
  //     postResourcePoolsByResourcePoolIdUsers: build.mutation<
  //       PostResourcePoolsByResourcePoolIdUsersApiResponse,
  //       PostResourcePoolsByResourcePoolIdUsersApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/users`,
  //         method: "POST",
  //         body: queryArg.poolUsersWithId,
  //       }),
  //     }),
  //     putResourcePoolsByResourcePoolIdUsers: build.mutation<
  //       PutResourcePoolsByResourcePoolIdUsersApiResponse,
  //       PutResourcePoolsByResourcePoolIdUsersApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/users`,
  //         method: "PUT",
  //         body: queryArg.poolUsersWithId,
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolIdUsersAndUserId: build.query<
  //       GetResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse,
  //       GetResourcePoolsByResourcePoolIdUsersAndUserIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/users/${queryArg.userId}`,
  //       }),
  //     }),
  //     deleteResourcePoolsByResourcePoolIdUsersAndUserId: build.mutation<
  //       DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse,
  //       DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/users/${queryArg.userId}`,
  //         method: "DELETE",
  //       }),
  //     }),
  //     getResourcePoolsByResourcePoolIdQuota: build.query<
  //       GetResourcePoolsByResourcePoolIdQuotaApiResponse,
  //       GetResourcePoolsByResourcePoolIdQuotaApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
  //       }),
  //     }),
  //     putResourcePoolsByResourcePoolIdQuota: build.mutation<
  //       PutResourcePoolsByResourcePoolIdQuotaApiResponse,
  //       PutResourcePoolsByResourcePoolIdQuotaApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
  //         method: "PUT",
  //         body: queryArg.quotaWithId,
  //       }),
  //     }),
  //     patchResourcePoolsByResourcePoolIdQuota: build.mutation<
  //       PatchResourcePoolsByResourcePoolIdQuotaApiResponse,
  //       PatchResourcePoolsByResourcePoolIdQuotaApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
  //         method: "PATCH",
  //         body: queryArg.quotaPatch,
  //       }),
  //     }),
  //     getUsersByUserIdResourcePools: build.query<
  //       GetUsersByUserIdResourcePoolsApiResponse,
  //       GetUsersByUserIdResourcePoolsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/users/${queryArg.userId}/resource_pools`,
  //         params: { user_resource_params: queryArg.userResourceParams },
  //       }),
  //     }),
  //     postUsersByUserIdResourcePools: build.mutation<
  //       PostUsersByUserIdResourcePoolsApiResponse,
  //       PostUsersByUserIdResourcePoolsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/users/${queryArg.userId}/resource_pools`,
  //         method: "POST",
  //         body: queryArg.integerIds,
  //       }),
  //     }),
  //     putUsersByUserIdResourcePools: build.mutation<
  //       PutUsersByUserIdResourcePoolsApiResponse,
  //       PutUsersByUserIdResourcePoolsApiArg
  //     >({
  //       query: (queryArg) => ({
  //         url: `/users/${queryArg.userId}/resource_pools`,
  //         method: "PUT",
  //         body: queryArg.integerIds,
  //       }),
  //     }),
  //     getVersion: build.query<GetVersionApiResponse, GetVersionApiArg>({
  //       query: () => ({ url: `/version` }),
  //     }),
} = computeResourcesApi;

export type * from "./computeResources.generated-api";
