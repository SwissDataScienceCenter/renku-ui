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
import { SearchApiParams, SearchApiResponse } from "./searchV2.types";

const searchV2Api = createApi({
  reducerPath: "searchV2Api",
  baseQuery: fetchBaseQuery({
    // eslint-disable-next-line spellcheck/spell-checker
    baseUrl: "/ui-server/api/search",
  }),
  tagTypes: ["SearchV2"],
  endpoints: (builder) => ({
    getSearchResults: builder.query<SearchApiResponse, SearchApiParams>({
      query: (params) => {
        return {
          method: "GET",
          params: {
            q: params.searchString,
            page: params.page,
            per_page: params.perPage,
          },
          url: "",
        };
      },
      extraOptions: {
        refetchOnMountOrArgChange: 1,
      },
    }),
  }),
});

export default searchV2Api;
export const { useGetSearchResultsQuery } = searchV2Api;
