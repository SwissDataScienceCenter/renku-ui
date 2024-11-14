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
      query: ({ params }) => ({
        url: "/groups",
        params,
      }),
      transformResponse: (response, meta, { params }) => {
        const groups = response as GroupResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: params?.page, perPage: params?.per_page },
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
      query: ({ params }) => ({
        url: "/namespaces",
        params,
      }),
      transformResponse: (response, meta, { params }) => {
        const namespaces = response as NamespaceResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: params?.page, perPage: params?.per_page },
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
      query: ({ params }) => ({
        url: "/projects",
        params,
      }),
      transformResponse: (response, meta, { params }) => {
        const projects = response as ProjectsList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: params?.page, perPage: params?.per_page },
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
    "SessionSecretSlot",
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
    getNamespacesByNamespaceProjectsAndSlug: {
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
    getProjectsByProjectIdSecretSlots: {
      providesTags: (result, _, { projectId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SessionSecretSlot" as const,
                id,
              })),
              { type: "SessionSecretSlot", id: `LIST-${projectId}` },
            ]
          : ["SessionSecretSlot"],
    },
    postSessionSecretSlots: {
      invalidatesTags: (
        result,
        _,
        { sessionSecretSlotPost: { project_id: projectId } }
      ) =>
        result
          ? [{ type: "SessionSecretSlot", id: `LIST-${projectId}` }]
          : ["SessionSecretSlot"],
    },
    patchSessionSecretSlotsBySlotId: {
      invalidatesTags: (result, _, { slotId }) =>
        result
          ? [{ type: "SessionSecretSlot", id: slotId }]
          : ["SessionSecretSlot"],
    },
    deleteSessionSecretSlotsBySlotId: {
      invalidatesTags: ["SessionSecretSlot"],
    },
  },
});

export { enhancedApi as projectV2Api };
export const {
  // project hooks
  useGetProjectsPagedQuery: useGetProjectsQuery,
  usePostProjectsMutation,
  useGetNamespacesByNamespaceProjectsAndSlugQuery,
  useGetProjectsByProjectIdQuery,
  useGetProjectsByProjectIdsQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useGetProjectsByProjectIdPermissionsQuery,

  // project session secret hooks
  useGetProjectsByProjectIdSecretSlotsQuery,
  usePostSessionSecretSlotsMutation,
  usePatchSessionSecretSlotsBySlotIdMutation,
  useDeleteSessionSecretSlotsBySlotIdMutation,
  useGetProjectsByProjectIdSecretsQuery,

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
  useGetGroupsByGroupSlugPermissionsQuery,

  //namespace hooks
  useGetNamespacesPagedQuery: useGetNamespacesQuery,
  useLazyGetNamespacesPagedQuery: useLazyGetNamespacesQuery,
  useGetNamespacesByNamespaceSlugQuery,
} = enhancedApi;
