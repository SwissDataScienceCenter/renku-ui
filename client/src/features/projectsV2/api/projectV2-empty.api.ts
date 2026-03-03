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
import queryString from "query-string";

import { API_BASE_URL } from "~/utils/api/api.constants";
import { prepareHeaders } from "~/utils/api/api.utils";

// initialize an empty api service that we'll inject endpoints into later as needed
export const projectV2EmptyApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders,
    paramsSerializer: (params: Record<string, unknown>) =>
      // NOTE: arrayFormat: none will serialize arrays by using duplicate keys
      // like foo: [1, 2, 3] => 'foo=1&foo=2&foo=3' -> this is compatible
      // with how the backend expects query parameters.
      queryString.stringify(params, { arrayFormat: "none" }),
  }),
  endpoints: () => ({}),
  reducerPath: "projectV2Api",
});
