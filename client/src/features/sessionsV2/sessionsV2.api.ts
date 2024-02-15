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
  AddSessionV2Params,
  DeleteSessionV2Params,
  SessionV2,
  SessionV2List,
  UpdateSessionV2Params,
} from "./sessionsV2.types";

const sessionsV2Api = createApi({
  reducerPath: "sessionsV2Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/sessions",
  }),
  tagTypes: ["Launcher"],
  endpoints: (builder) => ({
    getSessionsV2: builder.query<SessionV2List, void>({
      query: () => {
        return {
          url: "",
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
    addSessionV2: builder.mutation<SessionV2, AddSessionV2Params>({
      query: ({ environment_id, name, project_id, description }) => {
        return {
          url: "",
          method: "POST",
          body: {
            project_id,
            name,
            description,
            environment_id,
          },
        };
      },
      invalidatesTags: ["Launcher"],
    }),
    updateSessionV2: builder.mutation<SessionV2, UpdateSessionV2Params>({
      query: ({ session_id, ...params }) => {
        return {
          url: `${session_id}`,
          method: "PATCH",
          body: { ...params },
        };
      },
      invalidatesTags: (_result, _error, { session_id }) => [
        { id: session_id, type: "Launcher" },
      ],
    }),
    deleteSessionV2: builder.mutation<unknown, DeleteSessionV2Params>({
      query: ({ sessionId }) => {
        return {
          url: `${sessionId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Launcher"],
    }),
  }),
});

export default sessionsV2Api;
export const {
  useGetSessionsV2Query,
  useAddSessionV2Mutation,
  useUpdateSessionV2Mutation,
  useDeleteSessionV2Mutation,
} = sessionsV2Api;
