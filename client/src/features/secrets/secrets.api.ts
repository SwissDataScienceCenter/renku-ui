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
          // ! TMP API - until APIs are deployed and responding
          validateStatus: (response) => {
            return response.status < 400 || response.status === 404;
          },
        };
      },
      providesTags: ["Secrets"],
      // ! TMP API - until APIs are deployed and responding
      transformResponse: () => {
        return ["Secret1", "Secret2"];
      },
    }),
    getSecretDetails: builder.query<SecretDetails, string>({
      query: (secretId) => {
        return {
          url: secretId,
          // ! TMP API - until APIs are deployed and responding
          validateStatus: (response) => {
            return response.status < 400 || response.status === 404;
          },
        };
      },
      providesTags: (result, _error, secretId) =>
        result && result.id === secretId
          ? [{ type: "Secret", id: secretId }]
          : [],
      // ! TMP API - until APIs are deployed and responding
      transformResponse: (_arg1, _arg2, arg3) => {
        return {
          id: "1234-1234-5678-abcd",
          name: arg3,
          modification_date: new Date(),
        };
      },
    }),
    addSecret: builder.mutation<SecretDetails, AddSecretParams>({
      query: (secret) => {
        return {
          url: "",
          method: "POST",
          body: secret,
          // ! TMP API - until APIs are deployed and responding
          validateStatus: (response) => {
            return response.status < 400 || response.status === 404;
          },
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
          // ! TMP API - until APIs are deployed and responding
          validateStatus: (response) => {
            return response.status < 400 || response.status === 404;
          },
        };
      },
      invalidatesTags: (_result, _error, params) => [
        { type: "Secret", id: params.id },
      ],
    }),
    deleteSecret: builder.mutation<void, string>({
      query: (secretId) => {
        return {
          url: secretId,
          method: "DELETE",
          // ! TMP API - until APIs are deployed and responding
          validateStatus: (response) => {
            return response.status < 400 || response.status === 404;
          },
        };
      },
      invalidatesTags: (_result, _error, param) => [
        "Secrets",
        { type: "Secret", id: param },
      ],
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
