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
  GetPipelineJobByNameParams,
  GetPipelinesParams,
  GitLabPipeline,
  GitLabPipelineJob,
  GitlabProjectResponse,
  RetryPipelineParams,
  RunPipelineParams,
} from "./GitLab.types";

const projectGitLabApi = createApi({
  reducerPath: "projectGitLab",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Job", "Pipeline"],
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
        result ? [{ id: result.id, type: "Job" }] : [],
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
  }),
});

export default projectGitLabApi;
export const {
  useGetProjectByIdQuery,
  useGetPipelineJobByNameQuery,
  useGetPipelinesQuery,
  useRetryPipelineMutation,
  useRunPipelineMutation,
} = projectGitLabApi;
