import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { projectAndNamespaceApi as api } from "./namespace.api";

import type {
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  GetProjectsByProjectIdApiArg,
  GetProjectsByProjectIdApiResponse,
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

interface GetGroupsApiResponse extends AbstractKgPaginatedResponse {
  groups: GetGroupsApiResponseOrig;
}

interface GetProjectsByProjectIdsApiArg {
  projectIds: GetProjectsByProjectIdApiArg["projectId"][];
}

type GetProjectsByProjectIdsApiResponse = Record<
  string,
  GetProjectsByProjectIdApiResponse
>;

export interface GetNamespacesApiResponse extends AbstractKgPaginatedResponse {
  namespaces: GetNamespacesApiResponseOrig;
}

interface GetProjectsApiResponse extends AbstractKgPaginatedResponse {
  projects: GetProjectsApiResponseOrig;
}

const injectedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsPaged: builder.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: (queryArg) => ({
        url: "/groups",
        params: {
          page: queryArg.page,
          per_page: queryArg.perPage,
          direct_member: queryArg.direct_member,
        },
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
        params: {
          page: queryArg.page,
          per_page: queryArg.perPage,
          minimum_role: queryArg.minimumRole,
        },
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
          direct_member: queryArg["direct_member"],
          page: queryArg.page,
          per_page: queryArg.perPage,
        },
      }),
      transformResponse: (response, meta, queryArg) => {
        const projects = response as ProjectsList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: queryArg.params?.page, perPage: queryArg.params?.per_page },
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
    getProjectsByProjectIds: builder.query<
      GetProjectsByProjectIdsApiResponse,
      GetProjectsByProjectIdsApiArg
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { projectIds } = queryArg;
        const result: GetProjectsByProjectIdsApiResponse = {};
        const promises = projectIds.map((projectId) =>
          fetchWithBQ(`/projects/${projectId}`)
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < projectIds.length; i++) {
          const projectId = projectIds[i];
          const response = responses[i];
          if (response.error) return response;
          result[projectId] =
            response.data as GetProjectsByProjectIdApiResponse;
        }
        return { data: result };
      },
    }),
  }),
});

const enhancedApi = injectedApi.enhanceEndpoints({
  addTagTypes: [
    "DataConnectors",
    "Group",
    "GroupMembers",
    "Namespace",
    "Project",
    "ProjectMembers",
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
    getProjectsByProjectIds: {
      providesTags: ["Project"],
    },
    getProjectsByNamespaceAndSlug: {
      providesTags: ["Project"],
    },
    getProjectsByProjectId: {
      providesTags: ["Project"],
    },
    getProjectsByProjectIdDataConnectorLinks: {
      providesTags: ["DataConnectors"],
    },
    getProjectsByProjectIdMembers: {
      providesTags: ["ProjectMembers"],
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
    postGroups: {
      invalidatesTags: ["Group", "Namespace"],
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
  useGetProjectsByNamespaceAndSlugQuery,
  useGetProjectsByProjectIdQuery,
  useGetProjectsByProjectIdsQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,

  // data connector hooks
  useGetProjectsByProjectIdDataConnectorLinksQuery,

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
  useGetNamespacesByNamespaceSlugQuery,
} = enhancedApi;
