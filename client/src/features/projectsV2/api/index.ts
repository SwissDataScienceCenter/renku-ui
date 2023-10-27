export { projectV2Api } from "./projectV2.enhanced-api";

export type {
  CreationDate,
  Description,
  ErrorResponse,
  Member,
  MemberWithRole,
  MembersWithRoles,
  Name,
  Project,
  ProjectsList,
  ProjectPatch,
  ProjectPost,
  RepositoriesList,
  Role,
  Slug,
  Ulid,
  UserId,
  Visibility,
} from "./projectV2.api";

export type {
  DeleteProjectsByProjectIdApiArg,
  DeleteProjectsByProjectIdApiResponse,
  DeleteProjectsByProjectIdMembersAndMemberIdApiArg,
  DeleteProjectsByProjectIdMembersAndMemberIdApiResponse,
  FullUsersWithRoles,
  GetProjectsByProjectIdApiArg,
  GetProjectsByProjectIdApiResponse,
  GetProjectsByProjectIdMembersApiArg,
  GetProjectsByProjectIdMembersApiResponse,
  GetProjectsApiResponse,
  GetProjectsApiArg,
  PatchProjectsByProjectIdApiResponse,
  PatchProjectsByProjectIdApiArg,
  PatchProjectsByProjectIdMembersApiArg,
  PatchProjectsByProjectIdMembersApiResponse,
  PostProjectsApiResponse,
  PostProjectsApiArg,
} from "./projectV2.api";

export {
  useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
} from "./projectV2.enhanced-api";

import type { ErrorResponse } from "./projectV2.api";

export function isErrorResponse(arg: unknown): arg is { data: ErrorResponse } {
  return (arg as { data: ErrorResponse }).data?.error != null;
}
