import { sessionsV2EmptyApi as api } from "./sessionsV2.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotebooksImages: build.query<
      GetNotebooksImagesApiResponse,
      GetNotebooksImagesApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/images`,
        params: { image_url: queryArg.imageUrl },
      }),
    }),
    getNotebooksLogsByServerName: build.query<
      GetNotebooksLogsByServerNameApiResponse,
      GetNotebooksLogsByServerNameApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/logs/${queryArg.serverName}`,
        params: { max_lines: queryArg.maxLines },
      }),
    }),
    getNotebooksServerOptions: build.query<
      GetNotebooksServerOptionsApiResponse,
      GetNotebooksServerOptionsApiArg
    >({
      query: () => ({ url: `/notebooks/server_options` }),
    }),
    postNotebooksServers: build.mutation<
      PostNotebooksServersApiResponse,
      PostNotebooksServersApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/servers`,
        method: "POST",
        body: queryArg.launchNotebookRequestOld,
      }),
    }),
    getNotebooksServers: build.query<
      GetNotebooksServersApiResponse,
      GetNotebooksServersApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/servers`,
        params: {
          project: queryArg.project,
          commit_sha: queryArg.commitSha,
          namespace: queryArg["namespace"],
          branch: queryArg.branch,
        },
      }),
    }),
    deleteNotebooksServersByServerName: build.mutation<
      DeleteNotebooksServersByServerNameApiResponse,
      DeleteNotebooksServersByServerNameApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/servers/${queryArg.serverName}`,
        method: "DELETE",
        params: { forced: queryArg.forced },
      }),
    }),
    getNotebooksServersByServerName: build.query<
      GetNotebooksServersByServerNameApiResponse,
      GetNotebooksServersByServerNameApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/servers/${queryArg.serverName}`,
      }),
    }),
    patchNotebooksServersByServerName: build.mutation<
      PatchNotebooksServersByServerNameApiResponse,
      PatchNotebooksServersByServerNameApiArg
    >({
      query: (queryArg) => ({
        url: `/notebooks/servers/${queryArg.serverName}`,
        method: "PATCH",
        body: queryArg.patchServerRequest,
      }),
    }),
    postSessions: build.mutation<PostSessionsApiResponse, PostSessionsApiArg>({
      query: (queryArg) => ({
        url: `/sessions`,
        method: "POST",
        body: queryArg.sessionPostRequest,
      }),
    }),
    getSessions: build.query<GetSessionsApiResponse, GetSessionsApiArg>({
      query: () => ({ url: `/sessions` }),
    }),
    getSessionsBySessionId: build.query<
      GetSessionsBySessionIdApiResponse,
      GetSessionsBySessionIdApiArg
    >({
      query: (queryArg) => ({ url: `/sessions/${queryArg.sessionId}` }),
    }),
    deleteSessionsBySessionId: build.mutation<
      DeleteSessionsBySessionIdApiResponse,
      DeleteSessionsBySessionIdApiArg
    >({
      query: (queryArg) => ({
        url: `/sessions/${queryArg.sessionId}`,
        method: "DELETE",
      }),
    }),
    patchSessionsBySessionId: build.mutation<
      PatchSessionsBySessionIdApiResponse,
      PatchSessionsBySessionIdApiArg
    >({
      query: (queryArg) => ({
        url: `/sessions/${queryArg.sessionId}`,
        method: "PATCH",
        body: queryArg.sessionPatchRequest,
      }),
    }),
    getSessionsBySessionIdLogs: build.query<
      GetSessionsBySessionIdLogsApiResponse,
      GetSessionsBySessionIdLogsApiArg
    >({
      query: (queryArg) => ({
        url: `/sessions/${queryArg.sessionId}/logs`,
        params: { max_lines: queryArg.maxLines },
      }),
    }),
    getSessionsImages: build.query<
      GetSessionsImagesApiResponse,
      GetSessionsImagesApiArg
    >({
      query: (queryArg) => ({
        url: `/sessions/images`,
        params: { image_url: queryArg.imageUrl },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as sessionsV2GeneratedApi };
export type GetNotebooksImagesApiResponse =
  /** status 200 undefined */ ImageCheckResponse;
export type GetNotebooksImagesApiArg = {
  /** The Docker image URL (tag included) that should be fetched. */
  imageUrl: string;
};
export type GetNotebooksLogsByServerNameApiResponse =
  /** status 200 Server logs. An array of strings where each element is a line of the logs. */ ServerLogs;
export type GetNotebooksLogsByServerNameApiArg = {
  /** The name of the server whose logs should be fetched. */
  serverName: ServerName;
  /** The maximum number of (most recent) lines to return from the logs. */
  maxLines?: number;
};
export type GetNotebooksServerOptionsApiResponse =
  /** status 200 Server options such as CPU, memory, storage, etc. */ ServerOptionsEndpointResponse;
export type GetNotebooksServerOptionsApiArg = void;
export type PostNotebooksServersApiResponse =
  /** status 201 The project was created */ NotebookResponse;
export type PostNotebooksServersApiArg = {
  launchNotebookRequestOld: LaunchNotebookRequestOld;
};
export type GetNotebooksServersApiResponse =
  /** status 200 Map of all servers for a user. */ ServersGetResponse;
export type GetNotebooksServersApiArg = {
  project?: string;
  commitSha?: string;
  namespace?: string;
  branch?: string;
};
export type DeleteNotebooksServersByServerNameApiResponse =
  /** status 204 The server was stopped successfully. */ void;
export type DeleteNotebooksServersByServerNameApiArg = {
  /** The name of the server that should be deleted. */
  serverName: ServerName;
  /** If true, delete immediately disregarding the grace period
    of the underlying JupyterServer resource.
     */
  forced?: boolean;
};
export type GetNotebooksServersByServerNameApiResponse =
  /** status 200 Server properties. */ NotebookResponse;
export type GetNotebooksServersByServerNameApiArg = {
  /** The name of the server for which additional information is required. */
  serverName: ServerName;
};
export type PatchNotebooksServersByServerNameApiResponse =
  /** status 200 The server was patched successfully. */ NotebookResponse;
export type PatchNotebooksServersByServerNameApiArg = {
  /** The name of the server that should be patched. */
  serverName: ServerName;
  patchServerRequest: PatchServerRequest;
};
export type PostSessionsApiResponse =
  /** status 200 The session already exists */
  SessionResponse | /** status 201 The session was created */ SessionResponse;
export type PostSessionsApiArg = {
  sessionPostRequest: SessionPostRequest;
};
export type GetSessionsApiResponse =
  /** status 200 Information about the sessions */ SessionListResponse;
export type GetSessionsApiArg = void;
export type GetSessionsBySessionIdApiResponse =
  /** status 200 Information about the session */ SessionResponse;
export type GetSessionsBySessionIdApiArg = {
  /** The id of the session */
  sessionId: string;
};
export type DeleteSessionsBySessionIdApiResponse =
  /** status 204 The session was deleted or it never existed in the first place */ void;
export type DeleteSessionsBySessionIdApiArg = {
  /** The id of the session that should be deleted */
  sessionId: string;
};
export type PatchSessionsBySessionIdApiResponse =
  /** status 200 The session was patched */ SessionResponse;
export type PatchSessionsBySessionIdApiArg = {
  /** The id of the session */
  sessionId: string;
  sessionPatchRequest: SessionPatchRequest;
};
export type GetSessionsBySessionIdLogsApiResponse =
  /** status 200 The session logs */ SessionLogsResponse;
export type GetSessionsBySessionIdLogsApiArg = {
  /** The id of the session */
  sessionId: string;
  /** The maximum number of most-recent lines to return for each container */
  maxLines?: number;
};
export type GetSessionsImagesApiResponse =
  /** status 200 Information about the accessibility of the image */ ImageCheckResponse;
export type GetSessionsImagesApiArg = {
  /** The Docker image URL (tag included) that should be fetched. */
  imageUrl: string;
};
export type ImageConnectionStatus =
  | "connected"
  | "pending"
  | "invalid_credentials";
export type ImageConnection = {
  id: string;
  provider_id: string;
  status: ImageConnectionStatus;
};
export type ImageProvider = {
  id: string;
  name: string;
  url: string;
};
export type ImageCheckResponse = {
  /** Whether the image is accessible or not. */
  accessible: boolean;
  connection?: ImageConnection;
  provider?: ImageProvider;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type ServerLogs = {
  "jupyter-server"?: string;
  [key: string]: any;
};
export type ServerName = string;
export type Generated = {
  enabled: boolean;
};
export type StringServerOptionsChoice = {
  default: string;
  displayName: string;
  options?: string[];
  order: number;
  type: "enum" | "boolean";
};
export type BoolServerOptionsChoice = {
  default: boolean;
  displayName: string;
  order: number;
  type: "enum" | "boolean";
};
export type ServerOptionsEndpointResponse = {
  cloudstorage: Generated;
  defaultUrl?: StringServerOptionsChoice;
  lfs_auto_fetch?: BoolServerOptionsChoice;
};
export type UserPodAnnotations = {
  "jupyter.org/servername"?: string;
  "jupyter.org/username"?: string;
  "renku.io/branch": string;
  "renku.io/commit-sha": string;
  "renku.io/default_image_used": string;
  "renku.io/git-host"?: string;
  "renku.io/gitlabProjectId"?: string;
  "renku.io/hibernatedSecondsThreshold"?: string;
  "renku.io/hibernation"?: string;
  "renku.io/hibernationBranch"?: string;
  "renku.io/hibernationCommitSha"?: string;
  "renku.io/hibernationDate"?: string;
  "renku.io/hibernationDirty"?: string;
  "renku.io/hibernationSynchronized"?: string;
  "renku.io/idleSecondsThreshold"?: string;
  "renku.io/lastActivityDate"?: string;
  "renku.io/launcherId"?: string;
  "renku.io/namespace": string;
  "renku.io/projectId"?: string;
  "renku.io/projectName": string;
  "renku.io/renkuVersion"?: string;
  "renku.io/repository": string;
  "renku.io/resourceClassId"?: string;
  "renku.io/servername"?: string;
  "renku.io/username"?: string;
  [key: string]: any;
};
export type LaunchNotebookResponseCloudStorage = {
  mount_folder?: any;
  remote?: any;
  type?: any;
};
export type ResourceRequests = {
  cpu: any;
  gpu?: any;
  memory: any;
  storage?: any;
};
export type ResourceUsage = {
  cpu?: any;
  memory?: any;
  storage?: any;
};
export type UserPodResources = {
  requests?: ResourceRequests;
  usage?: ResourceUsage;
};
export type ServerStatusDetail = {
  status: "ready" | "waiting" | "executing" | "failed";
  step: string;
};
export type ServerStatusWarning = {
  critical?: boolean;
  message: string;
};
export type ServerStatus = {
  details: ServerStatusDetail[];
  message?: string;
  readyNumContainers: number;
  state: "running" | "starting" | "stopping" | "failed" | "hibernated";
  totalNumContainers: number;
  warnings?: ServerStatusWarning[];
};
export type NotebookResponse = {
  annotations?: UserPodAnnotations;
  cloudstorage?: LaunchNotebookResponseCloudStorage[];
  image?: string;
  name?: ServerName;
  resources?: UserPodResources;
  started?: string | null;
  state?: object;
  status?: ServerStatus;
  url?: string;
};
export type RCloneStorageRequest = {
  configuration?: {
    [key: string]: any;
  } | null;
  readonly?: boolean;
  source_path?: string;
  storage_id?: string | null;
  target_path?: string;
};
export type LaunchNotebookRequestServerOptions = {
  cpu_request?: any;
  defaultUrl?: string;
  disk_request?: any;
  gpu_request?: any;
  lfs_auto_fetch?: boolean;
  mem_request?: any;
};
export type UserSecrets = {
  mount_path: any;
  user_secret_ids: any[];
};
export type LaunchNotebookRequestOld = {
  branch?: string;
  cloudstorage?: RCloneStorageRequest[];
  commit_sha: string;
  default_url?: string;
  environment_variables?: {
    [key: string]: string;
  };
  image?: string | null;
  lfs_auto_fetch?: boolean;
  namespace: string;
  notebook?: string | null;
  project: string;
  resource_class_id?: number | null;
  serverOptions?: LaunchNotebookRequestServerOptions;
  storage?: number;
  user_secrets?: UserSecrets | null;
};
export type ServersGetResponse = {
  servers?: {
    [key: string]: NotebookResponse;
  };
};
export type PatchServerRequest = {
  resource_class_id?: number;
  state?: "running" | "hibernated";
};
export type SessionResourcesRequests = {
  /** Fractional CPUs */
  cpu?: number;
  /** Number of GPUs used */
  gpu?: number;
  /** Ammount of RAM for the session, in gigabytes */
  memory?: number;
  /** The size of disk storage for the session, in gigabytes */
  storage?: number;
};
export type SessionResources = {
  requests?: SessionResourcesRequests;
};
export type SessionStatus = {
  message?: string;
  state: "running" | "starting" | "stopping" | "failed" | "hibernated";
  will_hibernate_at?: string | null;
  will_delete_at?: string | null;
  ready_containers: number;
  total_containers: number;
};
export type Ulid = string;
export type SessionResponse = {
  image: string;
  name: ServerName;
  resources: SessionResources;
  started: string | null;
  status: SessionStatus;
  url: string;
  project_id: Ulid;
  launcher_id: Ulid;
  resource_class_id: number;
};
export type SessionCloudStoragePost = {
  configuration?: {
    [key: string]: any;
  };
  readonly?: boolean;
  source_path?: string;
  target_path?: string;
  storage_id: Ulid & any;
};
export type SessionCloudStoragePostList = SessionCloudStoragePost[];
export type EnvVarOverride = {
  name: string;
  value: string;
};
export type EnvVariableOverrides = EnvVarOverride[];
export type SessionPostRequest = {
  launcher_id: Ulid;
  /** The size of disk storage for the session, in gigabytes */
  disk_storage?: number;
  resource_class_id?: number | null;
  cloudstorage?: SessionCloudStoragePostList;
  env_variable_overrides?: EnvVariableOverrides;
};
export type SessionListResponse = SessionResponse[];
export type SessionPatchRequest = {
  resource_class_id?: number;
  state?: "running" | "hibernated";
};
export type SessionLogsResponse = {
  [key: string]: string;
};
export const {
  useGetNotebooksImagesQuery,
  useGetNotebooksLogsByServerNameQuery,
  useGetNotebooksServerOptionsQuery,
  usePostNotebooksServersMutation,
  useGetNotebooksServersQuery,
  useDeleteNotebooksServersByServerNameMutation,
  useGetNotebooksServersByServerNameQuery,
  usePatchNotebooksServersByServerNameMutation,
  usePostSessionsMutation,
  useGetSessionsQuery,
  useGetSessionsBySessionIdQuery,
  useDeleteSessionsBySessionIdMutation,
  usePatchSessionsBySessionIdMutation,
  useGetSessionsBySessionIdLogsQuery,
  useGetSessionsImagesQuery,
} = injectedRtkApi;
