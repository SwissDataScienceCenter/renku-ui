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
  Pipeline,
  PipelineJob,
  RetryPipelineParams,
  RunPipelineParams,
} from "./pipelines.types";

const pipelinesApi = createApi({
  reducerPath: "pipelines",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Job", "Pipeline"],
  endpoints: (builder) => ({
    getPipelineJobByName: builder.query<
      PipelineJob | null,
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

          const jobs = result.data as PipelineJob[];
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
    getPipelines: builder.query<Pipeline[], GetPipelinesParams>({
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
    retryPipeline: builder.mutation<Pipeline, RetryPipelineParams>({
      query: ({ pipelineId, projectId }) => ({
        method: "POST",
        url: `${projectId}/pipelines/${pipelineId}/retry`,
      }),
      invalidatesTags: (_result, _error, { pipelineId }) => [
        { id: pipelineId, type: "Pipeline" },
      ],
    }),
    runPipeline: builder.mutation<Pipeline, RunPipelineParams>({
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

export default pipelinesApi;
export const {
  useGetPipelineJobByNameQuery,
  useGetPipelinesQuery,
  useRetryPipelineMutation,
  useRunPipelineMutation,
} = pipelinesApi;
