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

import processPaginationHeaders from "../../../utils/helpers/pagination.utils";
import {
  connectedServicesGeneratedApi,
  GetOauth2ConnectionsByConnectionIdInstallationsApiArg,
  GetOauth2ConnectionsByConnectionIdInstallationsApiResponse,
} from "./connectedServices.generated-api";
import type {
  AppInstallationsPaginated,
  Pagination,
} from "./connectedServices.types";

const enhanced = connectedServicesGeneratedApi.enhanceEndpoints({
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

export const connectedServicesApi = enhanced.injectEndpoints({
  endpoints: (build) => ({
    getOauth2ConnectionsByConnectionIdInstallations: build.query<
      AppInstallationsPaginated,
      GetOauth2ConnectionsByConnectionIdInstallationsApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/connections/${queryArg.connectionId}/installations`,
        params: {
          page: queryArg.params?.page,
          per_page: queryArg.params?.per_page,
        },
      }),
      transformResponse: (
        data: GetOauth2ConnectionsByConnectionIdInstallationsApiResponse,
        meta
      ) => {
        const headers = meta?.response?.headers;
        const pagination_ = processPaginationHeaders(headers);
        const pagination: Pagination = {
          ...pagination_,
          currentPage: pagination_.currentPage ?? 1,
          perPage: pagination_.perPage ?? 20,
          totalItems: pagination_.totalItems ?? 0,
          totalPages: pagination_.totalPages ?? 1,
        };
        return {
          data,
          pagination,
        };
      },
    }),
  }),
  overrideExisting: true,
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
