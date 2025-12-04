import { searchV2EmptyApi as api } from "./searchV2-empty.api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSearchQuery: build.query<
      GetSearchQueryApiResponse,
      GetSearchQueryApiArg
    >({
      query: (queryArg) => ({
        url: `/search/query`,
        params: { params: queryArg.params },
      }),
    }),
    postSearchReprovision: build.mutation<
      PostSearchReprovisionApiResponse,
      PostSearchReprovisionApiArg
    >({
      query: () => ({ url: `/search/reprovision`, method: "POST" }),
    }),
    getSearchReprovision: build.query<
      GetSearchReprovisionApiResponse,
      GetSearchReprovisionApiArg
    >({
      query: () => ({ url: `/search/reprovision` }),
    }),
    deleteSearchReprovision: build.mutation<
      DeleteSearchReprovisionApiResponse,
      DeleteSearchReprovisionApiArg
    >({
      query: () => ({ url: `/search/reprovision`, method: "DELETE" }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as searchV2GeneratedApi };
export type GetSearchQueryApiResponse =
  /** status 200 Search results according to the query. */ SearchResult;
export type GetSearchQueryApiArg = {
  /** query parameters */
  params?: SearchQuery;
};
export type PostSearchReprovisionApiResponse =
  /** status 201 The reprovisioning is/will be started */ Reprovisioning;
export type PostSearchReprovisionApiArg = void;
export type GetSearchReprovisionApiResponse =
  /** status 200 Status of reprovisioning if there's one in progress */ ReprovisioningStatus;
export type GetSearchReprovisionApiArg = void;
export type DeleteSearchReprovisionApiResponse =
  /** status 204 The reprovisioning was stopped or there was no one in progress */ void;
export type DeleteSearchReprovisionApiArg = void;
export type Group = {
  id: string;
  name: string;
  path: string;
  slug: string;
  description?: string;
  score?: number;
  type: "Group";
};
export type User = {
  id: string;
  path: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  type: "User";
};
export type UserOrGroup = Group | User;
export type Visibility = "private" | "public";
export type Project = {
  id: string;
  name: string;
  slug: string;
  path: string;
  namespace?: UserOrGroup;
  repositories?: string[];
  visibility: Visibility;
  description?: string;
  createdBy?: User;
  creationDate: string;
  keywords?: string[];
  score?: number;
  type: "Project";
};
export type UserOrGroupOrProject = Group | User | Project;
export type DataConnector = {
  id: string;
  storageType: string;
  readonly: boolean;
  name: string;
  slug: string;
  path: string;
  namespace?: UserOrGroupOrProject;
  visibility: Visibility;
  description?: string;
  createdBy?: User;
  creationDate: string;
  keywords?: string[];
  score?: number;
  type: "DataConnector";
};
export type SearchEntity = Group | Project | User | DataConnector;
export type MapEntityTypeInt = {
  [key: string]: number;
};
export type FacetData = {
  entityType: MapEntityTypeInt;
  keywords: MapEntityTypeInt;
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
export type PaginationRequest = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  per_page?: number;
};
export type SearchQuery = PaginationRequest & {
  /** The search query. */
  q?: string;
};
export type Ulid = string;
export type Reprovisioning = {
  id: Ulid;
  /** The date and time the reprovisioning was started (in UTC and ISO-8601 format) */
  start_date: string;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type ReprovisioningStatus = Reprovisioning;
export const {
  useGetSearchQueryQuery,
  usePostSearchReprovisionMutation,
  useGetSearchReprovisionQuery,
  useDeleteSearchReprovisionMutation,
} = injectedRtkApi;
