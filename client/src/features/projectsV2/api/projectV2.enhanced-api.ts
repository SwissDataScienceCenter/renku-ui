import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";
import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { usersApi } from "../../usersV2/api/users.api";

import { projectAndNamespaceApi as api } from "./namespace.api";

import type {
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  GetProjectsByProjectIdApiArg,
  GetProjectsByProjectIdApiResponse,
  ProjectsList,
  SessionSecretSlot,
} from "./projectV2.api";

import type {
  GetGroupsApiArg,
  GetGroupsApiResponse as GetGroupsApiResponseOrig,
  GetNamespacesApiArg,
  GetNamespacesApiResponse as GetNamespacesApiResponseOrig,
  GroupResponseList,
  NamespaceResponseList,
} from "./namespace.api";

export interface GetGroupsApiResponse extends AbstractKgPaginatedResponse {
  groups: GetGroupsApiResponseOrig;
}

interface GetProjectsByProjectIdsApiArg {
  projectIds: GetProjectsByProjectIdApiArg["projectId"][];
}

type GetProjectsByProjectIdsApiResponse = Record<
  string,
  GetProjectsByProjectIdApiResponse
>;

interface GetSessionSecretSlotsByIdsApiArg {
  sessionSecretSlotIds: string[];
}

type GetSessionSecretSlotsByIdsApiResponse = SessionSecretSlot[];

export interface GetNamespacesApiResponse extends AbstractKgPaginatedResponse {
  namespaces: GetNamespacesApiResponseOrig;
}

export interface GetProjectsApiResponse extends AbstractKgPaginatedResponse {
  projects: GetProjectsApiResponseOrig;
}

const injectedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsPaged: builder.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: (params) => ({
        url: "/groups",
        params: {
          page: params.page,
          per_page: params.perPage,
          direct_member: params.directMember,
        },
      }),
      transformResponse: (response, meta, params) => {
        const groups = response as GroupResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: params?.page, perPage: params?.perPage },
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
      query: (params) => ({
        url: "/namespaces",
        params: {
          page: params.page,
          per_page: params.perPage,
          minimum_role: params.minimumRole,
          kinds: params.kinds,
        },
      }),
      transformResponse: (response, meta, params) => {
        const namespaces = response as NamespaceResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          { page: params?.page, perPage: params?.perPage },
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
    getSessionSecretSlotsByIds: builder.query<
      GetSessionSecretSlotsByIdsApiResponse,
      GetSessionSecretSlotsByIdsApiArg
    >({
      queryFn: async (
        { sessionSecretSlotIds },
        _api,
        _options,
        fetchWithBQ
      ) => {
        const result: GetSessionSecretSlotsByIdsApiResponse = [];
        const promises = sessionSecretSlotIds.map((slotId) =>
          fetchWithBQ(`/session_secret_slots/${slotId}`)
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < sessionSecretSlotIds.length; i++) {
          const response = responses[i];
          if (response.error) return response;
          result.push(response.data as SessionSecretSlot);
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
    "SessionSecret",
    "ProjectMigrations",
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
      // Forces the requested URL to not contain "?" when not requesting documentation.
      query: ({ namespace, slug, withDocumentation }) => ({
        url: `/namespaces/${namespace}/projects/${slug}`,
        params: withDocumentation
          ? { with_documentation: withDocumentation }
          : undefined,
      }),
      providesTags: ["Project"],
    },
    getProjectsByProjectId: {
      // Forces the requested URL to not contain "?" when not requesting documentation.
      query: ({ projectId, withDocumentation }) => ({
        url: `/projects/${projectId}`,
        params: withDocumentation
          ? { with_documentation: withDocumentation }
          : undefined,
      }),
      providesTags: ["Project"],
    },
    getProjectsByProjectIdCopies: {
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
    getProjectsByProjectIdSessionSecretSlots: {
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
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.finally(() => {
          dispatch(usersApi.endpoints.invalidateUserSecrets.initiate());
        });
      },
    },
    getProjectsByProjectIdSessionSecrets: {
      providesTags: (result, _, { projectId }) =>
        result
          ? [{ type: "SessionSecret", id: `LIST-${projectId}` }]
          : ["SessionSecret"],
    },
    patchProjectsByProjectIdSessionSecrets: {
      invalidatesTags: (result, _, { projectId }) =>
        result
          ? [{ type: "SessionSecret", id: `LIST-${projectId}` }]
          : ["SessionSecret"],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.finally(() => {
          dispatch(usersApi.endpoints.invalidateUserSecrets.initiate());
        });
      },
    },
    getSessionSecretSlotsByIds: {
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SessionSecretSlot" as const,
                id,
              })),
            ]
          : ["SessionSecretSlot"],
    },
    postProjectsByProjectIdCopies: {
      invalidatesTags: ["Project"],
    },
    getRenkuV1ProjectsByV1IdMigrations: {
      providesTags: (result, _error, { v1Id }) =>
        result
          ? [{ id: `${v1Id}`, type: "ProjectMigrations" }]
          : ["ProjectMigrations"],
    },
    postRenkuV1ProjectsByV1IdMigrations: {
      invalidatesTags: (result, _error, { v1Id }) =>
        result
          ? [{ id: `${v1Id}`, type: "ProjectMigrations" }]
          : ["ProjectMigrations"],
    },
  },
});

// Adds tag invalidation endpoints
const withInvalidation = enhancedApi.injectEndpoints({
  endpoints: (build) => ({
    invalidateSessionSecrets: build.mutation<null, void>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ["SessionSecret", "SessionSecretSlot"],
    }),
  }),
});

export { withInvalidation as projectV2Api };
export const {
  // project hooks
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useGetProjectsPagedQuery: useGetProjectsQuery,
  useGetNamespacesByNamespaceProjectsAndSlugQuery,
  useGetProjectsByProjectIdCopiesQuery,
  useGetProjectsByProjectIdPermissionsQuery,
  useGetProjectsByProjectIdQuery,
  useGetProjectsByProjectIdsQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  usePostProjectsMutation,
  usePostProjectsByProjectIdCopiesMutation,
  useGetRenkuV1ProjectsByV1IdMigrationsQuery,
  usePostRenkuV1ProjectsByV1IdMigrationsMutation,

  // project session secret hooks
  useGetProjectsByProjectIdSessionSecretSlotsQuery,
  usePostSessionSecretSlotsMutation,
  usePatchSessionSecretSlotsBySlotIdMutation,
  useDeleteSessionSecretSlotsBySlotIdMutation,
  useGetProjectsByProjectIdSessionSecretsQuery,
  usePatchProjectsByProjectIdSessionSecretsMutation,

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
  useGetSessionSecretSlotsByIdsQuery,

  //namespace hooks
  useGetNamespacesPagedQuery: useGetNamespacesQuery,
  useLazyGetNamespacesPagedQuery: useLazyGetNamespacesQuery,
  useGetNamespacesByNamespaceSlugQuery,
} = withInvalidation;
