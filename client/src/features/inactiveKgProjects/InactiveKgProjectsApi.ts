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


export const inactiveKgProjectsApi = createApi({
  reducerPath: "inactiveKgProjectsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/kg" }),
  endpoints: (builder) => ({
    getInactiveKgProjects: builder.query<InactiveKgProjects[], number>({
      query: (userId) => `users/${userId}/projects?state=NOT_ACTIVATED`,
      transformResponse: (response: any) => {
        let projects = [];
        if (response) {
          projects = response
            .map( (p: any) => {
              return {
                id: p.id,
                title: p.name,
                namespaceWithPath: p.path,
                description: p.description ?? "",
                visibility: p.visibility,
                selected: true,
                progressActivation: -1,
              };
            });
        }
        return projects;
      }
    }),
  })
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useGetInactiveKgProjectsQuery } = inactiveKgProjectsApi;
