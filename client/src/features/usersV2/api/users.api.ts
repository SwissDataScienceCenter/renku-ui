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
import {
  type GetUserPreferencesApiArg,
  type GetUserPreferencesApiResponse,
  usersGeneratedApi,
} from "./users.generated-api";

// Fixes the GET /user/preferences endpoint
const withFixedEndpoints = usersGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
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
  }),
});

export const usersApi = withFixedEndpoints.enhanceEndpoints({
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
