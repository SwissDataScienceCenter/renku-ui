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
import processPaginationHeaders from "../../api-client/pagination";
import { parseINIString } from "../../utils/helpers/HelperFunctions";
import { ProjectConfig } from "../project/Project";
import { transformGetConfigRawResponse } from "../project/projectCoreApi";
import { RENKU_CONFIG_FILE_PATH } from "./repository.constants";
import {
  GetAllRepositoryBranchesParams,
  GetConfigFromRepositoryParams,
  GetRepositoryCommitParams,
  GetRepositoryCommitsParams,
  Pagination,
  RepositoryBranch,
  RepositoryCommit,
} from "./repository.types";

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
          ) as Pagination;

          if (pagination.nextPage == null) {
            break;
          }

          ++currentPage;
        }

        return { data: allBranches };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ name }) => ({ type: "Branch", id: name } as const)
              ),
              "Branch",
            ]
          : ["Branch"],
    }),
    getConfigFromRepository: builder.query<
      ProjectConfig,
      GetConfigFromRepositoryParams
    >({
      queryFn: async (
        { commit, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const filePath = encodeURIComponent(RENKU_CONFIG_FILE_PATH);
        const url = `${projectId}/repository/files/${filePath}/raw?ref=${commit}`;
        const result = await fetchBaseQuery({ url, responseHandler: "text" });

        if (result.error != null) {
          return result;
        }

        const { data, error } = (() => {
          try {
            return {
              data: parseINIString(result.data) as Record<
                string,
                Record<string, string>
              >,
              error: null,
            };
          } catch (error) {
            return { data: null, error };
          }
        })();
        if (data == null) {
          return {
            error: {
              data: result.data as string,
              error: `${error}`,
              originalStatus: result.meta?.response?.status ?? 0,
              status: "PARSING_ERROR",
            },
          };
        }

        const flattened = Object.entries(data.interactive ?? {}).reduce(
          (obj, [key, value]) => ({ ...obj, [`interactive.${key}`]: value }),
          {} as Record<string, string>
        );
        const projectConfig = transformGetConfigRawResponse({
          result: {
            config: flattened,
          },
        });

        return { data: projectConfig };
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
        result ? [{ id: result.id, type: "Commit" }, "Commit"] : ["Commit"],
    }),
    getRepositoryCommits: builder.query<
      RepositoryCommit[],
      GetRepositoryCommitsParams
    >({
      queryFn: async (
        { branch, perPage, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/repository/commits`;

        const allCommits: RepositoryCommit[] = [];
        let currentPage = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const result = await fetchBaseQuery({
            url,
            params: {
              ref_name: branch,
              page: currentPage,
              per_page: perPage ?? 100,
            },
          });

          if (result.error != null) {
            return result;
          }

          const commits = result.data as RepositoryCommit[];
          allCommits.push(...commits);

          const responseHeaders = result.meta?.response?.headers;
          const pagination = processPaginationHeaders(
            responseHeaders
          ) as Pagination;

          if (pagination.nextPage == null) {
            break;
          }

          ++currentPage;
        }

        return { data: allCommits };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Commit", id } as const)),
              "Commit",
            ]
          : ["Commit"],
    }),
  }),
});

export default repositoryApi;
export const {
  useGetAllRepositoryBranchesQuery,
  useGetConfigFromRepositoryQuery,
  useGetRepositoryCommitQuery,
} = repositoryApi;
