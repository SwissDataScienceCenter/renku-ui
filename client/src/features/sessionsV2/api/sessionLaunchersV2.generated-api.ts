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
    getBuildsByBuildId: build.query<
      GetBuildsByBuildIdApiResponse,
      GetBuildsByBuildIdApiArg
    >({
      query: (queryArg) => ({ url: `/builds/${queryArg.buildId}` }),
    }),
    patchBuildsByBuildId: build.mutation<
      PatchBuildsByBuildIdApiResponse,
      PatchBuildsByBuildIdApiArg
    >({
      query: (queryArg) => ({
        url: `/builds/${queryArg.buildId}`,
        method: "PATCH",
        body: queryArg.buildPatch,
      }),
    }),
    getBuildsByBuildIdLogs: build.query<
      GetBuildsByBuildIdLogsApiResponse,
      GetBuildsByBuildIdLogsApiArg
    >({
      query: (queryArg) => ({
        url: `/builds/${queryArg.buildId}/logs`,
        params: { max_lines: queryArg.maxLines },
      }),
    }),
    getEnvironmentsByEnvironmentIdBuilds: build.query<
      GetEnvironmentsByEnvironmentIdBuildsApiResponse,
      GetEnvironmentsByEnvironmentIdBuildsApiArg
    >({
      query: (queryArg) => ({
        url: `/environments/${queryArg.environmentId}/builds`,
      }),
    }),
    postEnvironmentsByEnvironmentIdBuilds: build.mutation<
      PostEnvironmentsByEnvironmentIdBuildsApiResponse,
      PostEnvironmentsByEnvironmentIdBuildsApiArg
    >({
      query: (queryArg) => ({
        url: `/environments/${queryArg.environmentId}/builds`,
        method: "POST",
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
export type GetBuildsByBuildIdApiResponse =
  /** status 200 The container image build */ Build;
export type GetBuildsByBuildIdApiArg = {
  buildId: Ulid;
};
export type PatchBuildsByBuildIdApiResponse =
  /** status 200 The updated container image build */ Build;
export type PatchBuildsByBuildIdApiArg = {
  buildId: Ulid;
  buildPatch: BuildPatch;
};
export type GetBuildsByBuildIdLogsApiResponse =
  /** status 200 The build logs */ BuildLogs;
export type GetBuildsByBuildIdLogsApiArg = {
  buildId: Ulid;
  /** The maximum number of most-recent lines to return for each container */
  maxLines?: number;
};
export type GetEnvironmentsByEnvironmentIdBuildsApiResponse =
  /** status 200 List of container image builds */ BuildList;
export type GetEnvironmentsByEnvironmentIdBuildsApiArg = {
  environmentId: Ulid;
};
export type PostEnvironmentsByEnvironmentIdBuildsApiResponse =
  /** status 201 The build was created */ Build;
export type PostEnvironmentsByEnvironmentIdBuildsApiArg = {
  environmentId: Ulid;
};
export type Ulid = string;
export type SessionName = string;
export type CreationDate = string;
export type Description = string;
export type DefaultUrl = string;
export type EnvironmentUid = number;
export type EnvironmentGid = number;
export type EnvironmentWorkingDirectory = string;
export type EnvironmentMountDirectory = string;
export type EnvironmentPort = number;
export type EnvironmentCommand = string[];
export type EnvironmentArgs = string[];
export type IsArchived = boolean;
export type StripPathPrefix = boolean;
export type EnvironmentWithoutContainerImage = {
  id: Ulid;
  name: SessionName;
  creation_date: CreationDate;
  description?: Description;
  default_url: DefaultUrl;
  uid: EnvironmentUid;
  gid: EnvironmentGid;
  working_directory?: EnvironmentWorkingDirectory;
  mount_directory?: EnvironmentMountDirectory;
  port: EnvironmentPort;
  command?: EnvironmentCommand;
  args?: EnvironmentArgs;
  is_archived?: IsArchived;
  strip_path_prefix?: StripPathPrefix;
};
export type ContainerImage = string;
export type Environment = EnvironmentWithoutContainerImage & {
  container_image: ContainerImage;
};
export type EnvironmentList = Environment[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type EnvironmentImageSourceImage = "image";
export type EnvironmentPost = {
  name: SessionName;
  description?: Description;
  container_image: ContainerImage;
  default_url?: DefaultUrl;
  uid?: EnvironmentUid;
  gid?: EnvironmentGid;
  working_directory?: EnvironmentWorkingDirectory;
  mount_directory?: EnvironmentMountDirectory;
  port?: EnvironmentPort;
  command?: EnvironmentCommand;
  args?: EnvironmentArgs;
  is_archived?: IsArchived;
  environment_image_source: EnvironmentImageSourceImage;
  strip_path_prefix?: StripPathPrefix;
};
export type EnvironmentWorkingDirectoryPatch = string;
export type EnvironmentMountDirectoryPatch = string;
export type EnvironmentPatchCommand = string[] | null;
export type EnvironmentPatchArgs = string[] | null;
export type IsArchivedPatch = boolean;
export type StripPathPrefixPatch = boolean;
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
  command?: EnvironmentPatchCommand;
  args?: EnvironmentPatchArgs;
  is_archived?: IsArchivedPatch;
  strip_path_prefix?: StripPathPrefixPatch;
};
export type EnvironmentKind = "GLOBAL" | "CUSTOM";
export type EnvironmentWithImageGet = Environment & {
  environment_image_source: EnvironmentImageSourceImage;
  environment_kind: EnvironmentKind;
};
export type Repository = string;
export type BuildPlatform = "linux/amd64" | "linux/arm64";
export type BuildPlatforms = BuildPlatform[];
export type BuilderVariant = string;
export type FrontendVariant = string;
export type RepositoryRevision = string;
export type BuildContextDir = string;
export type BuildParameters = {
  repository: Repository;
  platforms?: BuildPlatforms;
  builder_variant: BuilderVariant;
  frontend_variant: FrontendVariant;
  repository_revision?: RepositoryRevision;
  context_dir?: BuildContextDir;
};
export type EnvironmentImageSourceBuild = "build";
export type EnvironmentWithBuildGet = EnvironmentWithoutContainerImage & {
  container_image?: ContainerImage;
  build_parameters: BuildParameters;
  environment_image_source: EnvironmentImageSourceBuild;
  environment_kind: EnvironmentKind;
};
export type EnvironmentGetInLauncher =
  | EnvironmentWithImageGet
  | EnvironmentWithBuildGet;
export type ResourceClassId = number | null;
export type DiskStorage = number;
export type EnvVar = {
  name: string;
  value?: string;
};
export type EnvVariables = EnvVar[];
export type SessionLauncher = {
  id: Ulid;
  project_id: Ulid;
  name: SessionName;
  creation_date: CreationDate;
  description?: Description;
  environment: EnvironmentGetInLauncher;
  resource_class_id: ResourceClassId;
  disk_storage?: DiskStorage;
  env_variables?: EnvVariables;
};
export type SessionLaunchersList = SessionLauncher[];
export type EnvironmentPostInLauncherHelper = EnvironmentPost & {
  environment_kind: EnvironmentKind;
};
export type BuildParametersPost = BuildParameters & {
  environment_image_source: EnvironmentImageSourceBuild;
};
export type EnvironmentPostInLauncher =
  | EnvironmentPostInLauncherHelper
  | BuildParametersPost;
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
  env_variables?: EnvVariables;
  environment: EnvironmentPostInLauncher | EnvironmentIdOnlyPost;
};
export type DiskStoragePatch = number | null;
export type EnvironmentImageSource =
  | EnvironmentImageSourceImage
  | EnvironmentImageSourceBuild;
export type RepositoryRevisionPatch = string;
export type BuildContextDirPatch = string;
export type BuildParametersPatch = {
  repository?: Repository;
  platforms?: BuildPlatforms;
  builder_variant?: BuilderVariant;
  frontend_variant?: FrontendVariant;
  repository_revision?: RepositoryRevisionPatch;
  context_dir?: BuildContextDirPatch;
};
export type EnvironmentPatchInLauncher = EnvironmentPatch & {
  environment_kind?: EnvironmentKind;
  environment_image_source?: EnvironmentImageSource;
  build_parameters?: BuildParametersPatch;
};
export type EnvironmentIdOnlyPatch = {
  id?: EnvironmentId;
};
export type SessionLauncherPatch = {
  name?: SessionName;
  description?: Description;
  resource_class_id?: ResourceClassId;
  disk_storage?: DiskStoragePatch;
  env_variables?: EnvVariables;
  environment?: EnvironmentPatchInLauncher | EnvironmentIdOnlyPatch;
};
export type ErrorReason = string;
export type BuildCommonPart = {
  id: Ulid;
  environment_id: Ulid;
  created_at: CreationDate;
  error_reason?: ErrorReason;
};
export type BuildNotCompletedPart = {
  status: "in_progress" | "failed" | "cancelled";
};
export type BuildResult = {
  image: ContainerImage;
  completed_at: CreationDate;
  repository_url: string;
  repository_git_commit_sha: string;
};
export type BuildCompletedPart = {
  status: "succeeded";
  result: BuildResult;
};
export type Build = BuildCommonPart &
  (BuildNotCompletedPart | BuildCompletedPart);
export type BuildPatch = {
  status?: "cancelled";
};
export type BuildLogs = {
  [key: string]: string;
};
export type BuildList = Build[];
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
  useGetBuildsByBuildIdQuery,
  usePatchBuildsByBuildIdMutation,
  useGetBuildsByBuildIdLogsQuery,
  useGetEnvironmentsByEnvironmentIdBuildsQuery,
  usePostEnvironmentsByEnvironmentIdBuildsMutation,
} = injectedRtkApi;
