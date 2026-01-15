import { projectV2Api as api } from "./projectV2.api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroups: build.query<GetGroupsApiResponse, GetGroupsApiArg>({
      query: (queryArg) => ({
        url: `/groups`,
        params: {
          page: queryArg.page,
          per_page: queryArg.perPage,
          direct_member: queryArg.directMember,
        },
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
    getGroupsByGroupSlugPermissions: build.query<
      GetGroupsByGroupSlugPermissionsApiResponse,
      GetGroupsByGroupSlugPermissionsApiArg
    >({
      query: (queryArg) => ({
        url: `/groups/${queryArg.groupSlug}/permissions`,
      }),
    }),
    getNamespaces: build.query<GetNamespacesApiResponse, GetNamespacesApiArg>({
      query: (queryArg) => ({
        url: `/namespaces`,
        params: {
          page: queryArg.page,
          per_page: queryArg.perPage,
          minimum_role: queryArg.minimumRole,
          kinds: queryArg.kinds,
        },
      }),
    }),
    getNamespacesByNamespaceSlug: build.query<
      GetNamespacesByNamespaceSlugApiResponse,
      GetNamespacesByNamespaceSlugApiArg
    >({
      query: (queryArg) => ({ url: `/namespaces/${queryArg.namespaceSlug}` }),
    }),
    getNamespacesByFirstSlugAndSecondSlug: build.query<
      GetNamespacesByFirstSlugAndSecondSlugApiResponse,
      GetNamespacesByFirstSlugAndSecondSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.firstSlug}/${queryArg.secondSlug}`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectAndNamespaceApi };
export type GetGroupsApiResponse =
  /** status 200 List of groups */ GroupResponseList;
export type GetGroupsApiArg = {
  /** the current page in paginated response */
  page?: PaginationRequestPage;
  /** the number of results per page in a paginated response */
  perPage?: PaginationRequestPerPage;
  /** A flag to filter for where the user is a direct member. */
  directMember?: boolean;
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
export type GetGroupsByGroupSlugPermissionsApiResponse =
  /** status 200 The set of permissions. */ GroupPermissions;
export type GetGroupsByGroupSlugPermissionsApiArg = {
  groupSlug: Slug;
};
export type GetNamespacesApiResponse =
  /** status 200 List of namespaces */ NamespaceResponseList;
export type GetNamespacesApiArg = {
  /** the current page in paginated response */
  page?: PaginationRequestPage;
  /** the number of results per page in a paginated response */
  perPage?: PaginationRequestPerPage;
  /** The minimum role the user should have in the resources returned */
  minimumRole?: GroupRole;
  /** environment kinds query parameter */
  kinds?: NamespaceGetQueryKind;
};
export type GetNamespacesByNamespaceSlugApiResponse =
  /** status 200 The namespace */ NamespaceResponse;
export type GetNamespacesByNamespaceSlugApiArg = {
  namespaceSlug: Slug;
};
export type GetNamespacesByFirstSlugAndSecondSlugApiResponse =
  /** status 200 The namespace */ NamespaceResponse;
export type GetNamespacesByFirstSlugAndSecondSlugApiArg = {
  firstSlug: Slug;
  secondSlug: Slug;
};
export type Ulid = string;
export type NamespaceName = string;
export type SlugResponse = string;
export type CreationDate = string;
export type KeycloakId = string;
export type Description = string;
export type GroupResponse = {
  id: Ulid;
  name: NamespaceName;
  slug: SlugResponse;
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
export type PaginationRequestPage = number;
export type PaginationRequestPerPage = number;
export type Slug = string;
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
export type UserFirstLastName = string;
export type GroupRole = "owner" | "editor" | "viewer";
export type GroupMemberResponse = {
  id: UserId;
  namespace?: Slug;
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
export type GroupPermissions = {
  /** The user can edit the group */
  write?: boolean;
  /** The user can delete the group */
  delete?: boolean;
  /** The user can manage group members */
  change_membership?: boolean;
};
export type NamespaceKind = "group" | "user" | "project";
export type NamespaceResponse = {
  id: Ulid;
  name?: NamespaceName;
  slug: SlugResponse;
  creation_date?: CreationDate;
  created_by?: KeycloakId;
  namespace_kind: NamespaceKind;
  path: SlugResponse;
};
export type NamespaceResponseList = NamespaceResponse[];
export type NamespaceGetQueryKind = NamespaceKind[];
export const {
  useGetGroupsQuery,
  usePostGroupsMutation,
  useGetGroupsByGroupSlugQuery,
  usePatchGroupsByGroupSlugMutation,
  useDeleteGroupsByGroupSlugMutation,
  useGetGroupsByGroupSlugMembersQuery,
  usePatchGroupsByGroupSlugMembersMutation,
  useDeleteGroupsByGroupSlugMembersAndUserIdMutation,
  useGetGroupsByGroupSlugPermissionsQuery,
  useGetNamespacesQuery,
  useGetNamespacesByNamespaceSlugQuery,
  useGetNamespacesByFirstSlugAndSecondSlugQuery,
} = injectedRtkApi;
