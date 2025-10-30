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
  KeycloakUser,
  KeycloakUserQueryParams,
  KeycloakUsersQueryParams,
} from "./adminKeycloak.types";

const adminKeycloakApi = createApi({
  reducerPath: "adminKeycloakApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/kc/admin/realms",
  }),
  tagTypes: ["KeycloakUser"],
  endpoints: (builder) => ({
    getKeycloakUser: builder.query<KeycloakUser, KeycloakUserQueryParams>({
      query: ({ realm, userId }) => {
        return {
          url: `${realm}/users/${userId}`,
        };
      },
      providesTags: (result) =>
        result ? [{ id: `${result.id}`, type: "KeycloakUser" }] : [],
    }),
    getKeycloakUsers: builder.query<KeycloakUser[], KeycloakUsersQueryParams>({
      query: ({ realm, search }) => {
        const params = search ? { search } : undefined;
        return {
          url: `${realm}/users`,
          params,
        };
      },
      providesTags: (result, _error, { search }) =>
        result
          ? [
              ...result.map(
                ({ id }) =>
                  ({
                    id,
                    type: "KeycloakUser",
                  } as const)
              ),
              { id: `LIST-${search}`, type: "KeycloakUser" },
            ]
          : [{ id: `LIST-${search}`, type: "KeycloakUser" }],
    }),
  }),
});

export default adminKeycloakApi;

export const { useGetKeycloakUserQuery, useGetKeycloakUsersQuery } =
  adminKeycloakApi;
