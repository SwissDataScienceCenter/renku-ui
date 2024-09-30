/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { groupsV2GeneratedApi } from "./groupsV2.generated-api";
import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";
import type {
  GetGroupsApiArg,
  GetGroupsApiResponse as GetGroupsApiResponseOrig,
  GroupResponseList,
  GetNamespacesApiArg,
  GetNamespacesApiResponse as GetNamespacesApiResponseOrig,
  NamespaceResponseList,
} from "./groupsV2.generated-api";

interface GetGroupsApiResponse extends AbstractKgPaginatedResponse {
  groups: GetGroupsApiResponseOrig;
}

export interface GetNamespacesApiResponse extends AbstractKgPaginatedResponse {
  namespaces: GetNamespacesApiResponseOrig;
}

const withPaged = groupsV2GeneratedApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsPaged: builder.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: ({ params }) => ({
        url: "/groups",
        params,
      }),
      transformResponse: (response, meta, queryArg) => {
        const groups = response as GroupResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg.params ?? {},
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
      transformResponse: (response, meta, queryArg) => {
        const namespaces = response as NamespaceResponseList;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg.params ?? {},
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
  }),
});

export const groupsV2Api = withPaged.enhanceEndpoints({
  addTagTypes: ["Group", "GroupMembers", "Namespace"],
  endpoints: {
    deleteGroupsByGroupSlug: {
      invalidatesTags: ["Group", "Namespace"],
    },
    deleteGroupsByGroupSlugMembersAndUserId: {
      invalidatesTags: ["GroupMembers"],
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
    patchGroupsByGroupSlug: {
      invalidatesTags: ["Group", "Namespace"],
    },
    patchGroupsByGroupSlugMembers: {
      invalidatesTags: ["GroupMembers"],
    },
    postGroups: {
      invalidatesTags: ["Group", "Namespace"],
    },
  },
});

export const {
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
} = groupsV2Api;
export type * from "./groupsV2.generated-api";
