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
  ProviderList,
  ConnectionList,
  ConnectedAccount,
  GetConnectedAccountParams,
} from "./connectedServices.types";

const connectedServicesApi = createApi({
  reducerPath: "connectedServicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/oauth2",
  }),
  tagTypes: [
    "Provider",
    "Connection",
    "ConnectedAccount",
    "Repository",
    "RepositoryProbe",
  ],
  endpoints: (builder) => ({
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
  }),
});

export default connectedServicesApi;
export const {
  useGetConnectedAccountQuery,
  useGetConnectionsQuery,
  useGetProvidersQuery,
} = connectedServicesApi;
