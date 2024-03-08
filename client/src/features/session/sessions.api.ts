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
import { convertCloudStorageForSessionApi } from "./sessions.api.utils";
import {
  DockerImage,
  GetDockerImageParams,
  GetSessionsRawResponse,
  PatchSessionParams,
  ServerOption,
  ServerOptions,
  ServerOptionsResponse,
  Session,
  Sessions,
  StartSessionParams,
} from "./sessions.types";

interface StopSessionArgs {
  serverName: string;
}

interface GetLogsArgs {
  serverName: string;
  lines: number;
}

const sessionsApi = createApi({
  reducerPath: "sessionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/notebooks/" }),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    getDockerImage: builder.query<DockerImage, GetDockerImageParams>({
      query: ({ image }) => ({
        url: `images`,
        params: { image_url: image },
        validateStatus: (response) => {
          return response.status < 400 || response.status == 404;
        },
      }),
      transformResponse: (_value, meta, { image }) => {
        if (meta?.response?.status == 404) {
          return { image, available: false };
        }
        return { image, available: true };
      },
    }),
    getSessions: builder.query<Sessions, void>({
      query: () => ({ url: "servers" }),
      transformResponse: ({ servers }: GetSessionsRawResponse) => servers,
      providesTags: (result) =>
        result
          ? [
              ...Object.keys(result).map(
                (sessionName) =>
                  ({
                    id: sessionName,
                    type: "Session",
                  } as const)
              ),
              "Session",
            ]
          : ["Session"],
    }),
    invalidateSessions: builder.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["Session"],
    }),
    serverOptions: builder.query<ServerOptions, void>({
      query: () => ({
        url: "server_options",
      }),
      transformResponse: ({
        default_url,
        ...legacyOptionsResponse
      }: ServerOptionsResponse) => {
        const legacyOptions: { [k: string]: ServerOption } = {};
        Object.keys(legacyOptionsResponse).forEach((k) => {
          legacyOptions[k] = {
            ...legacyOptionsResponse[k],
            displayName: legacyOptionsResponse[k].display_name,
          } as ServerOption;
        });
        return {
          defaultUrl: {
            ...default_url,
            displayName: default_url.display_name,
          } as ServerOption<string>,
          legacyOptions,
        };
      },
    }),
    stopSession: builder.mutation<boolean, StopSessionArgs>({
      query: (args) => ({
        method: "DELETE",
        url: `servers/${args.serverName}`,
      }),
      invalidatesTags: ["Session"],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLogs: builder.query<any, GetLogsArgs>({
      query: (args) => {
        return {
          url: `logs/${args.serverName}`,
          params: { max_lines: args.lines },
        };
      },
      keepUnusedDataFor: 0,
    }),
    startSession: builder.mutation<Session, StartSessionParams>({
      query: ({
        branch,
        cloudStorage,
        commit,
        defaultUrl,
        environmentVariables,
        image,
        lfsAutoFetch,
        namespace,
        project,
        sessionClass,
        storage,
      }) => {
        const cloudstorage = cloudStorage
          .map(convertCloudStorageForSessionApi)
          .flatMap((item) => (item == null ? [] : [item]));
        const body = {
          branch,
          ...(cloudstorage.length > 0 ? { cloudstorage } : {}),
          commit_sha: commit,
          default_url: defaultUrl,
          environment_variables: environmentVariables,
          ...(image ? { image } : {}),
          lfs_auto_fetch: lfsAutoFetch,
          namespace,
          project,
          resource_class_id: sessionClass,
          storage,
        };
        return {
          body,
          method: "POST",
          url: "servers",
        };
      },
      invalidatesTags: ["Session"],
    }),
    patchSession: builder.mutation<null, PatchSessionParams>({
      query: ({ sessionName, state, sessionClass }) => ({
        method: "PATCH",
        url: `servers/${sessionName}`,
        body: {
          ...(state ? { state } : {}),
          ...(sessionClass ? { resource_class_id: sessionClass } : {}),
        },
      }),
      transformResponse: () => null,
      invalidatesTags: (_result, _error, { sessionName }) => [
        { id: sessionName, type: "Session" },
      ],
    }),
  }),
});

export default sessionsApi;
export const {
  useGetDockerImageQuery,
  useGetSessionsQuery,
  useServerOptionsQuery,
  useStopSessionMutation,
  useGetLogsQuery,
  useStartSessionMutation,
  usePatchSessionMutation,
} = sessionsApi;
