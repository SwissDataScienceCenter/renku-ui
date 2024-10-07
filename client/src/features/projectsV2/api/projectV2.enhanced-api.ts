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
  GetStoragesV2ByStorageIdSecretsApiArg,
  GetStoragesV2ByStorageIdSecretsApiResponse,
} from "./storagesV2.api";
import type {
  CloudStorageSecretGetList,
  PostStoragesV2ByStorageIdSecretsApiArg,
  PostStoragesV2ByStorageIdSecretsApiResponse,
} from "./storagesV2.api";

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

type GetStoragesV2StorageIdSecretsApiResponse = Record<
  string,
  GetStoragesV2ByStorageIdSecretsApiResponse
>;

interface GetStoragesV2StorageIdSecretsApiArg {
  storageIds: GetStoragesV2ByStorageIdSecretsApiArg["storageId"][];
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
        params: queryArg,
      }),
    }),
    getStorageSecretsByV2StorageId: builder.query<
      GetStoragesV2StorageIdSecretsApiResponse,
      GetStoragesV2StorageIdSecretsApiArg
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { storageIds } = queryArg;
        const result: GetStoragesV2StorageIdSecretsApiResponse = {};
        for (const storageId of storageIds) {
          const response = await fetchWithBQ(
            `/storages_v2/${storageId}/secrets`
          );
          if (response.error) {
            return response;
          }
          result[storageId] = response.data as CloudStorageSecretGetList;
        }
        return { data: result };
      },
    }),
    postStoragesV2SecretsForSessionLaunch: builder.mutation<
      PostStoragesV2ByStorageIdSecretsApiResponse,
      PostStoragesV2ByStorageIdSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/storages_v2/${queryArg.storageId}/secrets`,
        method: "POST",
        body: queryArg.cloudStorageSecretPostList,
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
    "StorageSecrets",
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
    deleteStoragesV2ByStorageIdSecrets: {
      invalidatesTags: ["Storages", "StorageSecrets"],
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
    getStorageSecretsByV2StorageId: {
      providesTags: ["StorageSecrets"],
    },
    getStoragesV2: {
      providesTags: ["Storages"],
    },
    getStoragesV2ByStorageIdSecrets: {
      providesTags: ["StorageSecrets"],
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
    postStoragesV2ByStorageIdSecrets: {
      invalidatesTags: ["Storages", "StorageSecrets"],
    },
    postStoragesV2SecretsForSessionLaunch: {
      invalidatesTags: ["StorageSecrets"],
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
  useGetNamespacesByNamespaceSlugQuery,

  // storages hooks
  useDeleteStoragesV2ByStorageIdSecretsMutation,
  useGetStoragesV2Query,
  useGetStorageSecretsByV2StorageIdQuery,
  useGetStoragesV2ByStorageIdSecretsQuery,
  usePostStoragesV2Mutation,
  usePostStoragesV2ByStorageIdSecretsMutation,
  usePostStoragesV2SecretsForSessionLaunchMutation,
} = enhancedApi;
