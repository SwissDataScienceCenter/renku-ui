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
  GetProjectSessionLaunchersParams,
  SessionEnvironmentList,
  SessionLauncher,
  SessionLauncherList,
  UpdateSessionLauncherParams,
} from "./sessionsV2.types";

const sessionsV2Api = createApi({
  reducerPath: "sessionsV2Api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "/ui-server/api/data/sessions",
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["Environment", "Launcher"],
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
  }),
});

export default sessionsV2Api;
export const {
  useGetSessionEnvironmentsQuery,
  useGetSessionLaunchersQuery,
  useGetProjectSessionLaunchersQuery,
  useAddSessionLauncherMutation,
  useUpdateSessionLauncherMutation,
  useDeleteSessionLauncherMutation,
} = sessionsV2Api;
