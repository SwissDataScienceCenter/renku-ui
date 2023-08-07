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
  GetRegistryTagParams,
  GetRenkuRegistryParams,
  Registry,
  RegistryTag,
} from "./registry.types";

const registryApi = createApi({
  reducerPath: "registry",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Registry", "RegistryTag"],
  endpoints: (builder) => ({
    getRegistryTag: builder.query<RegistryTag, GetRegistryTagParams>({
      query: ({ projectId, registryId, tag }) => ({
        url: `${projectId}/registry/repositories/${registryId}/tags/${tag}`,
      }),
      providesTags: (result, _error, { tag }) =>
        result ? [{ type: "RegistryTag", id: tag }] : [],
    }),
    getRenkuRegistry: builder.query<Registry, GetRenkuRegistryParams>({
      queryFn: async (
        { projectId },
        _queryApi,
        _extraOptions,
        fetchBaseQuery
      ) => {
        const url = `${projectId}/registry/repositories`;

        const result = await fetchBaseQuery({ url });

        if (result.error) {
          return result;
        }

        const registries = result.data as Registry[];
        if (registries.length == 0) {
          return {
            error: {
              error: "This project does not have any Docker image repository",
              status: "CUSTOM_ERROR",
            },
          };
        }

        if (registries.length == 1) {
          return { ...result, data: registries[0] };
        }

        // The CI we define has no name
        // ! This is not totally reliable since users can change it. We should probably give it a Renku name
        const renkuRegistry = registries.find(({ name }) => name === "");
        if (renkuRegistry != null) {
          return { ...result, data: renkuRegistry };
        }

        return {
          error: {
            error:
              "The project has multiple Docker image repositories. We can't identify the correct one",
            status: "CUSTOM_ERROR",
          },
        };
      },
      providesTags: (result) =>
        result ? [{ type: "Registry", id: result.id }] : [],
    }),
  }),
});

export default registryApi;
export const { useGetRegistryTagQuery, useGetRenkuRegistryQuery } = registryApi;
