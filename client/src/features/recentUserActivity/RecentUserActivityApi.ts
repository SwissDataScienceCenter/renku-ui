/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

interface KgLastSearchResult {
  queries?: string[],
  error?: string,
}
export const TOTAL_QUERIES = 6;


export const recentUserActivityApi = createApi({
  reducerPath: "recentUserActivityApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/" }),
  endpoints: (builder) => ({
    searchLastQueries: builder.query<KgLastSearchResult, number>({
      query: (numberWords) => `last-searches/${numberWords}`,
      transformResponse: (response: KgLastSearchResult) => {
        let queries: string[] = [];
        if (response?.queries?.length) {
          queries = response?.queries
            .map(query => query.replace(/\*/g, "").trim())
            .filter(query => query.length > 0)
            .slice(0, 5);
        }
        response.queries = queries;
        return response;
      }
    }),
  })
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useSearchLastQueriesQuery } = recentUserActivityApi;
