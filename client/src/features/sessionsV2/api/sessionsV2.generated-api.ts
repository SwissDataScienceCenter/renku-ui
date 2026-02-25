import { sessionsV2EmptyApi as api } from "./sessionsV2.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
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
        url: `/sessions/${queryArg.sessionId}/logsz`,
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
export type ServerName = string;
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
  lastInteraction?: string | null;
  status: SessionStatus;
  url: string;
  project_id: Ulid;
  launcher_id: Ulid;
  resource_class_id: number;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type RCloneConfig = {
  [key: string]: number | (string | null) | boolean | object;
};
export type SourcePath = string;
export type TargetPath = string;
export type StorageReadOnly = boolean;
export type SessionDataConnectorOverride = {
  /** The corresponding data connector will not be mounted if `skip` is set to `true`. */
  skip?: boolean;
  data_connector_id: Ulid & any;
  configuration?: RCloneConfig;
  source_path?: SourcePath;
  target_path?: TargetPath;
  readonly?: StorageReadOnly;
};
export type SessionDataConnectorsOverrideList = SessionDataConnectorOverride[];
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
  data_connectors_overrides?: SessionDataConnectorsOverrideList;
  env_variable_overrides?: EnvVariableOverrides;
};
export type SessionListResponse = SessionResponse[];
export type CurrentTime = "now";
export type SessionPatchRequest = {
  resource_class_id?: number;
  state?: "running" | "hibernated";
  lastInteraction?: string | CurrentTime;
};
export type SessionLogsResponse = {
  [key: string]: string;
};
export type ImagePlatform = {
  architecture: string;
  os: string;
  "os.version"?: string;
  "os.features"?: string[];
  variant?: string;
};
export type ImagePlatforms = ImagePlatform[];
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
  platforms?: ImagePlatforms;
  connection?: ImageConnection;
  provider?: ImageProvider;
};
export const {
  usePostSessionsMutation,
  useGetSessionsQuery,
  useGetSessionsBySessionIdQuery,
  useDeleteSessionsBySessionIdMutation,
  usePatchSessionsBySessionIdMutation,
  useGetSessionsBySessionIdLogsQuery,
  useGetSessionsImagesQuery,
} = injectedRtkApi;
