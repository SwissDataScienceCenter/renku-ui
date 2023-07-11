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
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  GitlabProjectResponse,
  UpdateProjectResponse,
  UpdateProjectVisibilityParams,
} from "./Project";

export const projectGitlabApi = createApi({
  reducerPath: "projectGitlab",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/" }),
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getProjectById: builder.query<GitlabProjectResponse, number>({
      query: (projectId: number) => {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        };
        return {
          url: `projects/${projectId}`,
          method: "GET",
          headers: new Headers(headers),
        };
      },
    }),
    updateVisibility: builder.mutation<
      UpdateProjectResponse,
      UpdateProjectVisibilityParams
    >({
      query: ({ projectId, visibility }) => {
        const body = {
          visibility,
        };
        return {
          method: "PUT",
          url: `projects/${projectId}`,
          body,
          validateStatus: (response, body) =>
            response.status >= 200 && response.status < 300 && !body.error,
        };
      },
      transformErrorResponse: (error): FetchBaseQueryError => {
        const { status, data } = error;
        if (status === 500 && typeof data === "object" && data != null) {
          const data_ = data as { message?: unknown };
          if (
            typeof data_.message === "string" &&
            data_.message.match(/403 Forbidden/i)
          ) {
            return {
              status: 403,
              data,
            };
          }
        }
        return error as FetchBaseQueryError;
      },
    }),
  }),
});

export const { useUpdateVisibilityMutation, useGetProjectByIdQuery } =
  projectGitlabApi;
