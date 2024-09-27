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

import type {
  GetStorageApiArg,
  GetStorageApiResponse,
  GetStoragesV2ApiArg,
  GetStoragesV2ApiResponse,
} from "./storagesV2.generated-api";
import { storagesV2GeneratedApi } from "./storagesV2.generated-api";

// Fixes the generated code with query param object.
const withFixedEndpoints = storagesV2GeneratedApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStorage: builder.query<GetStorageApiResponse, GetStorageApiArg>({
      query: ({ storageParams }) => ({
        url: `/storage`,
        params: storageParams,
      }),
    }),
    getStoragesV2: builder.query<GetStoragesV2ApiResponse, GetStoragesV2ApiArg>(
      {
        query: ({ storageV2Params }) => ({
          url: `/storages_v2`,
          params: storageV2Params,
        }),
      }
    ),
  }),
});

export const storagesV2Api = withFixedEndpoints.enhanceEndpoints({
  addTagTypes: ["Storages"],
  endpoints: {
    deleteStoragesV2ByStorageId: {
      invalidatesTags: ["Storages"],
    },
    getStoragesV2: {
      providesTags: ["Storages"],
    },
    patchStoragesV2ByStorageId: {
      invalidatesTags: ["Storages"],
    },
    postStoragesV2: {
      invalidatesTags: ["Storages"],
    },
    postStoragesV2ByStorageIdSecrets: {
      invalidatesTags: ["Storages"],
    },
  },
});

export const {
  useGetStoragesV2Query,
  usePostStoragesV2Mutation,
  usePatchStoragesV2ByStorageIdMutation,
  useDeleteStoragesV2ByStorageIdMutation,
  usePostStoragesV2ByStorageIdSecretsMutation,
  useDeleteStoragesV2ByStorageIdSecretsMutation,
} = storagesV2Api;
export type * from "./storagesV2.generated-api";
