import { projectV2EmptyApi as api } from "./projectV2-empty.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: `/projects`,
        params: { params: queryArg.params },
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
    getProjectsByNamespaceAndSlug: build.query<
      GetProjectsByNamespaceAndSlugApiResponse,
      GetProjectsByNamespaceAndSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg["namespace"]}/projects/${queryArg.slug}`,
      }),
    }),
    getProjectsByProjectIdCopies: build.query<
      GetProjectsByProjectIdCopiesApiResponse,
      GetProjectsByProjectIdCopiesApiArg
    >({
      query: (queryArg) => ({ url: `/projects/${queryArg.projectId}/copies` }),
    }),
    postProjectsByProjectIdCopies: build.mutation<
      PostProjectsByProjectIdCopiesApiResponse,
      PostProjectsByProjectIdCopiesApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/copies`,
        method: "POST",
        body: queryArg.projectPost,
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
        body: queryArg.projectMemberListPatchRequest,
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
    getProjectsByProjectIdPermissions: build.query<
      GetProjectsByProjectIdPermissionsApiResponse,
      GetProjectsByProjectIdPermissionsApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/permissions`,
      }),
    }),
    getProjectsByProjectIdDataConnectorLinks: build.query<
      GetProjectsByProjectIdDataConnectorLinksApiResponse,
      GetProjectsByProjectIdDataConnectorLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/data_connector_links`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectV2Api };
export type GetProjectsApiResponse =
  /** status 200 List of projects */ ProjectsList;
export type GetProjectsApiArg = {
  /** query parameters */
  params?: ProjectGetQuery;
};
export type PostProjectsApiResponse =
  /** status 201 The project was created */ Project;
export type PostProjectsApiArg = {
  projectPost: ProjectPost;
};
export type GetProjectsByProjectIdApiResponse =
  /** status 200 The project */ Project;
export type GetProjectsByProjectIdApiArg = {
  projectId: Ulid;
};
export type PatchProjectsByProjectIdApiResponse =
  /** status 200 The patched project */ Project;
export type PatchProjectsByProjectIdApiArg = {
  projectId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  projectPatch: ProjectPatch;
};
export type DeleteProjectsByProjectIdApiResponse =
  /** status 204 The project was removed or did not exist in the first place */ void;
export type DeleteProjectsByProjectIdApiArg = {
  projectId: Ulid;
};
export type GetProjectsByNamespaceAndSlugApiResponse =
  /** status 200 The project */ Project;
export type GetProjectsByNamespaceAndSlugApiArg = {
  namespace: string;
  slug: string;
};
export type GetProjectsByProjectIdCopiesApiResponse =
  /** status 200 The list of projects */ ProjectsList;
export type GetProjectsByProjectIdCopiesApiArg = {
  projectId: Ulid;
};
export type PostProjectsByProjectIdCopiesApiResponse =
  /** status 201 The project was created */ Project;
export type PostProjectsByProjectIdCopiesApiArg = {
  projectId: Ulid;
  projectPost: ProjectPost;
};
export type GetProjectsByProjectIdMembersApiResponse =
  /** status 200 The project's members */ ProjectMemberListResponse;
export type GetProjectsByProjectIdMembersApiArg = {
  projectId: Ulid;
};
export type PatchProjectsByProjectIdMembersApiResponse =
  /** status 200 The project's members were updated */ void;
export type PatchProjectsByProjectIdMembersApiArg = {
  projectId: Ulid;
  projectMemberListPatchRequest: ProjectMemberListPatchRequest;
};
export type DeleteProjectsByProjectIdMembersAndMemberIdApiResponse =
  /** status 204 The member was removed or wasn't part of project's members. */ void;
export type DeleteProjectsByProjectIdMembersAndMemberIdApiArg = {
  projectId: Ulid;
  /** This is user's KeyCloak ID */
  memberId: UserId;
};
export type GetProjectsByProjectIdPermissionsApiResponse =
  /** status 200 The set of permissions. */ ProjectPermissions;
export type GetProjectsByProjectIdPermissionsApiArg = {
  projectId: Ulid;
};
export type GetProjectsByProjectIdDataConnectorLinksApiResponse =
  /** status 200 List of data connector to project links */ DataConnectorToProjectLinksList;
export type GetProjectsByProjectIdDataConnectorLinksApiArg = {
  /** the ID of the project */
  projectId: Ulid;
};
export type Ulid = string;
export type ProjectName = string;
export type Slug = string;
export type LegacySlug = string;
export type CreationDate = string;
export type UserId = string;
export type UpdatedAt = string;
export type Repository = string;
export type RepositoriesList = Repository[];
export type Visibility = "private" | "public";
export type Description = string;
export type ETag = string;
export type Keyword = string;
export type KeywordsList = Keyword[];
export type Project = {
  id: Ulid;
  name: ProjectName;
  namespace: Slug;
  slug: LegacySlug;
  creation_date: CreationDate;
  created_by: UserId;
  updated_at?: UpdatedAt;
  repositories?: RepositoriesList;
  visibility: Visibility;
  description?: Description;
  etag?: ETag;
  keywords?: KeywordsList;
  template_id?: Ulid;
};
export type ProjectsList = Project[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type PaginationRequest = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  per_page?: number;
};
export type ProjectGetQuery = PaginationRequest & {
  /** A namespace, used as a filter. */
  namespace?: string;
  /** A flag to filter projects where the user is a direct member. */
  direct_member?: boolean;
};
export type ProjectPost = {
  name: ProjectName;
  namespace: Slug;
  slug?: Slug;
  repositories?: RepositoriesList;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type ProjectPatch = {
  name?: ProjectName;
  namespace?: Slug;
  repositories?: RepositoriesList;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type UserFirstLastName = string;
export type Role = "viewer" | "editor" | "owner";
export type ProjectMemberResponse = {
  id: UserId;
  namespace?: LegacySlug;
  first_name?: UserFirstLastName;
  last_name?: UserFirstLastName;
  role: Role;
};
export type ProjectMemberListResponse = ProjectMemberResponse[];
export type ProjectMemberPatchRequest = {
  id: UserId;
  role: Role;
};
export type ProjectMemberListPatchRequest = ProjectMemberPatchRequest[];
export type ProjectPermissions = {
  /** The user can edit the project */
  write?: boolean;
  /** The user can delete the project */
  delete?: boolean;
  /** The user can manage project members */
  change_membership?: boolean;
};
export type DataConnectorToProjectLink = {
  id: Ulid;
  data_connector_id: Ulid;
  project_id: Ulid;
  creation_date: CreationDate;
  created_by: UserId;
};
export type DataConnectorToProjectLinksList = DataConnectorToProjectLink[];
export const {
  useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByNamespaceAndSlugQuery,
  useGetProjectsByProjectIdCopiesQuery,
  usePostProjectsByProjectIdCopiesMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useGetProjectsByProjectIdPermissionsQuery,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
} = injectedRtkApi;
