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

import { persistedLogsGeneratedApi } from "./persistedLogs.generated-api";

// Adds tag handling for cache management
export const persistedLogsApi = persistedLogsGeneratedApi.enhanceEndpoints({
  addTagTypes: ["PersistedLogs", "SessionRun"],
  endpoints: {
    getPersistedLogsSessionsByLauncherId: {
      providesTags: (result) =>
        result
          ? [{ id: result.run.id, type: "PersistedLogs" }, "PersistedLogs"]
          : ["PersistedLogs"],
    },
    getPersistedLogsSessionsByLauncherIdRuns: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ id, type: "SessionRun" as const })),
              "SessionRun",
            ]
          : ["SessionRun"],
    },
  },
});

export const {
  useGetPersistedLogsSessionsByLauncherIdQuery,
  useGetPersistedLogsSessionsByLauncherIdRunsQuery,
} = persistedLogsApi;
export type * from "./persistedLogs.generated-api";
