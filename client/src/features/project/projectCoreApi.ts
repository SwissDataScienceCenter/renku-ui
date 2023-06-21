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
} from "./Project.d";
import { MigrationStartScopes } from "./projectEnums";

function versionedUrlEndpoint(endpoint: string, versionUrl?: string) {
  const urlPath = versionUrl ? `${versionUrl}/${endpoint}` : endpoint;
  return `/renku${urlPath}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function urlWithQueryParams(url: string, queryParams: any) {
  const query = new URLSearchParams(queryParams).toString();
  return `${url}?${query}`;
}

export const projectCoreApi = createApi({
  reducerPath: "projectCore",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api" }),
  tagTypes: ["project", "project-status"],
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
          url: urlWithQueryParams(
            versionedUrlEndpoint("datasets.files_list", params.versionUrl),
            queryParams
          ),
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
          url: "/renku/cache.migrations_check", // ? migrations check always invoked on the last renku version
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
          url: `/renku/cache.migrate`,
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
        };
      },
      invalidatesTags: (result, error, migrationParams) => [
        { type: "project-status", id: migrationParams.gitUrl },
      ],
    }),
  }),
});

export const {
  useGetDatasetFilesQuery,
  useGetMigrationStatusQuery,
  useStartMigrationMutation,
} = projectCoreApi;
