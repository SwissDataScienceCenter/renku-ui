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

import {
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import {
  GetRepositoryBranchResponse,
  GetAllRepositoryBranchesParams,
  GetRepositoryCommitParams,
  RepositoryBranch,
  RepositoryBranchesPage,
  RepositoryCommit,
} from "./repository.types";
import processPaginationHeaders from "../../api-client/pagination";
import { useEffect, useState } from "react";

const repositoryApi = createApi({
  reducerPath: "repository",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Branch", "Commit"],
  endpoints: (builder) => ({
    getAllRepositoryBranches: builder.query<
      RepositoryBranch[],
      GetAllRepositoryBranchesParams
    >({
      queryFn: async (
        { perPage, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/repository/branches`;

        const allBranches: RepositoryBranch[] = [];
        let currentPage = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const result = await fetchBaseQuery({
            url,
            params: {
              page: currentPage,
              per_page: perPage ?? 100,
            },
          });

          if (result.error != null) {
            return result;
          }

          const branches = result.data as RepositoryBranch[];
          allBranches.push(...branches);

          const responseHeaders = result.meta?.response?.headers;
          const pagination = processPaginationHeaders(
            responseHeaders
          ) as RepositoryBranchesPage["pagination"];

          if (pagination.nextPage == null) {
            break;
          }

          ++currentPage;
        }

        return { data: allBranches };
      },
      providesTags: ["Branch"],
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
export const { useGetAllRepositoryBranchesQuery, useGetRepositoryCommitQuery } =
  repositoryApi;
