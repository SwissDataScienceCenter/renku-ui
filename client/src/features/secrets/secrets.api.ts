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
  AddSecretParams,
  EditSecretParams,
  SecretDetails,
} from "./secrets.types";

const secretsApi = createApi({
  reducerPath: "secrets",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/user/secrets",
  }),
  tagTypes: ["Secrets", "Secret"],
  endpoints: (builder) => ({
    getSecrets: builder.query<string[], void>({
      query: () => {
        return {
          url: "",
        };
      },
      providesTags: ["Secrets"],
      // ! Double check we don't need this anymore
      // // validateStatus: (response, body) => { return response.status < 400 && !body.error?.code; },
    }),
    getSecretDetails: builder.query<SecretDetails, string>({
      query: (secretId) => {
        return {
          url: secretId,
        };
      },
      providesTags: (result, _error, secretId) =>
        result && result.id === secretId
          ? [{ type: "Secret" as const, id: secretId }]
          : [],
    }),
    addSecret: builder.mutation<SecretDetails, AddSecretParams>({
      query: (secret) => {
        return {
          url: "",
          method: "POST",
          body: secret,
        };
      },
      invalidatesTags: ["Secrets"],
    }),
    editSecret: builder.mutation<SecretDetails, EditSecretParams>({
      query: (secret) => {
        return {
          url: secret.id,
          method: "PATCH",
          body: { value: secret.value },
        };
      },
      // ? We don't need to invalidate the secrets since we never get the values anyway
    }),
    deleteSecret: builder.mutation<void, string>({
      query: (secretId) => {
        return {
          url: secretId,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Secrets"],
    }),
  }),
});

export default secretsApi;
export const {
  useGetSecretsQuery,
  useGetSecretDetailsQuery,
  useAddSecretMutation,
  useEditSecretMutation,
  useDeleteSecretMutation,
} = secretsApi;
