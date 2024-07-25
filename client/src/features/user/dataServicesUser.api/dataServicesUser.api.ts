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

import { dataServicesUserGeneratedApi } from "./dataServicesUser.generated-api";

export const dataServicesUserApi =
  dataServicesUserGeneratedApi.enhanceEndpoints({
    addTagTypes: ["User", "UserSecret", "UserSecretKey"],
    endpoints: {
      getUser: {
        providesTags: (result) =>
          result ? [{ type: "User", id: result.id }] : [],
      },
      getUsers: {
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({ type: "User" as const, id })),
                "User",
              ]
            : ["User"],
      },
      getUsersByUserId: {
        providesTags: (result) =>
          result ? [{ type: "User", id: result.id }] : [],
      },
      getUserSecretKey: {
        providesTags: ["UserSecretKey"],
      },
      getUserSecrets: {
        providesTags: ["UserSecret", { type: "UserSecret", id: "LIST" }],
      },
      getUserSecretsBySecretId: {
        providesTags: (result) =>
          result ? [{ type: "UserSecret", id: result.id }] : [],
      },
      postUserSecrets: {
        invalidatesTags: ["UserSecret"],
      },
      patchUserSecretsBySecretId: {
        invalidatesTags: (result) =>
          result ? [{ type: "UserSecret", id: result.id }] : ["UserSecret"],
      },
      deleteUserSecretsBySecretId: {
        invalidatesTags: ["UserSecret"],
      },
    },
  });
export const {
  useGetUserQuery,
  useGetUsersQuery,
  useGetUsersByUserIdQuery,
  useGetUserSecretKeyQuery,
  useGetUserSecretsQuery,
  useGetUserSecretsBySecretIdQuery,
  usePostUserSecretsMutation,
  usePatchUserSecretsBySecretIdMutation,
  useDeleteUserSecretsBySecretIdMutation,
} = dataServicesUserApi;
export type * from "./dataServicesUser.generated-api";
