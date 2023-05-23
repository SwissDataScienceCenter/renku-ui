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
import type {
  DatasetKg,
  IDatasetFile,
  ProjectConfig,
  ProjectConfigSection,
} from "./Project.d";

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
  error?: unknown;
}

interface GetConfigRawResponseSection {
  "interactive.default_url"?: string;
  "interactive.session_class"?: string;
  "interactive.lfs_auto_fetch"?: string;
  "interactive.disk_request"?: string;
  "interactive.cpu_request"?: string;
  "interactive.mem_request"?: string;
  "interactive.gpu_request"?: string;
  "interactive.image"?: string;
}

interface UpdateConfigParams extends GetConfigParams {
  projectRepositoryUrl: string;
  branch?: string;
  update: {
    [key: string]: string | null;
  };
}

interface UpdateConfigResponse {
  branch: string;
  update: {
    [key: string]: string;
  };
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
  tagTypes: ["ProjectConfig"],
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
      queryFn: async (
        { projectRepositoryUrl, versionUrl },
        _api,
        _extraOptions,
        baseQuery
      ) => {
        const params = {
          git_url: projectRepositoryUrl,
          // Branch option not working currently
          // ...(branch ? { branch } : {}),
        };
        const response = await baseQuery({
          url: versionedUrlEndpoint("config.show", versionUrl),
          params,
        });
        if (response.error) {
          return response;
        }
        try {
          return {
            meta: response.meta,
            data: transformGetConfigRawResponse(
              response.data as GetConfigRawResponse
            ),
          };
        } catch (error_) {
          const error: FetchBaseQueryError = {
            status: "CUSTOM_ERROR",
            data: error_,
            error: "renku-core error",
          };
          return { meta: response.meta, error };
        }
      },
      providesTags: (_result, _error, arg) => [
        { type: "ProjectConfig", id: arg.projectRepositoryUrl },
      ],
    }),
    updateConfig: builder.mutation<UpdateConfigResponse, UpdateConfigParams>({
      queryFn: async (
        { projectRepositoryUrl, versionUrl, update },
        _api,
        _extraOptions,
        baseQuery
      ) => {
        const body = {
          git_url: projectRepositoryUrl,
          // Branch option not working currently
          // ...(branch ? { branch } : {}),
          config: update,
        };
        const response = await baseQuery({
          url: versionedUrlEndpoint("config.set", versionUrl),
          method: "POST",
          body,
        });
        if (response.error) {
          return response;
        }
        const data = response.data as any;
        if (data.error) {
          const error: FetchBaseQueryError = {
            status: "CUSTOM_ERROR",
            data: data.error,
            error: "renku-core error",
          };
          return { meta: response.meta, error };
        }
        return {
          meta: response.meta,
          data: {
            branch: data.remote_branch,
            update: data.config,
          },
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "ProjectConfig", id: arg.projectRepositoryUrl },
      ],
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDatasetFilesQuery,
  useGetDatasetKgQuery,
  useGetConfigQuery,
  useUpdateConfigMutation,
} = projectCoreApi;

const transformGetConfigRawResponse = (
  response: GetConfigRawResponse
): ProjectConfig => {
  if (response.error) {
    throw response.error;
  }

  const projectSessionsConfig = response.result?.config ?? {};
  const defaultSessionsConfig = response.result?.default ?? {};

  const projectLegacySessionsConfig: NonNullable<
    ProjectConfigSection["sessions"]
  >["legacyConfig"] = {
    cpuRequest: safeParseInt(projectSessionsConfig["interactive.cpu_request"]),
    memoryRequest: projectSessionsConfig["interactive.mem_request"],
    storageRequest: projectSessionsConfig["interactive.disk_request"],
    gpuRequest: safeParseInt(projectSessionsConfig["interactive.gpu_request"]),
  };
  const defaultLegacySessionsConfig: NonNullable<
    ProjectConfigSection["sessions"]
  >["legacyConfig"] = {
    cpuRequest: safeParseInt(defaultSessionsConfig["interactive.cpu_request"]),
    memoryRequest: defaultSessionsConfig["interactive.mem_request"],
    storageRequest: defaultSessionsConfig["interactive.disk_request"],
    gpuRequest: safeParseInt(defaultSessionsConfig["interactive.gpu_request"]),
  };

  return {
    config: {
      sessions: {
        defaultUrl: projectSessionsConfig["interactive.default_url"],
        sessionClass: safeParseInt(
          projectSessionsConfig["interactive.session_class"]
        ),
        storage: safeParseInt(
          projectSessionsConfig["interactive.disk_request"]
        ),
        lfsAutoFetch:
          projectSessionsConfig["interactive.lfs_auto_fetch"]
            ?.trim()
            .toLowerCase() === "true",
        dockerImage: projectSessionsConfig["interactive.image"],
        legacyConfig: projectLegacySessionsConfig,
      },
    },
    default: {
      sessions: {
        defaultUrl: defaultSessionsConfig["interactive.default_url"],
        sessionClass: safeParseInt(
          defaultSessionsConfig["interactive.session_class"]
        ),
        storage: safeParseInt(
          defaultSessionsConfig["interactive.disk_request"]
        ),
        legacyConfig: defaultLegacySessionsConfig,
      },
    },
    rawResponse: response.result ?? {},
  };
};

const safeParseInt = (str: string | undefined): number | undefined => {
  const parsed = parseInt(str ?? "", 10);
  if (isNaN(parsed)) return undefined;
  return parsed;
};
