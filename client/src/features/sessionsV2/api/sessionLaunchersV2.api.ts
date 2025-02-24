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
  type EnvironmentIdOnlyPatch,
  type EnvironmentIdOnlyPost,
  type EnvironmentPatchInLauncher,
  type EnvironmentPostInLauncher,
  type GetEnvironmentsApiArg,
  type GetEnvironmentsApiResponse,
  sessionLaunchersV2GeneratedApi,
} from "./sessionLaunchersV2.generated-api";

// Fixes some API endpoints
const withFixedEndpoints = sessionLaunchersV2GeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getEnvironments: build.query<
      GetEnvironmentsApiResponse,
      GetEnvironmentsApiArg
    >({
      query: ({ getEnvironmentParams }) => ({
        url: `/environments`,
        params: getEnvironmentParams,
      }),
    }),
  }),
});

// Adds tag handling for cache management
export const sessionLaunchersV2Api = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["Environment", "Launcher"],
  endpoints: {
    getEnvironments: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "Environment" as const,
              })),
              "Environment",
            ]
          : ["Environment"],
    },
    getSessionLaunchersByLauncherId: {
      providesTags: (result) =>
        result
          ? [{ id: result.id, type: "Launcher" }, "Launcher"]
          : ["Launcher"],
    },
    postSessionLaunchers: {
      invalidatesTags: ["Launcher"],
    },
    patchSessionLaunchersByLauncherId: {
      invalidatesTags: (result) =>
        result ? [{ id: result.id, type: "Launcher" }] : ["Launcher"],
    },
    deleteSessionLaunchersByLauncherId: {
      invalidatesTags: ["Launcher"],
    },
    getProjectsByProjectIdSessionLaunchers: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ id, type: "Launcher" as const })),
              "Launcher",
            ]
          : ["Launcher"],
    },
  },
});

export const {
  // "environments" hooks
  useGetEnvironmentsQuery,
  // "launchers" hooks
  useGetSessionLaunchersByLauncherIdQuery,
  usePostSessionLaunchersMutation,
  usePatchSessionLaunchersByLauncherIdMutation,
  useDeleteSessionLaunchersByLauncherIdMutation,
  useGetProjectsByProjectIdSessionLaunchersQuery,
} = sessionLaunchersV2Api;

export type * from "./sessionLaunchersV2.generated-api";

// Type aliases derived from the generated API types
export type SessionLauncherEnvironmentParams =
  | EnvironmentPostInLauncher
  | EnvironmentIdOnlyPost;

export type SessionLauncherEnvironmentPatchParams =
  | EnvironmentPatchInLauncher
  | EnvironmentIdOnlyPatch;
