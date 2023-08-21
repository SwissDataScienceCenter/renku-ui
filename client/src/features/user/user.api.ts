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
import { UserInfo } from "./user.types";

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/auth/" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      queryFn: async () => {
        // ? The endpoint does not exist yet on renku-gateway
        const search = new URLSearchParams(window.location.search);
        if (search.get("isAdmin")) {
          return { data: { isAdmin: true } };
        }
        return { data: { isAdmin: false } };
      },
    }),
  }),
});

export default userApi;
export const { useGetUserInfoQuery } = userApi;
