import { projectV2Api as api } from "./projectV2.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroups: build.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: (queryArg) => ({
        url: `/groups`,
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
    }),
    postGroups: build.mutation<PostGroupsApiResponse, PostGroupsApiArg>({
      query: (queryArg) => ({
        url: `/groups`,
        method: "POST",
        body: queryArg.groupPostRequest,
      }),
    }),
    getGroupsByGroupSlug: build.query<
      GetGroupsByGroupSlugApiResponse,
      GetGroupsByGroupSlugApiArg
    >({
      query: (queryArg) => ({ url: `/groups/${queryArg.groupSlug}` }),
    }),
    patchGroupsByGroupSlug: build.mutation<
      PatchGroupsByGroupSlugApiResponse,
      PatchGroupsByGroupSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/groups/${queryArg.groupSlug}`,
        method: "PATCH",
        body: queryArg.groupPatchRequest,
      }),
    }),
    deleteGroupsByGroupSlug: build.mutation<
      DeleteGroupsByGroupSlugApiResponse,
      DeleteGroupsByGroupSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/groups/${queryArg.groupSlug}`,
        method: "DELETE",
      }),
    }),
    getGroupsByGroupSlugMembers: build.query<
      GetGroupsByGroupSlugMembersApiResponse,
      GetGroupsByGroupSlugMembersApiArg
    >({
      query: (queryArg) => ({ url: `/groups/${queryArg.groupSlug}/members` }),
    }),
    patchGroupsByGroupSlugMembers: build.mutation<
      PatchGroupsByGroupSlugMembersApiResponse,
      PatchGroupsByGroupSlugMembersApiArg
    >({
      query: (queryArg) => ({
        url: `/groups/${queryArg.groupSlug}/members`,
        method: "PATCH",
        body: queryArg.groupMemberPatchRequestList,
      }),
    }),
    deleteGroupsByGroupSlugMembersAndUserId: build.mutation<
      DeleteGroupsByGroupSlugMembersAndUserIdApiResponse,
      DeleteGroupsByGroupSlugMembersAndUserIdApiArg
    >({
      query: (queryArg) => ({
        url: `/groups/${queryArg.groupSlug}/members/${queryArg.userId}`,
        method: "DELETE",
      }),
    }),
    getNamespaces: build.query<GetNamespacesApiResponse, GetNamespacesApiArg>({
      query: (queryArg) => ({
        url: `/namespaces`,
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
    }),
    getNamespacesByGroupSlug: build.query<
      GetNamespacesByGroupSlugApiResponse,
      GetNamespacesByGroupSlugApiArg
    >({
      query: (queryArg) => ({ url: `/namespaces/${queryArg.groupSlug}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectAndNamespaceApi };
export type GetGroupsApiResponse =
  /** status 200 List of groups */ GroupResponseList;
export type GetGroupsApiArg = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  perPage?: number;
};
export type PostGroupsApiResponse =
  /** status 201 The group was created */ GroupResponse;
export type PostGroupsApiArg = {
  groupPostRequest: GroupPostRequest;
};
export type GetGroupsByGroupSlugApiResponse =
  /** status 200 The group */ GroupResponse;
export type GetGroupsByGroupSlugApiArg = {
  groupSlug: Slug;
};
export type PatchGroupsByGroupSlugApiResponse =
  /** status 200 The patched group */ GroupResponse;
export type PatchGroupsByGroupSlugApiArg = {
  groupSlug: Slug;
  groupPatchRequest: GroupPatchRequest;
};
export type DeleteGroupsByGroupSlugApiResponse =
  /** status 204 The group was removed or did not exist in the first place */ void;
export type DeleteGroupsByGroupSlugApiArg = {
  groupSlug: Slug;
};
export type GetGroupsByGroupSlugMembersApiResponse =
  /** status 200 The group's members */ GroupMemberResponseList;
export type GetGroupsByGroupSlugMembersApiArg = {
  groupSlug: Slug;
};
export type PatchGroupsByGroupSlugMembersApiResponse =
  /** status 200 The group's members were updated */ GroupMemberPatchRequestList;
export type PatchGroupsByGroupSlugMembersApiArg = {
  groupSlug: Slug;
  groupMemberPatchRequestList: GroupMemberPatchRequestList;
};
export type DeleteGroupsByGroupSlugMembersAndUserIdApiResponse =
  /** status 204 The member was removed or wasn't part of group's members. */ void;
export type DeleteGroupsByGroupSlugMembersAndUserIdApiArg = {
  groupSlug: Slug;
  /** This is user's KeyCloak ID */
  userId: string;
};
export type GetNamespacesApiResponse =
  /** status 200 List of namespaces */ NamespaceResponseList;
export type GetNamespacesApiArg = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  perPage?: number;
};
export type GetNamespacesByGroupSlugApiResponse =
  /** status 200 The namespace */ NamespaceResponse;
export type GetNamespacesByGroupSlugApiArg = {
  groupSlug: Slug;
};
export type Ulid = string;
export type NamespaceName = string;
export type Slug = string;
export type CreationDate = string;
export type KeycloakId = string;
export type Description = string;
export type GroupResponse = {
  id: Ulid;
  name: NamespaceName;
  slug: Slug;
  creation_date: CreationDate;
  created_by: KeycloakId;
  description?: Description;
};
export type GroupResponseList = GroupResponse[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type GroupPostRequest = {
  name: NamespaceName;
  slug: Slug;
  description?: Description;
};
export type GroupPatchRequest = {
  name?: NamespaceName;
  slug?: Slug;
  description?: Description;
};
export type UserId = string;
export type UserEmail = string;
export type UserFirstLastName = string;
export type GroupRole = "editor" | "owner" | "viewer";
export type GroupMemberResponse = {
  id: UserId;
  email?: UserEmail;
  first_name?: UserFirstLastName;
  last_name?: UserFirstLastName;
  role: GroupRole;
};
export type GroupMemberResponseList = GroupMemberResponse[];
export type GroupMemberPatchRequest = {
  id: UserId;
  role: GroupRole;
};
export type GroupMemberPatchRequestList = GroupMemberPatchRequest[];
export type NamespaceKind = "group" | "user";
export type NamespaceResponse = {
  id: Ulid;
  name?: NamespaceName;
  slug: Slug;
  creation_date?: CreationDate;
  created_by?: KeycloakId;
  namespace_kind: NamespaceKind;
};
export type NamespaceResponseList = NamespaceResponse[];
export const {
  useGetGroupsQuery,
  usePostGroupsMutation,
  useGetGroupsByGroupSlugQuery,
  usePatchGroupsByGroupSlugMutation,
  useDeleteGroupsByGroupSlugMutation,
  useGetGroupsByGroupSlugMembersQuery,
  usePatchGroupsByGroupSlugMembersMutation,
  useDeleteGroupsByGroupSlugMembersAndUserIdMutation,
  useGetNamespacesQuery,
  useGetNamespacesByGroupSlugQuery,
} = injectedRtkApi;
