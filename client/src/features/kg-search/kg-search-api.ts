import { FetchBaseQueryMeta } from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { KgSearchResult, ListResponse } from "./kg-search";

type SearchEntitiesQueryParams = {
  phrase: string;
  sort: string;
  page: number;
  perPage: number;
};

function getHeaderFieldNumeric(headers: Headers, field: string): number {
  return +(headers.get(field) ?? 0);
}

// Define a service using a base URL and expected endpoints
export const kgSearchApi = createApi({
  reducerPath: "kgSearchApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/kg/" }),
  endpoints: (builder) => ({
    searchEntities: builder.query<
      ListResponse<KgSearchResult>,
      SearchEntitiesQueryParams
    >({
      query: ({ phrase, sort, page, perPage }) =>
        `entities?query=${phrase}&sort=${sort}&page=${page}&per_page=${perPage}`,
      transformResponse: (
        response: KgSearchResult[],
        meta: FetchBaseQueryMeta,
        arg: SearchEntitiesQueryParams
      ) => {
        // Left here temporarily in case we want to use headers
        const headers = meta.response?.headers;
        if (headers == null) {
          return {
            page: 0,
            perPage: 0,
            total: 0,
            totalPages: 0,
            results: []
          };
        }
        const page = getHeaderFieldNumeric(headers, "page");
        const perPage = getHeaderFieldNumeric(headers, "per-page");
        const total = getHeaderFieldNumeric(headers, "total");
        const totalPages = getHeaderFieldNumeric(headers, "total-pages");
        return {
          page,
          perPage,
          total,
          totalPages,
          results: response
        };
      }
    })
  })
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useSearchEntitiesQuery } = kgSearchApi;
