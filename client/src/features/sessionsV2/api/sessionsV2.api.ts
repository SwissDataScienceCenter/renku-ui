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

import type { RootState } from "~/store/store";
import sessionStopIntentSlice from "../sessionStopIntent.slice";
import { deriveSessionStopIntent } from "../sessionStopIntent.utils";
import { SESSION_LAUNCHER_KIND, SessionV2 } from "../sessionsV2.types";
import { sessionsV2GeneratedApi } from "./sessionsV2.generated-api";

function findSessionInCache(
  state: RootState,
  sessionId: string,
): SessionV2 | undefined {
  const fromDetail =
    sessionsV2GeneratedApi.endpoints.getSessionsBySessionId.select({
      sessionId,
    })(state).data;

  if (fromDetail) {
    return fromDetail;
  }

  const queries = state.sessionsV2Api.queries as Record<
    string,
    { data?: SessionV2[] }
  >;

  for (const query of Object.values(queries)) {
    const session = query.data?.find(({ name }) => name === sessionId);
    if (session) {
      return session;
    }
  }

  return undefined;
}

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(sessionStopIntentSlice.actions.syncWithSessions(data));
          }
        } catch {
          // Ignore query errors when syncing stop intent.
        }
      },
    },
    getSessionsBySessionId: {
      providesTags: (result) =>
        result
          ? [{ id: result.name, type: "Session" }, "Session"]
          : ["Session"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(sessionStopIntentSlice.actions.syncWithSession(data));
          }
        } catch {
          // Ignore query errors when syncing stop intent.
        }
      },
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
      async onQueryStarted(
        { sessionId },
        { dispatch, getState, queryFulfilled },
      ) {
        const session = findSessionInCache(getState() as RootState, sessionId);

        if (session?.session_type === SESSION_LAUNCHER_KIND.NON_INTERACTIVE) {
          dispatch(
            sessionStopIntentSlice.actions.setSessionStopIntent({
              sessionId,
              intent: deriveSessionStopIntent(session.status.state),
            }),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          dispatch(
            sessionStopIntentSlice.actions.clearSessionStopIntent({
              sessionId,
            }),
          );
        }
      },
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
