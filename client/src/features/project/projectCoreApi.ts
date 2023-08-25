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
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { RootStateOrAny } from "react-redux";

import type {
  GetDatasetFilesParams,
  GetDatasetFilesResponse,
  IDatasetFiles,
  MigrationStartBody,
  MigrationStartParams,
  MigrationStartResponse,
  MigrationStatus,
  MigrationStatusParams,
  MigrationStatusResponse,
  ProjectConfig,
  ProjectConfigSection,
  UpdateDescriptionParams,
  UpdateDescriptionResponse,
} from "./Project";
import { MigrationStartScopes } from "./projectEnums";
import { projectKgApi } from "./projectKgApi";
import { projectsKgApi } from "../projects/projectsKgApi";
import {
  CoreApiVersionedUrlHelper,
  getCoreVersionedUrl,
} from "../../utils/helpers/url/versionedUrls";
import { CoreVersionUrl } from "../../utils/types/coreService.types";

interface GetConfigParams extends CoreVersionUrl {
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

// Expected seconds of delay before the KG is aware of the latest changes.
// TODO: this won't be useful anymore once we get status updates though WebSockets.
const KG_STATUS_DELAY = 5;

const KNOWN_CONFIG_KEYS = [
  "interactive.default_url",
  "interactive.lfs_auto_fetch",
  "interactive.disk_request",
  "interactive.cpu_request",
  "interactive.mem_request",
  "interactive.gpu_request",
  "interactive.image",
] as const;

type GetConfigRawResponseSectionKey = (typeof KNOWN_CONFIG_KEYS)[number];

type GetConfigRawResponseSection = {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function urlWithQueryParams(url: string, queryParams: any) {
  const query = new URLSearchParams(queryParams).toString();
  return `${url}?${query}`;
}

const rawBaseQuery = fetchBaseQuery({ baseUrl: "/ui-server/api/renku" });

interface CoreServiceFetchArgs extends FetchArgs {
  apiVersion?: string;
  metadataVersion?: string;
}

const dynamicBaseQuery: BaseQueryFn<
  CoreServiceFetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // const coreApiVersion = (api.getState() as RootStateOrAny).coreApiVersion as
  //   | string
  //   | undefined;
  const overrideCoreApiVersion = args.apiVersion;
  // const helper = new CoreApiVersionedUrlHelper({
  //   coreApiVersion: coreApiVersion ?? "/",
  // });

  const endpoint = args.url;
  const metadataVersion = args.metadataVersion;
  // const adjustedUrl = helper.urlForEndpoint(
  //   endpoint,
  //   metadataVersion,
  //   overrideCoreApiVersion
  // );

  const adjustedUrl = getCoreVersionedUrl({
    endpoint,
    metadataVersion,
    apiVersionOverride: overrideCoreApiVersion,
    // TODO: provide the following two arguments from the App context or the Redux store
    // coreApiVersion: null,
    // overrides: null,
  });
  const adjustedArgs = { ...args, url: adjustedUrl };
  // provide the amended url and other params to the raw base query
  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

export const projectCoreApi = createApi({
  reducerPath: "projectCore",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["project", "project-status", "ProjectConfig"],
  keepUnusedDataFor: 10,
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
          url: urlWithQueryParams("datasets.files_list", queryParams),
          metadataVersion: params.versionUrl,
          method: "GET",
          headers: new Headers(headers),
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
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
    getMigrationStatus: builder.query<MigrationStatus, MigrationStatusParams>({
      query: (migrationParams) => {
        const params: { git_url: string; branch?: string } = {
          git_url: migrationParams.gitUrl,
        };
        if (migrationParams.branch) params.branch = migrationParams.branch;
        return {
          url: getCoreVersionedUrl({ endpoint: "/cache.migrations_check" }), // ? migrations always uses the last renku version
          params,
        };
      },
      providesTags: (result, error, migrationParams) => [
        { type: "project-status", id: migrationParams.gitUrl },
      ],
      transformResponse: (response: MigrationStatusResponse) => {
        const transformedResponse: MigrationStatus = {
          errorProject: false,
          errorTemplate: false,
        };
        if (response.error) {
          transformedResponse.errorProject = true;
          transformedResponse.errorTemplate = true;
          transformedResponse.error = response.error;
        } else if (
          response.result?.core_compatibility_status?.type === "error"
        ) {
          transformedResponse.errorProject = true;
          transformedResponse.details = response.result;
          transformedResponse.error =
            response.result?.core_compatibility_status;
        } else if (response.result?.dockerfile_renku_status?.type === "error") {
          transformedResponse.errorProject = true;
          transformedResponse.details = response.result;
          transformedResponse.error = response.result?.dockerfile_renku_status;
        } else if (response.result?.template_status?.type === "error") {
          transformedResponse.errorTemplate = true;
          transformedResponse.details = response.result;
          transformedResponse.error = response.result?.template_status;
        } else {
          transformedResponse.details = response.result;
        }
        return transformedResponse;
      },
      transformErrorResponse: (errorData) => {
        return {
          errorProject: true,
          errorTemplate: true,
          error: {
            code: errorData.status,
            userMessage: `Unknown ${errorData.status}  error`,
            developerMessage: `Unknown ${errorData.status}  error`,
          },
        };
      },
    }),
    startMigration: builder.mutation<
      MigrationStartResponse,
      MigrationStartParams
    >({
      query: (data) => {
        const options = {
          force_template_update: false,
          skip_docker_update: false,
          skip_migrations: false,
          skip_template_update: false,
        };
        if (data.scope === MigrationStartScopes.OnlyTemplate) {
          options.force_template_update = true;
          options.skip_docker_update = true;
          options.skip_migrations = true;
        } else if (data.scope === MigrationStartScopes.OnlyVersion) {
          options.skip_template_update = true;
        } else {
          options.force_template_update = true;
        }
        const body: MigrationStartBody = {
          git_url: data.gitUrl,
          ...options,
        };
        if (data.branch) body.branch = data.branch;
        return {
          body,
          method: "POST",
          url: getCoreVersionedUrl({ endpoint: "/cache.migrate" }), // ? migrations always uses the last renku version
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
        };
      },
      invalidatesTags: (result, error, migrationParams) => [
        { type: "project-status", id: migrationParams.gitUrl },
      ],
    }),
    getConfig: builder.query<ProjectConfig, GetConfigParams>({
      query: ({ branch, projectRepositoryUrl, versionUrl }) => {
        const params = {
          git_url: projectRepositoryUrl,
          ...(branch ? { branch } : {}),
        };
        return {
          url: getCoreVersionedUrl({
            endpoint: "config.show",
            metadataVersion: versionUrl,
          }),
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
      query: ({ branch, projectRepositoryUrl, versionUrl, update }) => {
        const body = {
          git_url: projectRepositoryUrl,
          ...(branch ? { branch } : {}),
          config: update,
        };
        return {
          url: getCoreVersionedUrl({
            endpoint: "config.set",
            metadataVersion: versionUrl,
          }),
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
    updateDescription: builder.mutation<
      UpdateDescriptionResponse,
      UpdateDescriptionParams
    >({
      query: (data) => {
        return {
          body: { description: data.description, git_url: data.gitUrl },
          method: "POST",
          url: `/project.edit`,
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
        };
      },
      // ? Invalidating immediatley won't work since KG needs a moment to pick up the change.
      onCacheEntryAdded: (params, { dispatch, cacheDataLoaded }) => {
        cacheDataLoaded.then(() => {
          // ? Wait until (hopefully) KG has picked the event from GitLab -invalidate the related tags.
          setTimeout(() => {
            dispatch(
              projectKgApi.util.invalidateTags([
                { type: "project-indexing", id: params.projectId },
              ])
            );
            // ? invalidate also metadata in the unlikely case the change is quicker than the timeout.
            dispatch(
              projectsKgApi.util.invalidateTags([
                { type: "project-kg-metadata", id: params.projectId },
              ])
            );
          }, KG_STATUS_DELAY * 1000);
        });
      },
      transformErrorResponse: (error) => transformRenkuCoreErrorResponse(error),
    }),
  }),
});

export const {
  useGetDatasetFilesQuery,
  useGetMigrationStatusQuery,
  useStartMigrationMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useUpdateDescriptionMutation,
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
    cpuRequest: safeParseFloat(
      projectSessionsConfig["interactive.cpu_request"]
    ),
    memoryRequest: safeParseInt(
      projectSessionsConfig["interactive.mem_request"]
    ),
    gpuRequest: safeParseInt(projectSessionsConfig["interactive.gpu_request"]),
  };
  const defaultLegacySessionsConfig: NonNullable<
    ProjectConfigSection["sessions"]
  >["legacyConfig"] = {
    cpuRequest: safeParseFloat(
      defaultSessionsConfig["interactive.cpu_request"]
    ),
    memoryRequest: safeParseInt(
      defaultSessionsConfig["interactive.mem_request"]
    ),
    gpuRequest: safeParseInt(defaultSessionsConfig["interactive.gpu_request"]),
  };

  const projectUnknownSessionsConfig = Object.keys(projectSessionsConfig)
    .filter((key) => key.startsWith(`${SESSION_CONFIG_PREFIX}.`))
    .filter((key) => !(KNOWN_CONFIG_KEYS as readonly string[]).includes(key))
    .reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj, key) => ({ ...obj, [key]: (projectSessionsConfig as any)[key] }),
      {}
    );

  return {
    config: {
      sessions: {
        defaultUrl: projectSessionsConfig["interactive.default_url"],
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

const safeParseFloat = (str: string | undefined): number | undefined => {
  const parsed = parseFloat(str ?? "");
  if (isNaN(parsed)) return undefined;
  return parsed;
};

const SESSION_CONFIG_PREFIX = "interactive";

const transformRenkuCoreErrorResponse = (
  error: FetchBaseQueryError
): FetchBaseQueryError => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
