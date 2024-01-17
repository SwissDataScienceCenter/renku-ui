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
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";
import {
  AddResourceClassParams,
  AddResourcePoolParams,
  AddUsersToResourcePoolParams,
  DeleteResourceClassParams,
  DeleteResourcePoolParams,
  GetResourcePoolUsersParams,
  RemoveUserFromResourcePoolParams,
  ResourcePoolUser,
  UpdateResourceClassParams,
  UpdateResourcePoolParams,
} from "./adminComputeResources.types";

const adminComputeResourcesApi = createApi({
  reducerPath: "adminComputeResourcesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/data" }),
  tagTypes: ["ResourcePool", "ResourcePoolUser"],
  endpoints: (builder) => ({
    getResourcePools: builder.query<ResourcePool[], void>({
      query: () => {
        return {
          url: "resource_pools",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ id }) => ({ id, type: "ResourcePool" } as const)
              ),
              "ResourcePool",
            ]
          : ["ResourcePool"],
    }),
    getResourcePoolUsers: builder.query<
      ResourcePoolUser[],
      GetResourcePoolUsersParams
    >({
      query: ({ resourcePoolId }) => {
        return {
          url: `resource_pools/${resourcePoolId}/users`,
        };
      },
      providesTags: (result, _error, { resourcePoolId }) =>
        result
          ? [
              ...result.map(
                ({ id }) =>
                  ({
                    id,
                    type: "ResourcePoolUser",
                  } as const)
              ),
              { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
            ]
          : [{ id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" }],
    }),
    getUsers: builder.query<ResourcePoolUser[], void>({
      query: () => {
        return {
          url: "users",
        };
      },
    }),
    addResourcePool: builder.mutation<ResourcePool, AddResourcePoolParams>({
      query: ({ name, public: isPublic, classes, quota }) => {
        const body = {
          name,
          public: isPublic,
          default: false,
          classes,
          quota,
        };

        return {
          method: "POST",
          url: "resource_pools",
          body,
        };
      },
      invalidatesTags: ["ResourcePool"],
    }),
    updateResourcePool: builder.mutation<
      ResourcePool,
      UpdateResourcePoolParams
    >({
      query: ({ resourcePoolId, ...params }) => {
        return {
          method: "PATCH",
          url: `resource_pools/${resourcePoolId}`,
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
      ],
    }),
    deleteResourcePool: builder.mutation<
      ResourcePool,
      DeleteResourcePoolParams
    >({
      query: ({ resourcePoolId }) => {
        return {
          method: "DELETE",
          url: `resource_pools/${resourcePoolId}`,
        };
      },
      invalidatesTags: ["ResourcePool"],
    }),
    addResourceClass: builder.mutation<ResourceClass, AddResourceClassParams>({
      query: ({ resourcePoolId, ...params }) => {
        return {
          method: "POST",
          url: `resource_pools/${resourcePoolId}/classes`,
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
      ],
    }),
    updateResourceClass: builder.mutation<
      ResourceClass,
      UpdateResourceClassParams
    >({
      query: ({ resourceClassId, resourcePoolId, ...params }) => {
        return {
          method: "PATCH",
          url: `resource_pools/${resourcePoolId}/classes/${resourceClassId}`,
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
      ],
    }),
    deleteResourceClass: builder.mutation<void, DeleteResourceClassParams>({
      query: ({ resourceClassId, resourcePoolId }) => {
        return {
          method: "DELETE",
          url: `resource_pools/${resourcePoolId}/classes/${resourceClassId}`,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: resourcePoolId, type: "ResourcePool" },
      ],
    }),
    addUsersToResourcePool: builder.mutation<
      void,
      AddUsersToResourcePoolParams
    >({
      query: ({ resourcePoolId, userIds }) => {
        const body = userIds.map((id) => ({ id }));
        return {
          method: "POST",
          url: `resource_pools/${resourcePoolId}/users`,
          body,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
      ],
    }),
    removeUserFromResourcePool: builder.mutation<
      void,
      RemoveUserFromResourcePoolParams
    >({
      query: ({ resourcePoolId, userId }) => {
        return {
          method: "DELETE",
          url: `resource_pools/${resourcePoolId}/users/${userId}`,
        };
      },
      invalidatesTags: (_result, _error, { resourcePoolId }) => [
        { id: `LIST-${resourcePoolId}`, type: "ResourcePoolUser" },
      ],
    }),
  }),
});

export default adminComputeResourcesApi;

export const {
  useGetResourcePoolsQuery,
  useGetResourcePoolUsersQuery,
  useGetUsersQuery,
  useAddResourcePoolMutation,
  useUpdateResourcePoolMutation,
  useDeleteResourcePoolMutation,
  useAddResourceClassMutation,
  useUpdateResourceClassMutation,
  useDeleteResourceClassMutation,
  useAddUsersToResourcePoolMutation,
  useRemoveUserFromResourcePoolMutation,
} = adminComputeResourcesApi;
