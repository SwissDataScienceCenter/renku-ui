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

import {
  notificationsGeneratedApi,
  type GetAlertsApiArg,
  type GetAlertsApiResponse,
} from "./notifications.generated-api";

// Fixes some API endpoints
const withFixedEndpoints = notificationsGeneratedApi.injectEndpoints({
  endpoints: (build) => ({
    getAlerts: build.query<GetAlertsApiResponse, GetAlertsApiArg>({
      query: ({ params }) => ({
        url: `/alerts`,
        params,
      }),
    }),
  }),
  overrideExisting: true,
});

// Adds tag handling for cache management
export const notificationsApi = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["Alert"],
  endpoints: {
    getAlerts: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                id,
                type: "Alert" as const,
              })),
              "Alert",
            ]
          : ["Alert"],
    },
  },
});

export const { useGetAlertsQuery } = notificationsApi;
export type * from "./notifications.generated-api";
