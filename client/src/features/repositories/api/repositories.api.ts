/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
  GetRepositoriesByRepositoryUrlProbeApiArg,
  repositoriesGeneratedApi,
} from "./repositories.generated-api";

export interface GetRepositoriesProbesParams {
  repositoriesUrls: string[];
}

export interface RepositoryWithProbe {
  repositoryUrl: string;
  probe: boolean;
}
export type GetRepositoriesProbesResponse = RepositoryWithProbe[];

// TODO: we can drop the probes and use the new metadata in getRepositoriesByRepositoryUrl instead
const withResponseRewrite = repositoriesGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getRepositoriesByRepositoryUrlProbe: build.query<
      boolean,
      GetRepositoriesByRepositoryUrlProbeApiArg
    >({
      query: ({ repositoryUrl }) => ({
        url: `/repositories/${repositoryUrl}/probe`,
        validateStatus: (response) => {
          return (
            (response.status >= 200 && response.status < 300) ||
            response.status == 404
          );
        },
      }),
      transformResponse(_result, meta) {
        const status = meta?.response?.status;
        return status != null && status >= 200 && status < 300;
      },
    }),
    getRepositoriesProbes: build.query<
      GetRepositoriesProbesResponse,
      GetRepositoriesProbesParams
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { repositoriesUrls } = queryArg;
        const result: GetRepositoriesProbesResponse = [];
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
          result.push({
            repositoryUrl,
            probe,
          });
        }

        return { data: result };
      },
    }),
  }),
});

const withTagHandling = withResponseRewrite.enhanceEndpoints({
  addTagTypes: ["Repository", "RepositoryProbe"],
  endpoints: {
    getRepositoriesByRepositoryUrl: {
      providesTags: (result, _error, { repositoryUrl }) =>
        result ? [{ type: "Repository" as const, id: repositoryUrl }] : [],
    },
    getRepositoriesByRepositoryUrlProbe: {
      providesTags: (result, _error, { repositoryUrl }) =>
        result != null
          ? [{ type: "RepositoryProbe" as const, id: repositoryUrl }]
          : [],
    },
    getRepositoriesProbes: {
      providesTags: (result) =>
        result != null
          ? result.map(({ repositoryUrl }) => ({
              type: "RepositoryProbe" as const,
              id: repositoryUrl,
            }))
          : [],
    },
  },
});

export { withTagHandling as repositoriesApi };
export const {
  useGetRepositoriesByRepositoryUrlQuery,
  useGetRepositoriesByRepositoryUrlProbeQuery,
  useGetRepositoriesProbesQuery,
} = withTagHandling;
export type * from "./repositories.generated-api";
