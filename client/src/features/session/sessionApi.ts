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
  GetSessionsRawResponse,
  ServerOptions,
  ServerOptionsResponse,
  Sessions,
} from "./session";

interface StopSessionArgs {
  serverName: string;
}

interface GetLogsArgs {
  serverName: string;
  lines: number;
}

export const sessionApi = createApi({
  reducerPath: "sessionApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/notebooks/" }),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    getSessions: builder.query<Sessions, void>({
      query: () => ({ url: "servers" }),
      transformResponse: ({ servers }: GetSessionsRawResponse) => servers,
      providesTags: ["Session"],
    }),
    invalidateSessions: builder.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["Session"],
    }),
    serverOptions: builder.query<ServerOptions, Record<never, never>>({
      query: () => ({
        url: "server_options",
      }),
      transformResponse: ({
        defaultUrl,
        ...legacyOptions
      }: ServerOptionsResponse) => ({
        defaultUrl,
        legacyOptions,
      }),
    }),
    stopSession: builder.mutation<boolean, StopSessionArgs>({
      query: (args) => ({
        method: "DELETE",
        url: `servers/${args.serverName}`,
      }),
      invalidatesTags: ["Session"],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLogs: builder.query<any, GetLogsArgs>({
      query: (args) => {
        return {
          url: `logs/${args.serverName}`,
          params: { max_lines: args.lines },
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useServerOptionsQuery,
  useStopSessionMutation,
  useGetLogsQuery,
} = sessionApi;
