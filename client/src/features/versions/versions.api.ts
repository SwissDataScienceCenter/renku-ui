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
  CoreVersionDetails,
  CoreVersionResponse,
  CoreVersions,
  DataServicesVersion,
  DataServicesVersionResponse,
  KgVersion,
  KgVersionResponse,
  NotebooksVersion,
  NotebooksVersionResponse,
} from "./versions.types";

export const versionsApi = createApi({
  reducerPath: "versionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/" }),
  tagTypes: ["Version"],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getCoreVersions: builder.query<CoreVersions, void>({
      query: () => ({
        url: "renku/versions",
        validateStatus: (response, body) => {
          return response.status < 400 && !body.error?.code;
        },
      }),
      transformResponse: (response: CoreVersionResponse) => {
        if (response.error) throw new Error(response.error.userMessage);
        const content = response.result as CoreVersionDetails;

        const data: CoreVersions = {
          name: content.name,
          coreVersions: [],
          metadataVersions: [],
          details: content.versions,
        };
        data.name = content.name;
        if (content.versions?.length >= 1) {
          for (const coreVersionObject of content.versions) {
            const metadataVersion = parseInt(
              coreVersionObject.data.metadata_version
            );
            if (metadataVersion) {
              const coreVersionString = coreVersionObject.version;
              if (!data.metadataVersions.includes(metadataVersion))
                data.metadataVersions.push(metadataVersion);
              if (!data.coreVersions.includes(coreVersionString))
                data.coreVersions.push(coreVersionString);
            }
          }
        }
        return data;
      },
      transformErrorResponse: () => {
        return {
          name: "error",
          coreVersions: [],
          metadataVersions: [],
        } as CoreVersions;
      },
      providesTags: (result) =>
        result ? [{ type: "Version", id: "core" }] : [],
    }),
    getDataServicesVersion: builder.query<DataServicesVersion, void>({
      query: () => {
        return { url: "data/version" };
      },
      transformResponse: (response: DataServicesVersionResponse) => {
        const version = response.version.startsWith("v")
          ? response.version
          : `v${response.version}`;
        return {
          name: "data-services",
          version,
        };
      },
      transformErrorResponse: () => {
        return {
          name: "error",
          version: "unavailable",
        } as DataServicesVersion;
      },
      providesTags: (result) =>
        result ? [{ type: "Version", id: "data-services" }] : [],
    }),
    getKgVersion: builder.query<KgVersion, void>({
      query: () => {
        return { url: "kg/version" };
      },
      transformResponse: (response: KgVersionResponse) => {
        // We assume there is only one version.
        const singleVersion = response.versions.at(0);
        if (singleVersion == null) {
          throw new Error("Unexpected response");
        }
        return {
          name: response.name,
          version: singleVersion.version,
        };
      },
      transformErrorResponse: () => {
        return {
          name: "error",
          version: "unavailable",
        } as KgVersion;
      },
      providesTags: (result) =>
        result ? [{ type: "Version", id: "knowledge-graph" }] : [],
    }),
    getNotebooksVersion: builder.query<NotebooksVersion, void>({
      query: () => {
        return {
          url: "notebooks/version",
        };
      },
      transformResponse: (response: NotebooksVersionResponse) => {
        // We assume there is only one renku-notebooks service version.
        if (response.versions?.length < 1)
          throw new Error("Unexpected response");
        const singleVersion = response.versions[0];

        return {
          name: response.name,
          version: singleVersion?.version ?? "unavailable",
          anonymousSessionsEnabled:
            singleVersion?.data?.anonymousSessionsEnabled ?? false,
          sshEnabled: singleVersion?.data?.sshEnabled ?? false,
          cloudStorageEnabled:
            singleVersion?.data?.cloudstorageEnabled ?? false,
          registeredUsersIdleThreshold:
            singleVersion?.data?.registeredUsersIdleThreshold ?? 86400,
          registeredUsersHibernationThreshold:
            singleVersion?.data?.registeredUsersHibernationThreshold ?? 86400,
          anonymousUsersIdleThreshold:
            singleVersion?.data?.anonymousUsersIdleThreshold ?? 86400,
          anonymousUsersHibernationThreshold:
            singleVersion?.data?.anonymousUsersHibernationThreshold ?? 86400,
        };
      },
      transformErrorResponse: () => {
        return {
          name: "error",
          version: "unavailable",
          anonymousSessionsEnabled: false,
          sshEnabled: false,
          cloudStorageEnabled: false,
          registeredUsersIdleThreshold: 86400,
          registeredUsersHibernationThreshold: 86400,
          anonymousUsersIdleThreshold: 86400,
          anonymousUsersHibernationThreshold: 86400,
        } as NotebooksVersion;
      },
      providesTags: (result) =>
        result ? [{ type: "Version", id: "notebooks" }] : [],
    }),
  }),
});

export const {
  useGetCoreVersionsQuery,
  useGetDataServicesVersionQuery,
  useGetKgVersionQuery,
  useGetNotebooksVersionQuery,
} = versionsApi;
