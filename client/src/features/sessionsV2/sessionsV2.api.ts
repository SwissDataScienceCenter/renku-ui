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
import { DateTime } from "luxon";

const sessionsV2Api = createApi({
  reducerPath: "sessionsV2Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/sessions",
  }),
  tagTypes: ["SessionV2"],
  endpoints: (builder) => ({
    getSessionsV2: builder.query<SessionV2List, void>({
      query: () => {
        return {
          url: "",
        };
      },
    }),
    getSessionsV2Fake: builder.query<SessionV2List, void>({
      queryFn: () => {
        const session1: SessionV2 = {
          id: "session-1234",
          name: "fake-session-1",
          creationDate: DateTime.utc().minus({ days: 4 }).toISO(),
          description: "A fake session",
          environmentDefinition: "python:latest",
        };
        const session2: SessionV2 = {
          id: "session-5678",
          name: "fake-session-2",
          creationDate: DateTime.utc().minus({ days: 1 }).toISO(),
          description: "Another fake session",
          environmentDefinition: "rstudio:latest",
        };

        return {
          data: [session1, session2],
        };
      },
    }),
    addSessionV2: builder.mutation<unknown, AddSessionV2Params>({
      query: ({ environmentDefinition, name, projectId, description }) => {
        return {
          url: "",
          method: "POST",
          body: {
            project_id: projectId,
            name,
            description,
            environment_id: environmentDefinition,
          },
        };
      },
    }),
    updateSessionV2: builder.mutation<unknown, UpdateSessionV2Params>({
      query: ({ sessionId, ...params }) => {
        return {
          url: `${sessionId}`,
          method: "PATCH",
          body: { ...params },
        };
      },
    }),
    deleteSessionV2: builder.mutation<unknown, DeleteSessionV2Params>({
      query: ({ sessionId }) => {
        return {
          url: `${sessionId}`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export default sessionsV2Api;
export const {
  useGetSessionsV2Query,
  useGetSessionsV2FakeQuery,
  useAddSessionV2Mutation,
  useUpdateSessionV2Mutation,
  useDeleteSessionV2Mutation,
} = sessionsV2Api;
