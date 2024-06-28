import { searchV2EmptyApi as api } from "./searchV2-empty.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getQuery: build.query<GetQueryApiResponse, GetQueryApiArg>({
      query: (queryArg) => ({
        url: `/query`,
        headers: { "Renku-Auth-Anon-Id": queryArg["Renku-Auth-Anon-Id"] },
        params: {
          q: queryArg.q,
          page: queryArg.page,
          per_page: queryArg.perPage,
        },
      }),
    }),
    getVersion: build.query<GetVersionApiResponse, GetVersionApiArg>({
      query: () => ({ url: `/version` }),
    }),
    $get: build.query<$getApiResponse, $getApiArg>({
      query: (queryArg) => ({
        url: `/`,
        headers: { "Renku-Auth-Anon-Id": queryArg["Renku-Auth-Anon-Id"] },
        params: {
          q: queryArg.q,
          page: queryArg.page,
          per_page: queryArg.perPage,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as searchV2Api };
export type GetQueryApiResponse = /** status 200  */ SearchResult;
export type GetQueryApiArg = {
  "Renku-Auth-Anon-Id"?: string;
  /** User defined search query */
  q?: string;
  /** The page to retrieve, starting at 1 */
  page?: number;
  /** How many items to return for one page */
  perPage?: number;
};
export type GetVersionApiResponse = /** status 200  */ CurrentVersion;
export type GetVersionApiArg = void;
export type $getApiResponse = /** status 200  */ SearchResult;
export type $getApiArg = {
  "Renku-Auth-Anon-Id"?: string;
  /** User defined search query */
  q?: string;
  /** The page to retrieve, starting at 1 */
  page?: number;
  /** How many items to return for one page */
  perPage?: number;
};
export type Group = {
  id: string;
  name: string;
  namespace: string;
  description?: string;
  score?: number;
  type: string;
};
export type User = {
  id: string;
  namespace?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  type: string;
};
export type UserOrGroup =
  | ({
      type: "Group";
    } & Group)
  | ({
      type: "User";
    } & User);
export type Visibility = "Private" | "Public";
export type Project = {
  id: string;
  name: string;
  slug: string;
  namespace?: UserOrGroup;
  repositories?: string[];
  visibility: Visibility;
  description?: string;
  createdBy?: User;
  creationDate: string;
  keywords?: string[];
  score?: number;
  type: string;
};
export type SearchEntity =
  | ({
      type: "Group";
    } & Group)
  | ({
      type: "Project";
    } & Project)
  | ({
      type: "User";
    } & User);
export type MapEntityTypeInt = {
  [key: string]: number;
};
export type FacetData = {
  entityType: MapEntityTypeInt;
};
export type PageDef = {
  limit: number;
  offset: number;
};
export type PageWithTotals = {
  page: PageDef;
  totalResult: number;
  totalPages: number;
  prevPage?: number;
  nextPage?: number;
};
export type SearchResult = {
  items?: SearchEntity[];
  facets: FacetData;
  pagingInfo: PageWithTotals;
};
export type CurrentVersion = {
  name: string;
  version: string;
  headCommit: string;
  describedVersion: string;
};
export const { useGetQueryQuery, useGetVersionQuery, use$getQuery } =
  injectedRtkApi;
