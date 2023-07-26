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
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import {
  DatasetKg,
  DeleteProjectParams,
  DeleteProjectResponse,
  EditProjectParams,
  GetDatasetKgParams,
  KgMetadataResponse,
  ProjectActivateIndexingResponse,
  ProjectIndexingStatusResponse,
  ProjectKgParams,
  UpdateProjectResponse,
} from "./Project";
import { ProjectIndexingStatuses } from "./projectEnums";
import {
  kgProjectRequestHeaders,
  projectsKgApi,
} from "../projects/projectsKgApi";

interface errorDataMessage {
  data: {
    message: string;
  };
}

export const projectKgApi = createApi({
  reducerPath: "projectKg",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/kg/" }),
  tagTypes: ["project", "project-indexing"],
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    activateIndexing: builder.mutation<ProjectActivateIndexingResponse, number>(
      {
        query: (projectId) => {
          return {
            url: `webhooks/projects/${projectId}/webhooks`,
            method: "POST",
          };
        },
        invalidatesTags: (result, error, projectId) => [
          { type: "project-indexing", id: projectId },
        ],
      }
    ),
    deleteProject: builder.mutation<DeleteProjectResponse, DeleteProjectParams>(
      {
        query: ({ projectPathWithNamespace }) => {
          return {
            method: "DELETE",
            url: `projects/${projectPathWithNamespace}`,
          };
        },
        invalidatesTags: ["project"],
        transformErrorResponse: (error) => {
          const { status, data } = error;
          if (status === 500 && typeof data === "object" && data != null) {
            const data_ = data as { message?: unknown };
            if (
              typeof data_.message === "string" &&
              data_.message.match(/403 Forbidden/i)
            ) {
              const newError: FetchBaseQueryError = {
                status: 403,
                data,
              };
              return newError;
            }
          }
          return error;
        },
      }
    ),
    getDatasetKg: builder.query<DatasetKg, GetDatasetKgParams>({
      query: (params: GetDatasetKgParams) => {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        };
        return {
          url: `datasets/${params.id}`,
          method: "GET",
          headers: new Headers(headers),
        };
      },
    }),
    getProjectIndexingStatus: builder.query<
      ProjectIndexingStatusResponse,
      number
    >({
      query: (projectId) => {
        return {
          url: `webhooks/projects/${projectId}/events/status`,
          validateStatus: (response) =>
            response.status < 400 || response.status === 404,
        };
      },
      providesTags: (result, error, projectId) => [
        { type: "project-indexing", id: projectId },
      ],
      transformErrorResponse: (errorData) => {
        if (errorData.status === 404 && errorData.data && "message") {
          if (
            (errorData as errorDataMessage).data.message?.includes(
              "project cannot be found"
            )
          )
            return { activated: false };
        }
        throw errorData;
      },
      onQueryStarted: (projectId, { dispatch, queryFulfilled }) => {
        queryFulfilled.then((result) => {
          // When status is successful, re-fetch the up-to-date metadata
          if (
            result.data.activated &&
            result.data.details?.status === ProjectIndexingStatuses.Success
          ) {
            dispatch(
              projectsKgApi.util.invalidateTags([
                { type: "project-kg-metadata", id: projectId },
              ])
            );
          }
        });
      },
    }),
    updateProject: builder.mutation<UpdateProjectResponse, EditProjectParams>({
      query: ({ projectPathWithNamespace, visibility }) => {
        return {
          method: "PUT",
          url: `projects/${projectPathWithNamespace}`,
          body: {
            visibility,
          },
        };
      },
      invalidatesTags: (result, err, args) => [
        { type: "project", id: args.projectPathWithNamespace },
      ],
      transformErrorResponse: (error) => {
        const { status, data } = error;
        if (status === 500 && typeof data === "object" && data != null) {
          const data_ = data as { message?: unknown };
          if (
            typeof data_.message === "string" &&
            data_.message.match(/403 Forbidden/i)
          ) {
            const newError: FetchBaseQueryError = {
              status: 403,
              data,
            };
            return newError;
          }
        }
        return error;
      },
    }),
  }),
});

export const {
  useActivateIndexingMutation,
  useGetDatasetKgQuery,
  useGetProjectIndexingStatusQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} = projectKgApi;
