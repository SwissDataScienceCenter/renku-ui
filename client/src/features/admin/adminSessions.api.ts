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
  SessionEnvironment,
  SessionEnvironmentList,
} from "../sessionsV2/sessionsV2.types";
import {
  AddSessionEnvironmentParams,
  DeleteSessionEnvironmentParams,
  UpdateSessionEnvironmentParams,
} from "./adminSessions.types";

const adminSessionsApi = createApi({
  reducerPath: "adminSessionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["Environment"],
  endpoints: (builder) => ({
    getSessionEnvironments: builder.query<SessionEnvironmentList, void>({
      query: () => {
        return {
          url: "environments",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Environment" as const, id })),
              "Environment",
            ]
          : ["Environment"],
    }),
    addSessionEnvironment: builder.mutation<
      SessionEnvironment,
      AddSessionEnvironmentParams
    >({
      query: ({ ...params }) => {
        return {
          url: "environments",
          method: "POST",
          body: params,
        };
      },
      invalidatesTags: ["Environment"],
    }),
    updateSessionEnvironment: builder.mutation<
      SessionEnvironment,
      UpdateSessionEnvironmentParams
    >({
      query: ({ environmentId, ...params }) => {
        return {
          url: `environments/${environmentId}`,
          method: "PATCH",
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { environmentId }) => [
        { id: environmentId, type: "Environment" },
      ],
    }),
    deleteSessionEnvironment: builder.mutation<
      null,
      DeleteSessionEnvironmentParams
    >({
      query: ({ environmentId }) => {
        return {
          url: `environments/${environmentId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Environment"],
    }),
  }),
});

export default adminSessionsApi;
export const {
  useGetSessionEnvironmentsQuery,
  useAddSessionEnvironmentMutation,
  useUpdateSessionEnvironmentMutation,
  useDeleteSessionEnvironmentMutation,
} = adminSessionsApi;
