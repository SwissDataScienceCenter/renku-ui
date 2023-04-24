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
import { InactiveKgProjects } from "./InactiveKgProjects";

interface InactiveKgProjectsResponse {
  data: InactiveKgProjects[];
  nextPage?: number | undefined;
  total: number;
  page: number;
}

interface InactiveProjectParams {
  userId: number;
  perPage: number;
  page: number;
}

export const inactiveKgProjectsApi = createApi({
  reducerPath: "inactiveKgProjectsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/kg" }),
  endpoints: (builder) => ({
    getInactiveKgProjects: builder.query<
      InactiveKgProjectsResponse,
      InactiveProjectParams
    >({
      query: (params: InactiveProjectParams) =>
        `users/${params.userId}/projects?state=NOT_ACTIVATED&per_page=${params.perPage}&page=${params.page}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response: any, meta) => {
        let projects = [];
        if (response) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          projects = response.map((p: any) => {
            return {
              id: p.id,
              title: p.name,
              namespaceWithPath: p.path,
              description: p.description ?? "",
              visibility: p.visibility,
              selected: true,
              progressActivation: null,
            };
          });
        }
        const nextPage = meta?.response?.headers.get("next-page");
        return {
          data: projects,
          nextPage: nextPage ? parseInt(nextPage) : undefined,
          total: parseInt(meta?.response?.headers.get("total") ?? "0"),
          page: parseInt(meta?.response?.headers.get("page") ?? "1"),
        };
      },
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useGetInactiveKgProjectsQuery } = inactiveKgProjectsApi;
