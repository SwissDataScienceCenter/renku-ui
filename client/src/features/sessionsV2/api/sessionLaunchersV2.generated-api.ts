import { sessionLaunchersV2EmptyApi as api } from "./sessionLaunchersV2.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEnvironments: build.query<
      GetEnvironmentsApiResponse,
      GetEnvironmentsApiArg
    >({
      query: (queryArg) => ({
        url: `/environments`,
        params: { get_environment_params: queryArg.getEnvironmentParams },
      }),
    }),
    postEnvironments: build.mutation<
      PostEnvironmentsApiResponse,
      PostEnvironmentsApiArg
    >({
      query: (queryArg) => ({
        url: `/environments`,
        method: "POST",
        body: queryArg.environmentPost,
      }),
    }),
    getEnvironmentsByEnvironmentId: build.query<
      GetEnvironmentsByEnvironmentIdApiResponse,
      GetEnvironmentsByEnvironmentIdApiArg
    >({
      query: (queryArg) => ({ url: `/environments/${queryArg.environmentId}` }),
    }),
    patchEnvironmentsByEnvironmentId: build.mutation<
      PatchEnvironmentsByEnvironmentIdApiResponse,
      PatchEnvironmentsByEnvironmentIdApiArg
    >({
      query: (queryArg) => ({
        url: `/environments/${queryArg.environmentId}`,
        method: "PATCH",
        body: queryArg.environmentPatch,
      }),
    }),
    deleteEnvironmentsByEnvironmentId: build.mutation<
      DeleteEnvironmentsByEnvironmentIdApiResponse,
      DeleteEnvironmentsByEnvironmentIdApiArg
    >({
      query: (queryArg) => ({
        url: `/environments/${queryArg.environmentId}`,
        method: "DELETE",
      }),
    }),
    getSessionLaunchers: build.query<
      GetSessionLaunchersApiResponse,
      GetSessionLaunchersApiArg
    >({
      query: () => ({ url: `/session_launchers` }),
    }),
    postSessionLaunchers: build.mutation<
      PostSessionLaunchersApiResponse,
      PostSessionLaunchersApiArg
    >({
      query: (queryArg) => ({
        url: `/session_launchers`,
        method: "POST",
        body: queryArg.sessionLauncherPost,
      }),
    }),
    getSessionLaunchersByLauncherId: build.query<
      GetSessionLaunchersByLauncherIdApiResponse,
      GetSessionLaunchersByLauncherIdApiArg
    >({
      query: (queryArg) => ({
        url: `/session_launchers/${queryArg.launcherId}`,
      }),
    }),
    patchSessionLaunchersByLauncherId: build.mutation<
      PatchSessionLaunchersByLauncherIdApiResponse,
      PatchSessionLaunchersByLauncherIdApiArg
    >({
      query: (queryArg) => ({
        url: `/session_launchers/${queryArg.launcherId}`,
        method: "PATCH",
        body: queryArg.sessionLauncherPatch,
      }),
    }),
    deleteSessionLaunchersByLauncherId: build.mutation<
      DeleteSessionLaunchersByLauncherIdApiResponse,
      DeleteSessionLaunchersByLauncherIdApiArg
    >({
      query: (queryArg) => ({
        url: `/session_launchers/${queryArg.launcherId}`,
        method: "DELETE",
      }),
    }),
    getProjectsByProjectIdSessionLaunchers: build.query<
      GetProjectsByProjectIdSessionLaunchersApiResponse,
      GetProjectsByProjectIdSessionLaunchersApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/session_launchers`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as sessionLaunchersV2GeneratedApi };
export type GetEnvironmentsApiResponse =
  /** status 200 List of global environments */ EnvironmentList;
export type GetEnvironmentsApiArg = {
  getEnvironmentParams?: {
    /** Whether to return archived environments or not */
    include_archived?: boolean;
  };
};
export type PostEnvironmentsApiResponse =
  /** status 201 The session environment was created */ Environment;
export type PostEnvironmentsApiArg = {
  environmentPost: EnvironmentPost;
};
export type GetEnvironmentsByEnvironmentIdApiResponse =
  /** status 200 The session environment */ Environment;
export type GetEnvironmentsByEnvironmentIdApiArg = {
  environmentId: Ulid;
};
export type PatchEnvironmentsByEnvironmentIdApiResponse =
  /** status 200 The patched session environment */ Environment;
export type PatchEnvironmentsByEnvironmentIdApiArg = {
  environmentId: Ulid;
  environmentPatch: EnvironmentPatch;
};
export type DeleteEnvironmentsByEnvironmentIdApiResponse =
  /** status 204 The session environment was removed or did not exist in the first place */ void;
export type DeleteEnvironmentsByEnvironmentIdApiArg = {
  environmentId: Ulid;
};
export type GetSessionLaunchersApiResponse =
  /** status 200 List of sessions launchers */ SessionLaunchersList;
export type GetSessionLaunchersApiArg = void;
export type PostSessionLaunchersApiResponse =
  /** status 201 The session launcher was created */ SessionLauncher;
export type PostSessionLaunchersApiArg = {
  sessionLauncherPost: SessionLauncherPost;
};
export type GetSessionLaunchersByLauncherIdApiResponse =
  /** status 200 The session launcher */ SessionLauncher;
export type GetSessionLaunchersByLauncherIdApiArg = {
  launcherId: Ulid;
};
export type PatchSessionLaunchersByLauncherIdApiResponse =
  /** status 200 The patched session launcher */ SessionLauncher;
export type PatchSessionLaunchersByLauncherIdApiArg = {
  launcherId: Ulid;
  sessionLauncherPatch: SessionLauncherPatch;
};
export type DeleteSessionLaunchersByLauncherIdApiResponse =
  /** status 204 The session was removed or did not exist in the first place */ void;
export type DeleteSessionLaunchersByLauncherIdApiArg = {
  launcherId: Ulid;
};
export type GetProjectsByProjectIdSessionLaunchersApiResponse =
  /** status 200 List of sessions launchers */ SessionLaunchersList;
export type GetProjectsByProjectIdSessionLaunchersApiArg = {
  projectId: Ulid;
};
export type Ulid = string;
export type SessionName = string;
export type CreationDate = string;
export type Description = string;
export type ContainerImage = string;
export type DefaultUrl = string;
export type EnvironmentUid = number;
export type EnvironmentGid = number;
export type EnvironmentWorkingDirectory = string;
export type EnvironmentMountDirectory = string;
export type EnvironmentPort = number;
export type EnvironmentCommand = string[];
export type EnvironmentArgs = string[];
export type IsArchived = boolean;
export type Environment = {
  id: Ulid;
  name: SessionName;
  creation_date: CreationDate;
  description?: Description;
  container_image: ContainerImage;
  default_url: DefaultUrl;
  uid: EnvironmentUid;
  gid: EnvironmentGid;
  working_directory?: EnvironmentWorkingDirectory;
  mount_directory?: EnvironmentMountDirectory;
  port: EnvironmentPort;
  command?: EnvironmentCommand;
  args?: EnvironmentArgs;
  is_archived?: IsArchived;
};
export type EnvironmentList = Environment[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type EnvironmentPost = {
  name: SessionName;
  description?: Description;
  container_image: ContainerImage;
  default_url?: DefaultUrl & any;
  uid?: EnvironmentUid & any;
  gid?: EnvironmentGid & any;
  working_directory?: EnvironmentWorkingDirectory;
  mount_directory?: EnvironmentMountDirectory;
  port?: EnvironmentPort & any;
  command?: EnvironmentCommand;
  args?: EnvironmentArgs;
  is_archived?: IsArchived;
};
export type EnvironmentWorkingDirectoryPatch = string;
export type EnvironmentMountDirectoryPatch = string;
export type EnvironmentPatch = {
  name?: SessionName;
  description?: Description;
  container_image?: ContainerImage;
  default_url?: DefaultUrl;
  uid?: EnvironmentUid;
  gid?: EnvironmentGid;
  working_directory?: EnvironmentWorkingDirectoryPatch;
  mount_directory?: EnvironmentMountDirectoryPatch;
  port?: EnvironmentPort;
  command?: EnvironmentCommand;
  args?: EnvironmentArgs;
  is_archived?: IsArchived;
};
export type EnvironmentKind = "GLOBAL" | "CUSTOM";
export type EnvironmentGetInLauncher = Environment & {
  environment_kind: EnvironmentKind;
};
export type ResourceClassId = number | null;
export type DiskStorage = number;
export type SessionLauncher = {
  id: Ulid;
  project_id: Ulid;
  name: SessionName;
  creation_date: CreationDate;
  description?: Description;
  environment: EnvironmentGetInLauncher;
  resource_class_id: ResourceClassId;
  disk_storage?: DiskStorage;
};
export type SessionLaunchersList = SessionLauncher[];
export type EnvironmentPostInLauncher = EnvironmentPost & {
  environment_kind: EnvironmentKind;
};
export type EnvironmentId = string;
export type EnvironmentIdOnlyPost = {
  id: EnvironmentId;
};
export type SessionLauncherPost = {
  name: SessionName;
  project_id: Ulid;
  description?: Description;
  resource_class_id?: ResourceClassId;
  disk_storage?: DiskStorage;
  environment: EnvironmentPostInLauncher | EnvironmentIdOnlyPost;
};
export type DiskStoragePatch = number | null;
export type EnvironmentPatchInLauncher = EnvironmentPatch & {
  environment_kind?: EnvironmentKind;
};
export type EnvironmentIdOnlyPatch = {
  id?: EnvironmentId;
};
export type SessionLauncherPatch = {
  name?: SessionName;
  description?: Description;
  resource_class_id?: ResourceClassId;
  disk_storage?: DiskStoragePatch;
  environment?: EnvironmentPatchInLauncher | EnvironmentIdOnlyPatch;
};
export const {
  useGetEnvironmentsQuery,
  usePostEnvironmentsMutation,
  useGetEnvironmentsByEnvironmentIdQuery,
  usePatchEnvironmentsByEnvironmentIdMutation,
  useDeleteEnvironmentsByEnvironmentIdMutation,
  useGetSessionLaunchersQuery,
  usePostSessionLaunchersMutation,
  useGetSessionLaunchersByLauncherIdQuery,
  usePatchSessionLaunchersByLauncherIdMutation,
  useDeleteSessionLaunchersByLauncherIdMutation,
  useGetProjectsByProjectIdSessionLaunchersQuery,
} = injectedRtkApi;
