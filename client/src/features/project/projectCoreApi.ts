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
import type { DatasetKg, IDatasetFile, ProjectConfig } from "./Project.d";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CoreServiceParams {
  versionUrl?: string;
}

interface GetDatasetFilesParams extends CoreServiceParams {
  git_url: string;
  name: string;
}

interface GetDatasetFilesResponse {
  result: {
    files: IDatasetFile[];
    name: string;
  };
  error: {
    userMessage?: string;
    reason?: string;
  };
}

interface GetDatasetKgParams {
  id: string;
}

interface IDatasetFiles {
  hasPart: { name: string; atLocation: string }[];
}

interface GetConfigParams extends CoreServiceParams {
  projectRepositoryUrl: string;
  branch?: string;
}

interface GetConfigRawResponse {
  result?: {
    config?: GetConfigRawResponseSection;
    default?: GetConfigRawResponseSection;
  };
}

interface GetConfigRawResponseSection {
  "interactive.default_url"?: string;
}

function versionedUrlEndpoint(endpoint: string, versionUrl?: string) {
  const urlPath = versionUrl ? `${versionUrl}/${endpoint}` : endpoint;
  return `/renku${urlPath}`;
}

function urlWithQueryParams(url: string, queryParams: any) {
  const query = new URLSearchParams(queryParams).toString();
  return `${url}?${query}`;
}

export const projectCoreApi = createApi({
  reducerPath: "projectCore",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api" }),
  endpoints: (builder) => ({
    getDatasetFiles: builder.query<IDatasetFiles, GetDatasetFilesParams>({
      query: (params: GetDatasetFilesParams) => {
        const queryParams = { git_url: params.git_url, name: params.name };
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        };
        return {
          url: urlWithQueryParams(
            versionedUrlEndpoint("datasets.files_list", params.versionUrl),
            queryParams
          ),
          method: "GET",
          headers: new Headers(headers),
        };
      },
      transformResponse: (response: GetDatasetFilesResponse) => {
        if (response.error)
          throw new Error(response.error.userMessage ?? response.error.reason);

        const files = response.result.files.map((file) => ({
          name: file.name,
          atLocation: file.path,
        }));
        return { hasPart: files };
      },
    }),
    getDatasetKg: builder.query<DatasetKg, GetDatasetKgParams>({
      query: (params: GetDatasetKgParams) => {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        };
        return {
          url: `/kg/datasets/${params.id}`,
          method: "GET",
          headers: new Headers(headers),
        };
      },
    }),

    getConfig: builder.query<ProjectConfig, GetConfigParams>({
      query: ({ projectRepositoryUrl, branch, versionUrl }) => {
        const params = {
          git_url: projectRepositoryUrl,
          ...(branch ? { branch } : {}),
        };
        return {
          url: versionedUrlEndpoint("config.show", versionUrl),
          params,
        };
      },
      transformResponse: (response: GetConfigRawResponse) => ({
        config: {
          interactive: {
            // defaultUrl: response.result?.config?.["interactive.default_url"],
            defaultUrl: "/test",
          },
        },
        default: {
          interactive: {
            defaultUrl: response.result?.default?.["interactive.default_url"],
          },
        },
      }),
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDatasetFilesQuery,
  useGetDatasetKgQuery,
  useGetConfigQuery,
} = projectCoreApi;
