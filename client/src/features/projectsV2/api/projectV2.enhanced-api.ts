import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { projectStoragesApi as api } from "./storagesV2.api";
import type {
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  ProjectsList,
} from "./projectV2.api";

import type {
  GetGroupsApiArg,
  GetGroupsApiResponse as GetGroupsApiResponseOrig,
  GroupResponseList,
  GetNamespacesApiArg,
  GetNamespacesApiResponse as GetNamespacesApiResponseOrig,
  NamespaceResponseList,
} from "./namespace.api";
import {
  GetStoragesV2ApiArg,
  GetStoragesV2ApiResponse as GetStoragesV2ApiResponseOrig,
} from "./storagesV2.api.ts";

interface GetGroupsApiResponse extends AbstractKgPaginatedResponse {
  groups: GetGroupsApiResponseOrig;
}

export interface GetNamespacesApiResponse extends AbstractKgPaginatedResponse {
  namespaces: GetNamespacesApiResponseOrig;
}

interface GetProjectsApiResponse extends AbstractKgPaginatedResponse {
  projects: GetProjectsApiResponseOrig;
}

interface GetStoragesV2ApiResponse extends AbstractKgPaginatedResponse {
  storages: GetStoragesV2ApiResponseOrig;
}

const injectedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsPaged: builder.query<GetGroupsApiResponse, GetGroupsApiArg>({
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
    getNamespacesPaged: builder.query<
      GetNamespacesApiResponse,
      GetNamespacesApiArg
    >({
      query: (queryArg) => ({
        url: "/namespaces",
        params: { page: queryArg.page ?? 1, per_page: queryArg.perPage ?? 20 },
      }),
      transformResponse: (response, meta, queryArg) => {
        const namespaces = response as NamespaceResponseList;
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
    getProjectsPaged: builder.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: "/projects",
        params: {
          namespace: queryArg["namespace"],
          page: queryArg.page,
          per_page: queryArg.perPage,
        },
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
    getStoragesPaged: builder.query<
      GetStoragesV2ApiResponse,
      GetStoragesV2ApiArg
    >({
      query: (queryArg) => ({
        url: "/storages",
        params: { project_id: queryArg.projectId },
      }),
    }),
  }),
});

const enhancedApi = injectedApi.enhanceEndpoints({
  addTagTypes: [
    "Group",
    "GroupMembers",
    "Namespace",
    "Project",
    "ProjectMembers",
    "Storages",
  ],
  endpoints: {
    deleteGroupsByGroupSlug: {
      invalidatesTags: ["Group", "Namespace"],
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
    deleteStoragesV2ByStorageId: {
      invalidatesTags: ["Storages"],
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
    getNamespaces: {
      providesTags: ["Namespace"],
    },
    getNamespacesPaged: {
      providesTags: ["Namespace"],
    },
    // alternatively, define a function which is called with the endpoint definition as an argument
    getProjects: {
      providesTags: ["Project"],
    },
    getProjectsPaged: {
      providesTags: ["Project"],
    },
    getProjectsByNamespaceAndSlug: {
      providesTags: ["Project"],
    },
    getProjectsByProjectId: {
      providesTags: ["Project"],
    },
    getProjectsByProjectIdMembers: {
      providesTags: ["ProjectMembers"],
    },
    getStoragesV2: {
      providesTags: ["Storages"],
    },
    patchGroupsByGroupSlug: {
      invalidatesTags: ["Group", "Namespace"],
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
    patchStoragesV2ByStorageId: {
      invalidatesTags: ["Storages"],
    },
    postGroups: {
      invalidatesTags: ["Group", "Namespace"],
    },
    postProjects: {
      invalidatesTags: ["Project"],
    },
    postStoragesV2: {
      invalidatesTags: ["Storages"],
    },
  },
});

export { enhancedApi as projectV2Api };
export const {
  // project hooks
  useGetProjectsPagedQuery: useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByNamespaceAndSlugQuery,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,

  // group hooks
  useGetGroupsPagedQuery: useGetGroupsQuery,
  usePostGroupsMutation,
  useGetGroupsByGroupSlugQuery,
  usePatchGroupsByGroupSlugMutation,
  useDeleteGroupsByGroupSlugMutation,
  useGetGroupsByGroupSlugMembersQuery,
  usePatchGroupsByGroupSlugMembersMutation,
  useDeleteGroupsByGroupSlugMembersAndUserIdMutation,

  //namespace hooks
  useGetNamespacesPagedQuery: useGetNamespacesQuery,
  useLazyGetNamespacesPagedQuery: useLazyGetNamespacesQuery,
  useGetNamespacesByGroupSlugQuery,

  // storages hooks
  useGetStoragesV2Query,
  usePostStoragesV2Mutation,
} = enhancedApi;
