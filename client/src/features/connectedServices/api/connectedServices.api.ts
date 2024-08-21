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

import { connectedServicesGeneratedApi } from "./connectedServices.generated-api";

export const connectedServicesApi =
  connectedServicesGeneratedApi.enhanceEndpoints({
    addTagTypes: ["Provider", "Connection", "ConnectedAccount"],
    endpoints: {
      getOauth2Providers: {
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({ type: "Provider" as const, id })),
                "Provider",
              ]
            : ["Provider"],
      },
      getOauth2Connections: {
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({
                  type: "Connection" as const,
                  id,
                })),
                "Connection",
              ]
            : ["Connection"],
      },
      getOauth2ConnectionsByConnectionIdAccount: {
        providesTags: (result, _error, { connectionId }) =>
          result
            ? [
                {
                  type: "ConnectedAccount" as const,
                  id: `${connectionId}-${result.username}`,
                },
              ]
            : [],
      },
    },
  });

export const {
  useGetOauth2ProvidersQuery,
  usePostOauth2ProvidersMutation,
  useGetOauth2ProvidersByProviderIdQuery,
  usePatchOauth2ProvidersByProviderIdMutation,
  useDeleteOauth2ProvidersByProviderIdMutation,
  useGetOauth2ProvidersByProviderIdAuthorizeQuery,
  useGetOauth2ConnectionsQuery,
  useGetOauth2ConnectionsByConnectionIdQuery,
  useGetOauth2ConnectionsByConnectionIdAccountQuery,
  useGetOauth2ConnectionsByConnectionIdInstallationsQuery,
} = connectedServicesApi;
export type * from "./connectedServices.generated-api";
