/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
  GetRepositoriesProbesParams,
  GetRepositoriesProbesResponse,
  GetRepositoryMetadataParams,
  GetRepositoryProbeParams,
  RepositoryProviderMatch,
} from "./repositories.types";

const repositoriesApi = createApi({
  reducerPath: "repositoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/repositories",
  }),
  tagTypes: ["Repository", "RepositoryProbe"],
  endpoints: (builder) => ({
    getRepositoryMetadata: builder.query<
      RepositoryProviderMatch,
      GetRepositoryMetadataParams
    >({
      query: ({ repositoryUrl }) => {
        return {
          url: encodeURIComponent(repositoryUrl),
        };
      },
      providesTags: (result, _error, { repositoryUrl }) =>
        result ? [{ type: "Repository" as const, id: repositoryUrl }] : [],
    }),
    getRepositoryProbe: builder.query<boolean, GetRepositoryProbeParams>({
      query: ({ repositoryUrl }) => {
        return {
          url: `${encodeURIComponent(repositoryUrl)}/probe`,
          validateStatus: (response) => {
            return (
              (response.status >= 200 && response.status < 300) ||
              response.status == 404
            );
          },
        };
      },
      transformResponse(_result, meta) {
        const status = meta?.response?.status;
        return status != null && status >= 200 && status < 300;
      },
      providesTags: (result, _error, { repositoryUrl }) =>
        result != null
          ? [{ type: "RepositoryProbe" as const, id: repositoryUrl }]
          : [],
    }),
    getRepositoriesProbes: builder.query<
      GetRepositoriesProbesResponse,
      GetRepositoriesProbesParams
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { repositoriesUrls } = queryArg;
        const result: GetRepositoriesProbesResponse = { repositories: [] };
        const promises = repositoriesUrls.map((repositoryUrl) =>
          fetchWithBQ({
            url: `${encodeURIComponent(repositoryUrl)}/probe`,
            validateStatus: (response) => {
              return (
                (response.status >= 200 && response.status < 300) ||
                response.status == 404
              );
            },
          })
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < repositoriesUrls.length; i++) {
          const repositoryUrl = repositoriesUrls[i];
          const response = responses[i];
          if (response.error) return response;
          const status = response.meta?.response?.status;
          const probe = status != null && status >= 200 && status < 300;
          result.repositories.push({
            repositoryUrl,
            probe,
          });
        }

        return { data: result };
      },
      providesTags: (result) =>
        result != null
          ? result.repositories.map(({ repositoryUrl }) => ({
              type: "RepositoryProbe" as const,
              id: repositoryUrl,
            }))
          : [],
    }),
  }),
});

export default repositoriesApi;
export const {
  useGetRepositoryMetadataQuery,
  useGetRepositoryProbeQuery,
  useGetRepositoriesProbesQuery,
} = repositoriesApi;
