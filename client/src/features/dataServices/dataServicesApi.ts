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
import { ResourcePool, ResourcePoolsQueryParams } from "./dataServices.types";

export const dataServicesApi = createApi({
  reducerPath: "dataServices",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data",
  }),
  tagTypes: ["ResourcePool"],
  endpoints: (builder) => ({
    getResourcePools: builder.query<ResourcePool[], ResourcePoolsQueryParams>({
      query: ({ cpuRequest, gpuRequest, memoryRequest, storageRequest }) => {
        const params = {
          ...(cpuRequest ? { cpu: cpuRequest } : {}),
          ...(gpuRequest ? { gpu: gpuRequest } : {}),
          ...(memoryRequest ? { memory: memoryRequest } : {}),
          ...(storageRequest ? { max_storage: storageRequest } : {}),
        };
        return {
          url: "resource_pools",
          params,
        };
      },
      providesTags: ["ResourcePool"],
    }),
  }),
});

export const { useGetResourcePoolsQuery } = dataServicesApi;
