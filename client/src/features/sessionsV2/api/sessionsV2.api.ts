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
    getSessionsImages: {
      transformResponse: (_1, _2, arg) => {
        return {
          accessible:
            arg.imageUrl.includes("false") ||
            arg.imageUrl.includes("error") ||
            arg.imageUrl.includes("fake")
              ? false
              : true,
          // "connected" | "pending" | "disconnected"
          connection: arg.imageUrl.includes("pending")
            ? "pending"
            : arg.imageUrl.includes("disconnected")
            ? "disconnected"
            : "connected",
        };
      },
      transformErrorResponse: () => {
        return {
          accessible: false,
          connection: "pending",
        };
      },
    },
  },
});

// Adds tag invalidation endpoints
export const sessionsV2Api = withTagHandling.injectEndpoints({
  endpoints: (build) => ({
    invalidateSessions: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["Session"],
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
} = sessionsV2Api;

export type * from "./sessionsV2.generated-api";
