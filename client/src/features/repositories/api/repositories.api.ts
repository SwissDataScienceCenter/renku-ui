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
  repositoriesGeneratedApi,
  type GetRepositoryApiResponse,
  type GetRepositoryPermissionsApiArg,
  type GetRepositoryPermissionsApiResponse,
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

export type GetRepositoriesApiResponse = {
  data?: GetRepositoryApiResponse;
  error: boolean;
  url: string;
};

export type GetRepositoriesWithPermissionsApiResponse = {
  data?: GetRepositoryApiResponse & GetRepositoryPermissionsApiResponse;
  error: boolean;
  url: string;
};

// Fixes some API endpoints
const withFixedEndpoints = repositoriesGeneratedApi.injectEndpoints({
  endpoints: (build) => ({
    getRepositoryPermissions: build.query<
      GetRepositoryPermissionsApiResponse,
      GetRepositoryPermissionsApiArg
    >({
      query: ({ repositoryPermissionsParams }) => ({
        url: `/repository/permissions`,
        params: repositoryPermissionsParams,
      }),
    }),
  }),
  overrideExisting: true,
});

const withResponseRewrite = withFixedEndpoints.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getRepositories: build.query<GetRepositoriesApiResponse[], string[]>({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const result: GetRepositoriesApiResponse[] = [];
        const promises = queryArg.map((repository) =>
          fetchWithBQ({
            url: "/repository",
            params: { url: repository },
          }),
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < queryArg.length; i++) {
          const repositoryUrl = queryArg[i];
          const response = responses[i];
          if (response.error)
            result.push({
              error: true,
              url: repositoryUrl,
            });
          else if (response.data) {
            result.push({
              data: response.data as GetRepositoryApiResponse,
              error: false,
              url: repositoryUrl,
            });
          }
        }

        return { data: result };
      },
    }),
    getRepositoriesWithPermissions: build.query<
      GetRepositoriesWithPermissionsApiResponse[],
      string[]
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const result: GetRepositoriesWithPermissionsApiResponse[] = [];
        const promises = queryArg.map((repository) =>
          fetchWithBQ({
            url: "/repository",
            params: { url: repository },
          }),
        );
        const responses = await Promise.all(promises);
        const permissionsPromises = new Map<
          number,
          ReturnType<typeof fetchWithBQ>
        >();
        for (let i = 0; i < queryArg.length; i++) {
          const repositoryUrl = queryArg[i];
          const response = responses[i];
          if (response.error)
            result.push({
              error: true,
              url: repositoryUrl,
            });
          else if (response.data) {
            if (
              (response.data as GetRepositoryApiResponse).provider?.kind ===
              "github"
            ) {
              permissionsPromises.set(
                i,
                fetchWithBQ({
                  url: "/repository/permissions",
                  params: { url: repositoryUrl },
                }),
              );
            }
            result.push({
              data: response.data as GetRepositoryApiResponse,
              error: false,
              url: repositoryUrl,
            });
          }
        }

        await Promise.all(permissionsPromises.values());
        for (let i = 0; i < queryArg.length; i++) {
          const promise = permissionsPromises.get(i);
          if (promise == null) {
            continue;
          }
          const response = await promise;
          if (response.error) {
            result[i].error = true;
          } else if (response.data) {
            result[i].data = {
              ...(response.data as GetRepositoryPermissionsApiResponse),
              ...(result[i].data as GetRepositoryApiResponse),
            };
          }
        }

        return { data: result };
      },
    }),
  }),
});

const withTagHandling = withResponseRewrite.enhanceEndpoints({
  addTagTypes: ["Repository", "RepositoryPermissions"],
  endpoints: {
    getRepository: {
      providesTags: (result, _error, { url }) =>
        result
          ? [{ type: "Repository" as const, id: url }, "Repository"]
          : ["Repository"],
    },
    getRepositories: {
      providesTags: (result) =>
        result != null
          ? [
              ...result.map(({ url }) => ({
                type: "Repository" as const,
                id: url,
              })),
              "Repository",
            ]
          : ["Repository"],
    },
    getRepositoryPermissions: {
      providesTags: (
        result,
        _error,
        { repositoryPermissionsParams: { url } },
      ) =>
        result
          ? [
              { type: "RepositoryPermissions", id: url },
              "RepositoryPermissions",
            ]
          : ["RepositoryPermissions"],
    },
  },
});

export { withTagHandling as repositoriesApi };
export const {
  useGetRepositoriesQuery,
  useGetRepositoryQuery,
  useGetRepositoryPermissionsQuery,
  useGetRepositoriesWithPermissionsQuery,
} = withTagHandling;
export type * from "./repositories.generated-api";
