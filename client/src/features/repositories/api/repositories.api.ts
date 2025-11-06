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
  GetRepositoryApiResponse,
  repositoriesGeneratedApi,
} from "./repositories.generated-api";

export type RepositoryInterrupts = {
  interruptAlways: boolean;
  interruptOwner: boolean;
};

export type RepositoriesApiResponseWithInterrupts = GetRepositoryApiResponse &
  RepositoryInterrupts & {
    error: boolean;
    url: string;
  };

const withResponseRewrite = repositoriesGeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getRepositoriesArray: build.query<
      RepositoriesApiResponseWithInterrupts[],
      string[]
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const result: RepositoriesApiResponseWithInterrupts[] = [];
        const promises = queryArg.map((repository) =>
          fetchWithBQ({
            url: "/repository",
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
              response.data as GetRepositoryApiResponse
            );
            result.push({
              ...(response.data as GetRepositoryApiResponse),
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
  addTagTypes: ["Repository"],
  endpoints: {
    getRepository: {
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
  },
});

export { withTagHandling as repositoriesApi };
export const { useGetRepositoriesArrayQuery, useGetRepositoryQuery } =
  withTagHandling;
export type * from "./repositories.generated-api";
