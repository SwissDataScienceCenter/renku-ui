import { projectV2Api as api } from "./projectV2.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNamespaces: build.query<GetNamespacesApiResponse, GetNamespacesApiArg>({
      query: (queryArg) => ({
        url: `/namespaces`,
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
    }),
    postNamespaces: build.mutation<
      PostNamespacesApiResponse,
      PostNamespacesApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces`,
        method: "POST",
        body: queryArg.namespacePost,
      }),
    }),
    getNamespacesByNamespaceSlug: build.query<
      GetNamespacesByNamespaceSlugApiResponse,
      GetNamespacesByNamespaceSlugApiArg
    >({
      query: (queryArg) => ({ url: `/namespaces/${queryArg.namespaceSlug}` }),
    }),
    patchNamespacesByNamespaceSlug: build.mutation<
      PatchNamespacesByNamespaceSlugApiResponse,
      PatchNamespacesByNamespaceSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.namespaceSlug}`,
        method: "PATCH",
        body: queryArg.namespacePatch,
      }),
    }),
    deleteNamespacesByNamespaceSlug: build.mutation<
      DeleteNamespacesByNamespaceSlugApiResponse,
      DeleteNamespacesByNamespaceSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.namespaceSlug}`,
        method: "DELETE",
      }),
    }),
    getNamespacesByNamespaceSlugMembers: build.query<
      GetNamespacesByNamespaceSlugMembersApiResponse,
      GetNamespacesByNamespaceSlugMembersApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.namespaceSlug}/members`,
      }),
    }),
    patchNamespacesByNamespaceSlugMembers: build.mutation<
      PatchNamespacesByNamespaceSlugMembersApiResponse,
      PatchNamespacesByNamespaceSlugMembersApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.namespaceSlug}/members`,
        method: "PATCH",
        body: queryArg.membersWithRoles,
      }),
    }),
    deleteNamespacesByNamespaceSlugMembersAndMemberId: build.mutation<
      DeleteNamespacesByNamespaceSlugMembersAndMemberIdApiResponse,
      DeleteNamespacesByNamespaceSlugMembersAndMemberIdApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg.namespaceSlug}/members/${queryArg.memberId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectAndNamespaceApi };
export type GetNamespacesApiResponse =
  /** status 200 List of namespaces */ NamespacesList;
export type GetNamespacesApiArg = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  perPage?: number;
};
export type PostNamespacesApiResponse =
  /** status 201 The namespace was created */ Namespace;
export type PostNamespacesApiArg = {
  namespacePost: NamespacePost;
};
export type GetNamespacesByNamespaceSlugApiResponse =
  /** status 200 The namespace */ Namespace;
export type GetNamespacesByNamespaceSlugApiArg = {
  namespaceSlug: string;
};
export type PatchNamespacesByNamespaceSlugApiResponse =
  /** status 200 The patched namespace */ Namespace;
export type PatchNamespacesByNamespaceSlugApiArg = {
  namespaceSlug: string;
  namespacePatch: NamespacePatch;
};
export type DeleteNamespacesByNamespaceSlugApiResponse =
  /** status 204 The namespace was removed or did not exist in the first place */ void;
export type DeleteNamespacesByNamespaceSlugApiArg = {
  namespaceSlug: string;
};
export type GetNamespacesByNamespaceSlugMembersApiResponse =
  /** status 200 The namespace's members */ FullUsersWithRoles;
export type GetNamespacesByNamespaceSlugMembersApiArg = {
  namespaceSlug: string;
};
export type PatchNamespacesByNamespaceSlugMembersApiResponse =
  /** status 200 The namespace's members were updated */ void;
export type PatchNamespacesByNamespaceSlugMembersApiArg = {
  namespaceSlug: string;
  membersWithRoles: MembersWithRoles;
};
export type DeleteNamespacesByNamespaceSlugMembersAndMemberIdApiResponse =
  /** status 204 The member was removed or wasn't part of namespace's members. */ void;
export type DeleteNamespacesByNamespaceSlugMembersAndMemberIdApiArg = {
  namespaceSlug: string;
  /** This is user's KeyCloak ID */
  memberId: string;
};
export type Ulid = string;
export type Name = string;
export type Slug = string;
export type CreationDate = string;
export type KeyCloakId = string;
export type Member = {
  id: KeyCloakId;
};
export type Description = string;
export type Namespace = {
  id: Ulid;
  name: Name;
  slug?: Slug;
  creation_date: CreationDate;
  created_by: Member;
  description?: Description;
};
export type NamespacesList = Namespace[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type NamespacePost = {
  name: Name;
  slug?: Slug;
  description?: Description;
};
export type NamespacePatch = {
  name?: Name;
  slug?: Slug;
  description?: Description;
};
export type UserId = string;
export type UserEmail = string;
export type UserFirstLastName = string;
export type UserWithId = {
  id: UserId;
  email?: UserEmail;
  first_name?: UserFirstLastName;
  last_name?: UserFirstLastName;
};
export type Role = "member" | "owner";
export type FullUserWithRole = {
  member: UserWithId;
  role: Role;
};
export type FullUsersWithRoles = FullUserWithRole[];
export type MemberWithRole = {
  member: Member;
  role: Role;
};
export type MembersWithRoles = MemberWithRole[];
export const {
  useGetNamespacesQuery,
  usePostNamespacesMutation,
  useGetNamespacesByNamespaceSlugQuery,
  usePatchNamespacesByNamespaceSlugMutation,
  useDeleteNamespacesByNamespaceSlugMutation,
  useGetNamespacesByNamespaceSlugMembersQuery,
  usePatchNamespacesByNamespaceSlugMembersMutation,
  useDeleteNamespacesByNamespaceSlugMembersAndMemberIdMutation,
} = injectedRtkApi;
