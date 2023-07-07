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
  GetRepositoryBranchResponse,
  GetRepositoryBranchesParams,
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
  tagTypes: ["Commit"],
  endpoints: (builder) => ({
    getRepositoryBranches: builder.query<
      RepositoryBranchesPage,
      GetRepositoryBranchesParams
    >({
      query: ({ page, perPage, projectId }) => ({
        url: `${projectId}/repository/branches`,
        params: {
          page: page ?? 1,
          per_page: perPage ?? 2,
        },
      }),
      transformResponse: (branches: GetRepositoryBranchResponse, meta) => {
        const responseHeaders = meta?.response?.headers;
        const pagination = processPaginationHeaders(responseHeaders);
        return {
          branches,
          pagination,
        };
      },
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

export function useGetAllRepositoryBranches(
  {
    projectId,
  }: {
    projectId: string;
  },
  options?: Omit<
    Parameters<typeof repositoryApi.useGetRepositoryBranchesQuery>[1],
    "selectFromResult"
  >
) {
  const { data: firstPage, ...firstPageResult } =
    repositoryApi.useGetRepositoryBranchesQuery(
      {
        projectId,
      },
      options
    );

  // Handle fetching all pages
  const [{ allBranches, currentPage }, setState] = useState<{
    allBranches: RepositoryBranch[];
    currentPage: number | null;
  }>({ allBranches: [], currentPage: null });
  const [trigger, result] = repositoryApi.useLazyGetRepositoryBranchesQuery();

  // Trigger getting all pages if data from the first page changes
  useEffect(() => {
    if (firstPage != null && firstPage.pagination.nextPage != null) {
      setState({
        allBranches: [...firstPage.branches],
        currentPage: firstPage.pagination.nextPage,
      });
      return;
    }
    if (firstPage != null) {
      setState({ allBranches: [...firstPage.branches], currentPage: null });
    }
  }, [firstPage]);

  useEffect(() => {
    if (currentPage == null || firstPage == null) {
      return;
    }
    trigger({
      projectId,
      page: currentPage,
      perPage: firstPage.pagination.perPage,
    });
  }, [currentPage, firstPage, projectId, trigger]);

  useEffect(() => {
    if (
      result.currentData != null &&
      result.currentData.pagination.nextPage != null
    ) {
      const newBranches = result.currentData.branches;
      const nextPage = result.currentData.pagination.nextPage;
      setState(({ allBranches }) => ({
        allBranches: [...allBranches, ...newBranches],
        currentPage: nextPage,
      }));
      return;
    }
    if (result.currentData != null) {
      const newBranches = result.currentData.branches;
      setState(({ allBranches }) => ({
        allBranches: [...allBranches, ...newBranches],
        currentPage: null,
      }));
      return;
    }
  }, [result.currentData]);

  return {
    ...firstPageResult,
    ...result,
    data: currentPage == null ? allBranches : null,
  };
}

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
