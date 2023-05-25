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

const KNOWN_CONFIG_KEYS = [
  "interactive.default_url",
  "interactive.session_class",
  "interactive.lfs_auto_fetch",
  "interactive.disk_request",
  "interactive.cpu_request",
  "interactive.mem_request",
  "interactive.gpu_request",
  "interactive.image",
] as const;

type GetConfigRawResponseSectionKey = (typeof KNOWN_CONFIG_KEYS)[number];

type GetConfigRawResponseSection = {
  // eslint-disable-next-line no-unused-vars
  [Key in GetConfigRawResponseSectionKey]?: string;
};

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
    [key: string]: string | null;
  };
}

interface UpdateConfigRawResponse {
  result?: {
    config?: { [key: string]: string | null };
    remote_branch?: string;
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
      query: ({ projectRepositoryUrl, versionUrl }) => {
        const params = {
          git_url: projectRepositoryUrl,
          // Branch option not working currently
          // ...(branch ? { branch } : {}),
        };
        return {
          url: versionedUrlEndpoint("config.show", versionUrl),
          params,
          validateStatus: (response, body) =>
            response.status >= 200 && response.status < 300 && !body.error,
        };
      },
      transformResponse: (response: GetConfigRawResponse) =>
        transformGetConfigRawResponse(response),
      transformErrorResponse: (error) => transformRenkuCoreErrorResponse(error),
      providesTags: (_result, _error, arg) => [
        { type: "ProjectConfig", id: arg.projectRepositoryUrl },
      ],
    }),
    updateConfig: builder.mutation<UpdateConfigResponse, UpdateConfigParams>({
      query: ({ projectRepositoryUrl, versionUrl, update }) => {
        const body = {
          git_url: projectRepositoryUrl,
          // Branch option not working currently
          // ...(branch ? { branch } : {}),
          config: update,
        };
        return {
          url: versionedUrlEndpoint("config.set", versionUrl),
          method: "POST",
          body,
          validateStatus: (response, body) =>
            response.status >= 200 && response.status < 300 && !body.error,
        };
      },
      transformResponse: ({ result }: UpdateConfigRawResponse) => {
        return {
          branch: result?.remote_branch ?? "",
          update: result?.config ?? {},
        };
      },
      transformErrorResponse: (error) => transformRenkuCoreErrorResponse(error),
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

  const projectUnknownSessionsConfig = Object.keys(projectSessionsConfig)
    .filter((key) => key.startsWith(`${SESSION_CONFIG_PREFIX}.`))
    .filter((key) => !(KNOWN_CONFIG_KEYS as readonly string[]).includes(key))
    .reduce(
      (obj, key) => ({ ...obj, [key]: (projectSessionsConfig as any)[key] }),
      {}
    );

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
        unknownConfig: projectUnknownSessionsConfig,
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

const SESSION_CONFIG_PREFIX = "interactive";

const transformRenkuCoreErrorResponse = (
  error: FetchBaseQueryError
): FetchBaseQueryError => {
  const data = error.data as any;
  if (!data.error || !data.error.code) {
    return error;
  }
  return {
    status: "CUSTOM_ERROR",
    error: "renku-core error",
    data: data.error,
  };
};
