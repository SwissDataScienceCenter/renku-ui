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

import type { DataServicesError } from "../../dataServices/dataServices.types";
import { projectV2Api } from "../../projectsV2/api/projectV2.enhanced-api";
import {
  type DeleteUserPreferencesPinnedProjectsApiArg,
  type DeleteUserPreferencesPinnedProjectsApiResponse,
  type GetUserApiArg,
  type GetUserApiResponse,
  type GetUserPreferencesApiArg,
  type GetUserPreferencesApiResponse,
  type GetUsersApiArg,
  type GetUsersApiResponse,
  type GetUserSecretsApiArg,
  type GetUserSecretsApiResponse,
  usersGeneratedApi,
} from "./users.generated-api";
import type { UserInfo } from "./users.types";

// Fixes some API endpoints
const withFixedEndpoints = usersGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getUser: build.query<UserInfo, GetUserApiArg>({
      query: () => ({
        url: "/user",
        validateStatus: (response) => {
          return response.status < 400 || response.status == 401;
        },
      }),
      transformResponse: (result: GetUserApiResponse | null | undefined) => {
        if (result == null || "error" in result) {
          return { isLoggedIn: false };
        }
        return { ...result, isLoggedIn: true };
      },
    }),
    getUsers: build.query<GetUsersApiResponse, GetUsersApiArg>({
      query: ({ userParams }) => ({
        url: `/users`,
        params: userParams,
      }),
    }),
    getUserSecrets: build.query<
      GetUserSecretsApiResponse,
      GetUserSecretsApiArg
    >({
      query: ({ userSecretsParams }) => ({
        url: `/user/secrets`,
        params: userSecretsParams,
      }),
    }),
    getUserPreferences: build.query<
      GetUserPreferencesApiResponse | null,
      GetUserPreferencesApiArg
    >({
      query: () => ({
        url: "/user/preferences",
        validateStatus: (response) => {
          return response.status < 400 || response.status == 404;
        },
      }),
      transformResponse: (
        result:
          | GetUserPreferencesApiResponse
          | DataServicesError
          | null
          | undefined
      ) => {
        if (result == null || "error" in result) {
          return null;
        }
        return result;
      },
    }),
    deleteUserPreferencesPinnedProjects: build.mutation<
      DeleteUserPreferencesPinnedProjectsApiResponse,
      DeleteUserPreferencesPinnedProjectsApiArg
    >({
      query: ({ deletePinnedParams }) => ({
        url: `/user/preferences/pinned_projects`,
        method: "DELETE",
        params: deletePinnedParams,
      }),
    }),
  }),
});

// Adds tag handling for cache management
const withTagHandling = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["SelfUser", "User", "UserSecret", "UserPreferences"],
  endpoints: {
    getUser: {
      providesTags: ["SelfUser"],
    },
    getUsers: {
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ id, type: "User" as const })), "User"]
          : ["User"],
    },
    getUsersByUserId: {
      providesTags: (result) =>
        result ? [{ id: result.id, type: "User" }, "User"] : ["User"],
    },
    deleteUsersByUserId: {
      invalidatesTags: ["User"],
    },
    getUserSecrets: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ id, type: "UserSecret" as const })),
              "UserSecret",
            ]
          : ["UserSecret"],
    },
    postUserSecrets: {
      invalidatesTags: ["UserSecret"],
    },
    getUserSecretsBySecretId: {
      providesTags: (result) =>
        result
          ? [{ id: result.id, type: "UserSecret" }, "UserSecret"]
          : ["UserSecret"],
    },
    patchUserSecretsBySecretId: {
      invalidatesTags: (result) =>
        result ? [{ id: result.id, type: "UserSecret" }] : ["UserSecret"],
    },
    deleteUserSecretsBySecretId: {
      invalidatesTags: ["UserSecret"],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.finally(() => {
          dispatch(projectV2Api.endpoints.invalidateSessionSecrets.initiate());
        });
      },
    },
    getUserPreferences: {
      providesTags: ["UserPreferences"],
    },
    postUserPreferencesPinnedProjects: {
      invalidatesTags: ["UserPreferences"],
    },
    deleteUserPreferencesPinnedProjects: {
      invalidatesTags: ["UserPreferences"],
    },
  },
});

// Adds tag invalidation endpoints
export const usersApi = withTagHandling.injectEndpoints({
  endpoints: (build) => ({
    invalidateUserSecrets: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["UserSecret"],
    }),
  }),
});

export const {
  // "users" hooks
  useGetUserQuery,
  useGetUsersQuery,
  useGetUsersByUserIdQuery: useGetUserByIdQuery,
  useDeleteUsersByUserIdMutation: useDeleteUserMutation,
  // "secrets" hooks
  useGetUserSecretsQuery,
  usePostUserSecretsMutation: usePostUserSecretMutation,
  useGetUserSecretsBySecretIdQuery: useGetUserSecretByIdQuery,
  usePatchUserSecretsBySecretIdMutation: usePatchUserSecretMutation,
  useDeleteUserSecretsBySecretIdMutation: useDeleteUserSecretMutation,
  // "user_preferences" hooks
  useGetUserPreferencesQuery,
  usePostUserPreferencesPinnedProjectsMutation: usePostPinnedProjectMutation,
  useDeleteUserPreferencesPinnedProjectsMutation:
    useDeletePinnedProjectsMutation,
} = usersApi;

export type * from "./users.generated-api";
