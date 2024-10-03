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
  ConnectedAccount,
  ConnectionList,
  CreateProviderParams,
  GetConnectedAccountParams,
  Provider,
  ProviderList,
  UpdateProviderParams,
} from "./api/connectedServices.types";

const connectedServicesApi = createApi({
  reducerPath: "connectedServicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/oauth2",
  }),
  tagTypes: ["Provider", "Connection", "ConnectedAccount"],
  endpoints: (builder) => ({
    createProvider: builder.mutation<Provider, CreateProviderParams>({
      query: ({
        id,
        kind,
        client_id,
        client_secret,
        display_name,
        scope,
        url,
        use_pkce,
      }) => {
        return {
          url: "providers",
          method: "POST",
          body: {
            id,
            kind,
            client_id,
            ...(client_secret && { client_secret }),
            display_name,
            scope: scope || "",
            url,
            use_pkce,
          },
        };
      },
      invalidatesTags: ["Provider"],
    }),
    deleteProvider: builder.mutation<void, string>({
      query: (providerId) => {
        return {
          url: `providers/${providerId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Provider"],
    }),
    getProviders: builder.query<ProviderList, void>({
      query: () => {
        return {
          url: "providers",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Provider" as const, id })),
              "Provider",
            ]
          : ["Provider"],
    }),
    getConnections: builder.query<ConnectionList, void>({
      query: () => {
        return {
          url: "connections",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Connection" as const, id })),
              "Connection",
            ]
          : ["Connection"],
    }),
    getConnectedAccount: builder.query<
      ConnectedAccount,
      GetConnectedAccountParams
    >({
      query: ({ connectionId }) => {
        return {
          url: `connections/${connectionId}/account`,
        };
      },
      providesTags: (result, _error, { connectionId }) =>
        result
          ? [
              {
                type: "ConnectedAccount" as const,
                id: `${connectionId}-${result.username}`,
              },
            ]
          : [],
    }),
    updateProvider: builder.mutation<Provider, UpdateProviderParams>({
      query: ({ id, ...params }) => {
        return {
          url: `providers/${id}`,
          method: "PATCH",
          body: params,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ id, type: "Provider" }],
    }),
  }),
});

export default connectedServicesApi;
export const {
  useCreateProviderMutation,
  useDeleteProviderMutation,
  useGetConnectedAccountQuery,
  useGetConnectionsQuery,
  useGetProvidersQuery,
  useUpdateProviderMutation,
} = connectedServicesApi;
