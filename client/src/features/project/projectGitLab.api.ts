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
import { parseINIString } from "../../utils/helpers/HelperFunctions";
import {
  MAX_GITLAB_REPOSITORY_BRANCH_PAGES,
  MAX_GITLAB_REPOSITORY_COMMIT_PAGES,
  RENKU_CONFIG_FILE_PATH,
} from "./GitLab.constants";
import {
  GetAllRepositoryBranchesParams,
  GetConfigFromRepositoryParams,
  GetPipelineJobByNameParams,
  GetPipelinesParams,
  GetRegistryTagParams,
  GetRenkuRegistryParams,
  GetRepositoryBranchParams,
  GetRepositoryBranchesParams,
  GetRepositoryCommitParams,
  GetRepositoryCommits2Params,
  GetRepositoryCommitsParams,
  GitLabPipeline,
  GitLabPipelineJob,
  GitLabRegistry,
  GitLabRegistryTag,
  GitLabRepositoryBranch,
  GitLabRepositoryBranchList,
  GitLabRepositoryCommit,
  GitLabRepositoryCommitList,
  GitlabProjectResponse,
  Pagination,
  RetryPipelineParams,
  RunPipelineParams,
} from "./GitLab.types";
import { ProjectConfig } from "./Project";
import { transformGetConfigRawResponse } from "./projectCoreApi";
import processPaginationHeaders from "../../utils/helpers/pagination.utils";

const projectGitLabApi = createApi({
  reducerPath: "projectGitLab",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Branch", "Commit", "Job", "Pipeline", "Registry", "RegistryTag"],
  endpoints: (builder) => ({
    // Project API
    getProjectById: builder.query<GitlabProjectResponse, number>({
      query: (projectId: number) => {
        return {
          url: `${projectId}`,
        };
      },
    }),

    // Project pipelines API
    getPipelineJobByName: builder.query<
      GitLabPipelineJob | null,
      GetPipelineJobByNameParams
    >({
      queryFn: async (
        { jobName, pipelineIds, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        for (const pipelineId of pipelineIds) {
          const url = `${projectId}/pipelines/${pipelineId}/jobs`;
          const result = await fetchBaseQuery({ url });

          if (result.error) {
            return result;
          }

          const jobs = result.data as GitLabPipelineJob[];
          const found = jobs.find(({ name }) => name === jobName);
          if (found) {
            return { data: found };
          }
        }

        return { data: null };
      },
      providesTags: (result) =>
        result ? [{ id: result.id, type: "Job" }] : ["Job"],
    }),
    getPipelines: builder.query<GitLabPipeline[], GetPipelinesParams>({
      query: ({ commit, projectId }) => ({
        url: `${projectId}/pipelines`,
        params: {
          ...(commit ? { sha: commit } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ id }) => ({ id: `${id}`, type: "Pipeline" } as const)
              ),
              "Pipeline",
            ]
          : ["Pipeline"],
    }),
    retryPipeline: builder.mutation<GitLabPipeline, RetryPipelineParams>({
      query: ({ pipelineId, projectId }) => ({
        method: "POST",
        url: `${projectId}/pipelines/${pipelineId}/retry`,
      }),
      invalidatesTags: (_result, _error, { pipelineId }) => [
        { id: pipelineId, type: "Pipeline" },
        "Job",
      ],
    }),
    runPipeline: builder.mutation<GitLabPipeline, RunPipelineParams>({
      query: ({ projectId, ref }) => ({
        method: "POST",
        url: `${projectId}/pipeline`,
        body: {
          ref,
        },
      }),
      invalidatesTags: ["Pipeline"],
    }),

    //
    getRegistryTag: builder.query<GitLabRegistryTag, GetRegistryTagParams>({
      query: ({ projectId, registryId, tag }) => ({
        url: `${projectId}/registry/repositories/${registryId}/tags/${tag}`,
      }),
      providesTags: (result, _error, { tag }) =>
        result ? [{ type: "RegistryTag", id: tag }] : [],
    }),
    getRenkuRegistry: builder.query<GitLabRegistry, GetRenkuRegistryParams>({
      queryFn: async (
        { projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/registry/repositories`;

        const result = await fetchBaseQuery({ url });

        if (result.error) {
          return result;
        }

        const registries = result.data as GitLabRegistry[];
        if (registries.length == 0) {
          return {
            error: {
              error: "This project does not have any Docker image repository",
              status: "CUSTOM_ERROR",
            },
          };
        }

        if (registries.length == 1) {
          return { ...result, data: registries[0] };
        }

        // The CI we define has no name
        // ! This is not totally reliable since users can change it. We should probably give it a Renku name
        const renkuRegistry = registries.find(({ name }) => name === "");
        if (renkuRegistry != null) {
          return { ...result, data: renkuRegistry };
        }

        return {
          error: {
            error:
              "The project has multiple Docker image repositories. We can't identify the correct one",
            status: "CUSTOM_ERROR",
          },
        };
      },
      providesTags: (result) =>
        result ? [{ type: "Registry", id: result.id }] : [],
    }),

    // Project Repository API
    getRepositoryBranch: builder.query<
      GitLabRepositoryBranch,
      GetRepositoryBranchParams
    >({
      query: ({ branch, projectId }) => {
        return {
          url: `${projectId}/repository/branches/${encodeURIComponent(branch)}`,
        };
      },
    }),
    getRepositoryBranches: builder.query<
      GitLabRepositoryBranchList,
      GetRepositoryBranchesParams
    >({
      query: ({ page, perPage, projectId }) => {
        return {
          url: `${projectId}/repository/branches`,
          params: {
            ...(page ? { page } : {}),
            ...(perPage ? { per_page: perPage } : {}),
          },
        };
      },
      transformResponse: (response: GitLabRepositoryBranch[], meta) => {
        const pagination = processPaginationHeaders(meta?.response?.headers);
        return {
          data: response,
          pagination,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(
                ({ name }) => ({ type: "Branch", id: name } as const)
              ),
              "Branch",
            ]
          : ["Branch"],
    }),
    getAllRepositoryBranches: builder.query<
      GitLabRepositoryBranch[],
      GetAllRepositoryBranchesParams
    >({
      queryFn: async (
        { perPage, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/repository/branches`;

        const allBranches: GitLabRepositoryBranch[] = [];
        for (
          let currentPage = 1;
          currentPage <= MAX_GITLAB_REPOSITORY_BRANCH_PAGES;
          ++currentPage
        ) {
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

          const branches = result.data as GitLabRepositoryBranch[];
          allBranches.push(...branches);

          const responseHeaders = result.meta?.response?.headers;
          const pagination = processPaginationHeaders(responseHeaders);

          if (pagination.nextPage == null) {
            break;
          }
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
      GitLabRepositoryCommit,
      GetRepositoryCommitParams
    >({
      query: ({ commitSha, projectId }) => ({
        url: `${projectId}/repository/commits/${commitSha}`,
      }),
      providesTags: (result) =>
        result ? [{ id: result.id, type: "Commit" }, "Commit"] : ["Commit"],
    }),
    getRepositoryCommits2: builder.query<
      GitLabRepositoryCommitList,
      GetRepositoryCommits2Params
    >({
      query: ({ branch, page, perPage, projectId }) => {
        return {
          url: `${projectId}/repository/commits`,
          params: {
            ref_name: branch,
            ...(page ? { page } : {}),
            ...(perPage ? { per_page: perPage } : {}),
          },
        };
      },
      transformResponse: (response: GitLabRepositoryCommit[], meta) => {
        const pagination = processPaginationHeaders(meta?.response?.headers);
        console.log({ pagination });
        return {
          data: response,
          pagination,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Commit", id } as const)),
              "Commit",
            ]
          : ["Commit"],
    }),
    getRepositoryCommits: builder.query<
      GitLabRepositoryCommit[],
      GetRepositoryCommitsParams
    >({
      queryFn: async (
        { branch, perPage, projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/repository/commits`;

        const allCommits: GitLabRepositoryCommit[] = [];
        for (
          let currentPage = 1;
          currentPage <= MAX_GITLAB_REPOSITORY_COMMIT_PAGES;
          ++currentPage
        ) {
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

          const commits = result.data as GitLabRepositoryCommit[];
          allCommits.push(...commits);

          const responseHeaders = result.meta?.response?.headers;
          const pagination = processPaginationHeaders(
            responseHeaders
          ) as Pagination;

          if (pagination.nextPage == null) {
            break;
          }
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

// function extractPaginationMetadata(
//   headers: Headers | undefined | null
// ): PaginationMetadata {
//   const pageStr = headers?.get("X-Page");
//   const perPageStr = headers?.get("X-Per-Page");
//   const nextPageStr = headers?.get("X-Next-Page");
//   const totalStr = headers?.get("X-Total");
//   const totalPagesStr = headers?.get("X-Total-Pages");

//   if (!pageStr || !perPageStr) {
//     throw new Error("Missing pagination headers");
//   }

//   const page = parseInt(pageStr, 10);
//   const perPage = parseInt(perPageStr, 10);
//   const hasMore = !!nextPageStr && nextPageStr.trim() !== "";
//   const total = totalStr ? parseInt(totalStr, 10) : undefined;
//   const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : undefined;

//   if (
//     isNaN(page) ||
//     isNaN(perPage) ||
//     (total && isNaN(total)) ||
//     (totalPages && isNaN(totalPages))
//   ) {
//     throw new Error("Invalid pagination headers");
//   }

//   return {
//     hasMore,
//     page,
//     perPage,
//     total,
//     totalPages,
//   };
// }

export default projectGitLabApi;
export const {
  useGetProjectByIdQuery,
  useGetPipelineJobByNameQuery,
  useGetPipelinesQuery,
  useRetryPipelineMutation,
  useRunPipelineMutation,
  useGetRepositoryBranchQuery,
  useGetRepositoryBranchesQuery,
  useGetAllRepositoryBranchesQuery,
  useGetConfigFromRepositoryQuery,
  useGetRepositoryCommitQuery,
  useGetRepositoryCommitsQuery,
  useGetRepositoryCommits2Query,
} = projectGitLabApi;
