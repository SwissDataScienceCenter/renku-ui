import { projectV2EmptyApi as api } from "./projectV2-empty.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: `/projects`,
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
    }),
    postProjects: build.mutation<PostProjectsApiResponse, PostProjectsApiArg>({
      query: (queryArg) => ({
        url: `/projects`,
        method: "POST",
        body: queryArg.projectPost,
      }),
    }),
    getProjectsByProjectId: build.query<
      GetProjectsByProjectIdApiResponse,
      GetProjectsByProjectIdApiArg
    >({
      query: (queryArg) => ({ url: `/projects/${queryArg.projectId}` }),
    }),
    patchProjectsByProjectId: build.mutation<
      PatchProjectsByProjectIdApiResponse,
      PatchProjectsByProjectIdApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}`,
        method: "PATCH",
        body: queryArg.projectPatch,
        headers: { "If-Match": queryArg["If-Match"] },
      }),
    }),
    deleteProjectsByProjectId: build.mutation<
      DeleteProjectsByProjectIdApiResponse,
      DeleteProjectsByProjectIdApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}`,
        method: "DELETE",
      }),
    }),
    getProjectsByProjectIdMembers: build.query<
      GetProjectsByProjectIdMembersApiResponse,
      GetProjectsByProjectIdMembersApiArg
    >({
      query: (queryArg) => ({ url: `/projects/${queryArg.projectId}/members` }),
    }),
    patchProjectsByProjectIdMembers: build.mutation<
      PatchProjectsByProjectIdMembersApiResponse,
      PatchProjectsByProjectIdMembersApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/members`,
        method: "PATCH",
        body: queryArg.membersWithRoles,
      }),
    }),
    deleteProjectsByProjectIdMembersAndMemberId: build.mutation<
      DeleteProjectsByProjectIdMembersAndMemberIdApiResponse,
      DeleteProjectsByProjectIdMembersAndMemberIdApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/members/${queryArg.memberId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectV2Api };
export type GetProjectsApiResponse =
  /** status 200 List of projects */ ProjectsList;
export type GetProjectsApiArg = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  perPage?: number;
};
export type PostProjectsApiResponse =
  /** status 201 The project was created */ Project;
export type PostProjectsApiArg = {
  projectPost: ProjectPost;
};
export type GetProjectsByProjectIdApiResponse =
  /** status 200 The project */ Project;
export type GetProjectsByProjectIdApiArg = {
  projectId: string;
};
export type PatchProjectsByProjectIdApiResponse =
  /** status 200 The patched project */ Project;
export type PatchProjectsByProjectIdApiArg = {
  projectId: string;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match"?: ETag;
  projectPatch: ProjectPatch;
};
export type DeleteProjectsByProjectIdApiResponse =
  /** status 204 The project was removed or did not exist in the first place */ void;
export type DeleteProjectsByProjectIdApiArg = {
  projectId: string;
};
export type GetProjectsByProjectIdMembersApiResponse =
  /** status 200 The project's members */ FullUsersWithRoles;
export type GetProjectsByProjectIdMembersApiArg = {
  projectId: string;
};
export type PatchProjectsByProjectIdMembersApiResponse =
  /** status 200 The project's members were updated */ void;
export type PatchProjectsByProjectIdMembersApiArg = {
  projectId: string;
  membersWithRoles: MembersWithRoles;
};
export type DeleteProjectsByProjectIdMembersAndMemberIdApiResponse =
  /** status 204 The member was removed or wasn't part of project's members. */ void;
export type DeleteProjectsByProjectIdMembersAndMemberIdApiArg = {
  projectId: string;
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
export type Repository = string;
export type RepositoriesList = Repository[];
export type Visibility = "private" | "public";
export type Description = string;
export type ETag = string;
export type Project = {
  id: Ulid;
  name: Name;
  slug?: Slug;
  creation_date: CreationDate;
  created_by: Member;
  repositories?: RepositoriesList;
  visibility: Visibility;
  description?: Description;
  etag?: ETag;
};
export type ProjectsList = Project[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type ProjectPost = {
  name: Name;
  slug?: Slug;
  repositories?: RepositoriesList;
  visibility?: Visibility;
  description?: Description;
};
export type ProjectPatch = {
  name?: Name;
  repositories?: RepositoriesList;
  visibility?: Visibility;
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
  useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
} = injectedRtkApi;
