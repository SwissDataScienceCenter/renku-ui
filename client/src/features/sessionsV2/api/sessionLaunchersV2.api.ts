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
  GetProjectsByProjectIdSessionLaunchersApiResponse,
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
const withTagHandling = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["Environment", "Launcher", "Build", "BuildLogs"],
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
    postEnvironments: {
      invalidatesTags: ["Environment"],
    },
    patchEnvironmentsByEnvironmentId: {
      invalidatesTags: (result) =>
        result ? [{ id: result.id, type: "Environment" }] : ["Environment"],
    },
    deleteEnvironmentsByEnvironmentId: {
      invalidatesTags: ["Environment"],
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

      transformResponse: (
        response: GetProjectsByProjectIdSessionLaunchersApiResponse
      ) => {
        return [
          ...response,
          {
            id: "01JW94Q7BVDSBC8NZQSB8YVZJF",
            project_id: "01K3KCSAVGE4X970SXQDCSEYPC",
            name: "Custom launcher",
            creation_date: "2025-05-27T15:10:34Z",
            environment: {
              id: "01JW94Q7ABBZN0HP2KNGP1W89H",
              name: "Python environment",
              creation_date: "2025-05-27T15:10:34Z",
              description: "Generated environment for Python environment",
              default_url: "/lab",
              uid: 1000,
              gid: 1000,
              working_directory: "/home/renku/work",
              mount_directory: "/home/renku/work",
              port: 8888,
              is_archived: false,
              strip_path_prefix: false,
              container_image: "image:unknown-at-the-moment",
              build_parameters: {
                repository:
                  "https://gitlab.dev.renku.ch/flora.thiebaut/python-simple",
                builder_variant: "python",
                frontend_variant: "jupyterLab",
              },
              environment_image_source: "build" as const,
              environment_kind: "CUSTOM" as const,
            },
            resource_class_id: 4,
          },
        ];
      },
    },
    getBuildsByBuildId: {
      providesTags: (result) =>
        result ? [{ id: result.id, type: "Build" }, "Build"] : ["Build"],
    },
    postEnvironmentsByEnvironmentIdBuilds: {
      invalidatesTags: ["Build"],
    },
    patchBuildsByBuildId: {
      invalidatesTags: (result) =>
        result ? [{ id: result.id, type: "Build" }] : ["Build"],
    },
    getEnvironmentsByEnvironmentIdBuilds: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ id, type: "Build" as const })),
              "Build",
            ]
          : ["Build"],
    },
    getBuildsByBuildIdLogs: {
      providesTags: (result, _error, args) =>
        result
          ? [{ id: args.buildId, type: "BuildLogs" }, "BuildLogs"]
          : ["BuildLogs"],
    },
  },
});

// Adds tag invalidation endpoints
export const sessionLaunchersV2Api = withTagHandling.injectEndpoints({
  endpoints: (build) => ({
    invalidateLaunchers: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["Launcher"],
    }),
  }),
});

export const {
  // "environments" hooks
  useGetEnvironmentsQuery,
  usePostEnvironmentsMutation,
  usePatchEnvironmentsByEnvironmentIdMutation,
  useDeleteEnvironmentsByEnvironmentIdMutation,
  // "launchers" hooks
  useGetSessionLaunchersByLauncherIdQuery,
  usePostSessionLaunchersMutation,
  usePatchSessionLaunchersByLauncherIdMutation,
  useDeleteSessionLaunchersByLauncherIdMutation,
  useGetProjectsByProjectIdSessionLaunchersQuery,
  // "builds" hooks
  useGetBuildsByBuildIdQuery,
  usePostEnvironmentsByEnvironmentIdBuildsMutation,
  usePatchBuildsByBuildIdMutation,
  useGetEnvironmentsByEnvironmentIdBuildsQuery,
  useGetBuildsByBuildIdLogsQuery,
} = sessionLaunchersV2Api;

export type * from "./sessionLaunchersV2.generated-api";

// Type aliases derived from the generated API types
export type SessionLauncherEnvironmentParams =
  | EnvironmentPostInLauncher
  | EnvironmentIdOnlyPost;

export type SessionLauncherEnvironmentPatchParams =
  | EnvironmentPatchInLauncher
  | EnvironmentIdOnlyPatch;
