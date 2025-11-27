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

import { sessionsV2GeneratedApi } from "./sessionsV2.generated-api";

// Alert types (manually added - not in generated API yet)
export interface Alert {
  id: string;
  title: string;
  message: string;
  event_type: string;
  user_id: string;
  session_name?: string;
  creation_date: string;
  resolved_at?: string;
}

export type AlertList = Alert[];

// Adds tag handling for cache management
const withTagHandling = sessionsV2GeneratedApi.enhanceEndpoints({
  addTagTypes: ["Session"],
  endpoints: {
    getSessions: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ name }) => ({
                id: name,
                type: "Session" as const,
              })),
              "Session",
            ]
          : ["Session"],
    },
    getSessionsBySessionId: {
      providesTags: (result) =>
        result
          ? [{ id: result.name, type: "Session" }, "Session"]
          : ["Session"],
    },
    postSessions: {
      invalidatesTags: ["Session"],
    },
    patchSessionsBySessionId: {
      invalidatesTags: (result) =>
        result ? [{ id: result.name, type: "Session" }] : ["Session"],
    },
    deleteSessionsBySessionId: {
      invalidatesTags: ["Session"],
    },
    getSessionsBySessionIdLogs: {
      transformResponse: (result: unknown) => {
        return result && typeof result == "string"
          ? JSON.parse(result)
          : result;
      },
      keepUnusedDataFor: 0,
    },
  },
});

// Adds tag invalidation endpoints and alerts
export const sessionsV2Api = withTagHandling.injectEndpoints({
  endpoints: (build) => ({
    invalidateSessions: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["Session"],
    }),
    getAlerts: build.query<AlertList, { sessionName?: string }>({
      query: (queryArg) => ({
        url: `/alerts`,
        params: queryArg.sessionName
          ? { session_name: queryArg.sessionName }
          : {},
      }),
    }),
  }),
});

export const {
  // "sessions" hooks
  useGetSessionsQuery,
  useGetSessionsBySessionIdQuery,
  usePostSessionsMutation,
  usePatchSessionsBySessionIdMutation,
  useDeleteSessionsBySessionIdMutation,
  useGetSessionsBySessionIdLogsQuery,
  useGetSessionsImagesQuery,
  // "alerts" hooks
  useGetAlertsQuery,
} = sessionsV2Api;

export type * from "./sessionsV2.generated-api";
