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
import { UserInfo, UserInfoResponse } from "./user.types";

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "ui-server/api/kc/realms/Renku",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => {
        return {
          url: "protocol/openid-connect/userinfo",
          validateStatus: (response) => {
            return response.status < 400 || response.status == 401;
          },
        };
      },
      transformResponse: (result: UserInfoResponse | null | undefined) => {
        if (result == null) {
          return { isLoggedIn: false };
        }
        const isAdmin = result.groups.includes("renku-admin");
        return { ...result, isLoggedIn: true, isAdmin };
      },
    }),
  }),
});

export default userApi;
export const { useGetUserInfoQuery } = userApi;
