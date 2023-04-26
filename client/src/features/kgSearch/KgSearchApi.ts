/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { KgAuthor, KgSearchResult, ListResponse } from "./KgSearch";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";

export type SearchEntitiesQueryParams = {
  phrase: string;
  sort: SortingOptions;
  page: number;
  perPage: number;
  type: TypeEntitySelection;
  author: KgAuthor;
  visibility?: VisibilitiesFilter;
  userName?: string;
  since?: string;
  until?: string;
};

function getHeaderFieldNumeric(headers: Headers, field: string): number {
  return +(headers.get(field) ?? 0);
}

function setAuthorInQuery(query: string, author: KgAuthor, userName?: string) {
  if (author === "user" && userName) query = `${query}&creator=${userName}`;

  return query;
}

function setTypeInQuery(query: string, types: TypeEntitySelection) {
  if (!types.project && !types.dataset)
    query = `${query}&type=project&type=dataset`;

  if (types.project) query = `${query}&type=project`;

  if (types.dataset) query = `${query}&type=dataset`;

  return query;
}

function setVisibilityInQuery(
  query: string,
  visibilities?: VisibilitiesFilter
) {
  if (!visibilities) return query;

  if (visibilities.private) query = `${query}&visibility=private`;

  if (visibilities.public) query = `${query}&visibility=public`;

  if (visibilities.internal) query = `${query}&visibility=internal`;

  return query;
}

const getPhrase = (phrase?: string) => {
  if (!phrase) return "";
  return `query=${phrase}`;
};

const setDates = (query: string, since?: string, until?: string) => {
  if (since) query = `${query}&since=${since}`;
  if (until) query = `${query}&until=${until}`;
  return query;
};

const setSort = (query: string, sort: SortingOptions) => {
  if (sort === SortingOptions.DescDate || sort === SortingOptions.AscDate)
    return `${query}&sort=${sort}`;
  return `${query}&sort=${sort}&sort=${SortingOptions.DescDate}`;
};

const KG_SEARCH_API_REFETCH_AFTER_DURATION_S = 30;

// Define a service using a base URL and expected endpoints
export const kgSearchApi = createApi({
  reducerPath: "kgSearchApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/kg/" }),
  endpoints: (builder) => ({
    searchEntities: builder.query<
      ListResponse<KgSearchResult>,
      SearchEntitiesQueryParams
    >({
      query: ({
        phrase,
        sort,
        page,
        perPage,
        type,
        visibility,
        author,
        userName,
        since,
        until,
      }) => {
        const url = `entities?${getPhrase(
          phrase
        )}&page=${page}&per_page=${perPage}`;
        return setSort(
          setDates(
            setAuthorInQuery(
              setVisibilityInQuery(setTypeInQuery(url, type), visibility),
              author,
              userName
            ),
            since,
            until
          ),
          sort
        );
      },
      transformResponse: (
        response: KgSearchResult[],
        meta: FetchBaseQueryMeta
      ) => {
        // Left here temporarily in case we want to use headers
        const headers = meta.response?.headers;
        if (headers == null) {
          return {
            page: 0,
            perPage: 0,
            total: 0,
            totalPages: 0,
            results: [],
          };
        }
        const page = getHeaderFieldNumeric(headers, "page");
        const perPage = getHeaderFieldNumeric(headers, "per-page");
        const total = getHeaderFieldNumeric(headers, "Total");
        const totalPages = getHeaderFieldNumeric(headers, "total-pages");
        return {
          page,
          perPage,
          total,
          totalPages,
          results: response,
        };
      },
    }),
  }),
  refetchOnMountOrArgChange: KG_SEARCH_API_REFETCH_AFTER_DURATION_S,
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useSearchEntitiesQuery } = kgSearchApi;
