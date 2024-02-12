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
import { AddSessionV2Params } from "./sessionsV2.types";

const sessionsV2Api = createApi({
  reducerPath: "sessionsV2Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/sessions",
  }),
  tagTypes: ["SessionV2"],
  endpoints: (builder) => ({
    addSessionV2: builder.mutation<unknown, AddSessionV2Params>({
      query: (params) => {
        return {
          url: "",
          method: "POST",
          body: { ...params },
        };
      },
    }),
  }),
});

export default sessionsV2Api;
export const { useAddSessionV2Mutation } = sessionsV2Api;
