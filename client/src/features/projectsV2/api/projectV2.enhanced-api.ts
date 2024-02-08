import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { projectAndNamespaceApi as api } from "././namespace.api";
import type {
  ErrorResponse,
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  ProjectsList,
} from "./projectV2.api";

import type {
  GetNamespacesApiArg,
  GetNamespacesApiResponse as GetNamespacesApiResponseOrig,
  NamespacesList,
} from "./namespace.api";

interface GetNamespacesApiResponse extends AbstractKgPaginatedResponse {
  namespaces: GetNamespacesApiResponseOrig;
}

interface GetProjectsApiResponse extends AbstractKgPaginatedResponse {
  projects: GetProjectsApiResponseOrig;
}

const injectedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNamespacesPaged: build.query<
      GetNamespacesApiResponse,
      GetNamespacesApiArg
    >({
      query: (queryArg) => ({
        url: "/namespaces",
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
      transformResponse: (response, meta, queryArg) => {
        const namespaces = response as NamespacesList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg,
          namespaces
        );

        return {
          namespaces,
          page: headerResponse.page,
          perPage: headerResponse.perPage,
          total: headerResponse.total,
          totalPages: headerResponse.totalPages,
        };
      },
    }),
    getProjectsPaged: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: "/projects",
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
      transformResponse: (response, meta, queryArg) => {
        const projects = response as ProjectsList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg,
          projects
        );

        return {
          projects,
          page: headerResponse.page,
          perPage: headerResponse.perPage,
          total: headerResponse.total,
          totalPages: headerResponse.totalPages,
        };
      },
    }),
  }),
});

const enhancedApi = injectedApi.enhanceEndpoints({
  addTagTypes: ["Project", "Members"],
  endpoints: {
    deleteProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    deleteProjectsByProjectIdMembersAndMemberId: {
      invalidatesTags: ["Members"],
    },
    // alternatively, define a function which is called with the endpoint definition as an argument
    getProjects: {
      providesTags: ["Project"],
    },
    getProjectsPaged: {
      providesTags: ["Project"],
    },
    getProjectsByProjectId: {
      providesTags: ["Project"],
    },
    getProjectsByProjectIdMembers: {
      providesTags: ["Members"],
    },
    patchProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    patchProjectsByProjectIdMembers: {
      invalidatesTags: ["Members"],
    },
    postProjects: {
      invalidatesTags: ["Project"],
    },
  },
});

export { enhancedApi as projectV2Api };
export const {
  // project hooks
  useGetProjectsPagedQuery: useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,

  // namespace hooks
  useGetNamespacesPagedQuery: useGetNamespacesQuery,
  usePostNamespacesMutation,
  useGetNamespacesByNamespaceSlugQuery,
  usePatchNamespacesByNamespaceSlugMutation,
  useDeleteNamespacesByNamespaceSlugMutation,
  useGetNamespacesByNamespaceSlugMembersQuery,
  usePatchNamespacesByNamespaceSlugMembersMutation,
  useDeleteNamespacesByNamespaceSlugMembersAndMemberIdMutation,
} = enhancedApi;

export function isErrorResponse(arg: unknown): arg is { data: ErrorResponse } {
  return (arg as { data: ErrorResponse }).data?.error != null;
}
