/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { appsGeneratedApi } from "./apps.generated-api";

const withTagHandling = appsGeneratedApi.enhanceEndpoints({
  addTagTypes: ["App"],
  endpoints: {
    getApps: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ name }) => ({
                id: name,
                type: "App" as const,
              })),
              "App",
            ]
          : ["App"],
    },
    getAppsByAppName: {
      providesTags: (result) =>
        result ? [{ id: result.name, type: "App" }, "App"] : ["App"],
    },
    postApps: {
      invalidatesTags: ["App"],
    },
    deleteAppsByAppName: {
      invalidatesTags: ["App"],
    },
    getAppsByAppNameLogs: {
      keepUnusedDataFor: 0,
    },
  },
});

export const appsApi = withTagHandling.injectEndpoints({
  endpoints: (build) => ({
    invalidateApps: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["App"],
    }),
  }),
});

export const {
  useGetAppsQuery,
  useGetAppsByAppNameQuery,
  useGetAppsByAppNameLogsQuery,
  usePostAppsMutation,
  useDeleteAppsByAppNameMutation,
} = appsApi;

export type * from "./apps.generated-api";
