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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  AddSessionLauncherParams,
  DeleteSessionLauncherParams,
  DockerImage,
  GetLogsParams,
  GetProjectSessionLaunchersParams,
  LaunchSessionParams,
  PatchSessionParams,
  SessionEnvironmentList,
  SessionImageParams,
  SessionLauncher,
  SessionLauncherList,
  SessionList,
  SessionV2,
  StopSessionParams,
  UpdateSessionLauncherParams,
} from "./sessionsV2.types";

const sessionsV2Api = createApi({
  reducerPath: "sessionsV2Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["Environment", "Launcher", "SessionsV2"],
  endpoints: (builder) => ({
    getSessionEnvironments: builder.query<SessionEnvironmentList, void>({
      query: () => {
        return {
          url: "environments",
        };
      },
    }),
    getSessionLaunchers: builder.query<SessionLauncherList, void>({
      query: () => {
        return {
          url: "session_launchers",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Launcher" as const, id })),
              "Launcher",
            ]
          : ["Launcher"],
    }),
    getProjectSessionLaunchers: builder.query<
      SessionLauncherList,
      GetProjectSessionLaunchersParams
    >({
      query: ({ projectId }) => {
        return {
          url: `/projects/${projectId}/session_launchers`,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Launcher" as const, id })),
              "Launcher",
            ]
          : ["Launcher"],
    }),
    addSessionLauncher: builder.mutation<
      SessionLauncher,
      AddSessionLauncherParams
    >({
      query: ({ ...params }) => {
        return {
          url: "session_launchers",
          method: "POST",
          body: params,
        };
      },
      invalidatesTags: ["Launcher"],
    }),
    updateSessionLauncher: builder.mutation<
      SessionLauncher,
      UpdateSessionLauncherParams
    >({
      query: ({ launcherId, ...params }) => {
        return {
          url: `session_launchers/${launcherId}`,
          method: "PATCH",
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { launcherId }) => [
        { id: launcherId, type: "Launcher" },
      ],
    }),
    deleteSessionLauncher: builder.mutation<null, DeleteSessionLauncherParams>({
      query: ({ launcherId }) => {
        return {
          url: `session_launchers/${launcherId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Launcher"],
    }),
    getSessions: builder.query<SessionList, void>({
      query: () => ({ url: "sessions" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ name }) => ({
                type: "SessionsV2" as const,
                name,
              })),
              "SessionsV2",
            ]
          : ["SessionsV2"],
    }),
    launchSession: builder.mutation<SessionV2, LaunchSessionParams>({
      query: ({
        launcher_id,
        disk_storage,
        resource_class_id,
        cloudstorage,
      }) => {
        const body = {
          launcher_id,
          disk_storage,
          resource_class_id,
          cloudstorage,
        };
        return {
          body,
          method: "POST",
          url: "/sessions",
        };
      },
    }),
    patchSession: builder.mutation<null, PatchSessionParams>({
      query: ({ session_id, state, resource_class_id }) => ({
        method: "PATCH",
        url: `sessions/${session_id}`,
        body: {
          ...(state ? { state } : {}),
          ...(resource_class_id ? { resource_class_id } : {}),
        },
      }),
      transformResponse: () => null,
      invalidatesTags: (_result, _error, { session_id }) => [
        { id: session_id, type: "SessionsV2" },
      ],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLogs: builder.query<any, GetLogsParams>({
      query: ({ session_id, max_lines }) => {
        return {
          url: `sessions/${session_id}/logs`,
          params: { max_lines },
        };
      },
      transformResponse: (result: unknown) => {
        return result && typeof result == "string"
          ? JSON.parse(result)
          : result;
      },
      keepUnusedDataFor: 0,
    }),
    stopSession: builder.mutation<boolean, StopSessionParams>({
      query: ({ session_id }) => ({
        method: "DELETE",
        url: `sessions/${session_id}`,
      }),
      invalidatesTags: ["SessionsV2"],
    }),
    invalidateSessions: builder.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["SessionsV2"],
    }),
    getDockerImage: builder.query<DockerImage, SessionImageParams>({
      query: ({ image_url }) => ({
        method: "GET",
        url: "sessions/images",
        params: { image_url },
      }),
    }),
  }),
});

export default sessionsV2Api;
export const {
  useGetSessionsQuery,
  useGetSessionEnvironmentsQuery,
  useGetSessionLaunchersQuery,
  useGetProjectSessionLaunchersQuery,
  useAddSessionLauncherMutation,
  useUpdateSessionLauncherMutation,
  useDeleteSessionLauncherMutation,
  useLaunchSessionMutation,
  usePatchSessionMutation,
  useStopSessionMutation,
  useGetLogsQuery,
  useGetDockerImageQuery,
} = sessionsV2Api;
