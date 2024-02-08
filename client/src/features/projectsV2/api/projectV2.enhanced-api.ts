import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { projectAndGroupApi as api } from "././group.api";
import type {
  ErrorResponse,
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  ProjectsList,
} from "./projectV2.api";

import type {
  GetGroupsApiArg,
  GetGroupsApiResponse as GetGroupsApiResponseOrig,
  GroupResponseList,
} from "./group.api";

interface GetGroupsApiResponse extends AbstractKgPaginatedResponse {
  groups: GetGroupsApiResponseOrig;
}

interface GetProjectsApiResponse extends AbstractKgPaginatedResponse {
  projects: GetProjectsApiResponseOrig;
}

const injectedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroupsPaged: build.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: (queryArg) => ({
        url: "/groups",
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
      transformResponse: (response, meta, queryArg) => {
        const groups = response as GroupResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg,
          groups
        );

        return {
          groups,
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
  addTagTypes: ["Group", "GroupMembers", "Project", "ProjectMembers"],
  endpoints: {
    deleteGroupsByGroupSlug: {
      invalidatesTags: ["Group"],
    },
    deleteGroupsByGroupSlugMembersAndUserId: {
      invalidatesTags: ["GroupMembers"],
    },
    deleteProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    deleteProjectsByProjectIdMembersAndMemberId: {
      invalidatesTags: ["ProjectMembers"],
    },
    getGroups: {
      providesTags: ["Group"],
    },
    getGroupsByGroupSlug: {
      providesTags: ["Group"],
    },
    getGroupsPaged: {
      providesTags: ["Group"],
    },
    getGroupsByGroupSlugMembers: {
      providesTags: ["GroupMembers"],
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
      providesTags: ["ProjectMembers"],
    },
    patchGroupsByGroupSlug: {
      invalidatesTags: ["Group"],
    },
    patchGroupsByGroupSlugMembers: {
      invalidatesTags: ["GroupMembers"],
    },
    patchProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    patchProjectsByProjectIdMembers: {
      invalidatesTags: ["ProjectMembers"],
    },
    postGroups: {
      invalidatesTags: ["Group"],
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
  useGetGroupsPagedQuery: useGetGroupsQuery,
  usePostGroupsMutation,
  useGetGroupsByGroupSlugQuery,
  usePatchGroupsByGroupSlugMutation,
  useDeleteGroupsByGroupSlugMutation,
  useGetGroupsByGroupSlugMembersQuery,
  usePatchGroupsByGroupSlugMembersMutation,
  useDeleteGroupsByGroupSlugMembersAndUserIdMutation,
} = enhancedApi;

export function isErrorResponse(arg: unknown): arg is { data: ErrorResponse } {
  return (arg as { data: ErrorResponse }).data?.error != null;
}
