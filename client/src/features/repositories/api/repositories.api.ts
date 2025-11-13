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

import { shouldInterrupt } from "~/features/ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import {
  GetRepositoriesApiResponse,
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

export type RepositoryInterrupts = {
  interruptAlways: boolean;
  interruptOwner: boolean;
};

export type RepositoriesApiResponseWithInterrupts = GetRepositoriesApiResponse &
  RepositoryInterrupts & {
    error: boolean;
    url: string;
  };

// TODO: we can drop the probes and use the new metadata in getRepositoriesByRepositoryUrl instead
const withResponseRewrite = repositoriesGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
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
    getRepositoriesArray: build.query<
      RepositoriesApiResponseWithInterrupts[],
      string[]
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const result: RepositoriesApiResponseWithInterrupts[] = [];
        const promises = queryArg.map((repository) =>
          fetchWithBQ({
            url: "/repositories",
            params: { url: repository },
          })
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < queryArg.length; i++) {
          const repositoryUrl = queryArg[i];
          const response = responses[i];
          if (response.error)
            result.push({
              error: true,
              interruptAlways: true,
              interruptOwner: true,
              status: "unknown",
              url: repositoryUrl,
            });
          else if (response.data) {
            const interrupts = shouldInterrupt(
              response.data as GetRepositoriesApiResponse
            );
            result.push({
              ...(response.data as GetRepositoriesApiResponse),
              ...interrupts,
              error: false,
              url: repositoryUrl,
            });
          }
        }

        return { data: result };
      },
    }),
  }),
});

const withTagHandling = withResponseRewrite.enhanceEndpoints({
  addTagTypes: ["Repository", "RepositoryProbe"],
  endpoints: {
    getRepositories: {
      providesTags: (result, _error, { url }) =>
        result ? [{ type: "Repository" as const, id: url }] : [],
    },
    getRepositoriesArray: {
      providesTags: (result) =>
        result != null
          ? result.map(({ url }) => ({
              type: "Repository" as const,
              id: url,
            }))
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
  useGetRepositoriesArrayQuery,
  useGetRepositoriesProbesQuery,
  useGetRepositoriesQuery,
} = withTagHandling;
export type * from "./repositories.generated-api";
