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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

import {
  ProjectActivateIndexingResponse,
  ProjectIndexingStatusResponse,
} from "./Project";

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
    }),
  }),
});

export const { useActivateIndexingMutation, useGetProjectIndexingStatusQuery } =
  projectKgApi;
