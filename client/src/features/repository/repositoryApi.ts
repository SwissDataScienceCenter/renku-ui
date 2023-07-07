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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GetRepositoryBranchesParams,
  GetRepositoryCommitParams,
  RepositoryCommit,
} from "./repository.types";

const repositoryApi = createApi({
  reducerPath: "repository",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Commit"],
  endpoints: (builder) => ({
    getRepositoryBranches: builder.query<unknown, GetRepositoryBranchesParams>({
      query: ({ page, perPage, projectId }) => ({
        url: `${projectId}/repository/branches`,
        params: {
          ...(page ? { page } : {}),
          ...(perPage ? { perPage } : {}),
        },
      }),
    }),
    getRepositoryCommit: builder.query<
      RepositoryCommit,
      GetRepositoryCommitParams
    >({
      query: ({ commitSha, projectId }) => ({
        url: `${projectId}/repository/commits/${commitSha}`,
      }),
      providesTags: (result) =>
        result ? [{ type: "Commit", id: result.id }, "Commit"] : ["Commit"],
    }),
  }),
});

export default repositoryApi;
export const { useGetRepositoryBranchesQuery, useGetRepositoryCommitQuery } =
  repositoryApi;

// client.getRepositoryCommit = async (projectId, commitSHA) => {
//     let headers = client.getBasicHeaders();
//     return client
//       .clientFetch(
//         `${client.baseUrl}/projects/${projectId}/repository/commits/${commitSHA}`,
//         {
//           method: "GET",
//           headers: headers,
//         },
//         client.returnTypes.full,
//         false
//       )
//       .then((response) => {
//         return response.json();
//       });
//   };
