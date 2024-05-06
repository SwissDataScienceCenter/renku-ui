import { projectAndNamespaceApi as api } from "./namespace.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStoragesV2ByStorageId: build.query<
      GetStoragesV2ByStorageIdApiResponse,
      GetStoragesV2ByStorageIdApiArg
    >({
      query: (queryArg) => ({ url: `/storages_v2/${queryArg.storageId}` }),
    }),
    patchStoragesV2ByStorageId: build.mutation<
      PatchStoragesV2ByStorageIdApiResponse,
      PatchStoragesV2ByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storages_v2/${queryArg.storageId}`,
        method: "PATCH",
        body: queryArg.cloudStoragePatch,
      }),
    }),
    deleteStoragesV2ByStorageId: build.mutation<
      DeleteStoragesV2ByStorageIdApiResponse,
      DeleteStoragesV2ByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storages_v2/${queryArg.storageId}`,
        method: "DELETE",
      }),
    }),
    getStoragesV2: build.query<GetStoragesV2ApiResponse, GetStoragesV2ApiArg>({
      query: (queryArg) => ({
        url: `/storages_v2`,
        params: { project_id: queryArg.projectId },
      }),
    }),
    postStoragesV2: build.mutation<
      PostStoragesV2ApiResponse,
      PostStoragesV2ApiArg
    >({
      query: (queryArg) => ({
        url: `/storages_v2`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectStoragesApi };
export type GetStoragesV2ByStorageIdApiResponse =
  /** status 200 Found the cloud storage */ CloudStorageGetRead;
export type GetStoragesV2ByStorageIdApiArg = {
  /** the id of the storage */
  storageId: UlidId;
};
export type PatchStoragesV2ByStorageIdApiResponse =
  /** status 201 The cloud storage entry was updated */ CloudStorageGetRead;
export type PatchStoragesV2ByStorageIdApiArg = {
  /** the id of the storage */
  storageId: UlidId;
  cloudStoragePatch: CloudStoragePatch;
};
export type DeleteStoragesV2ByStorageIdApiResponse =
  /** status 204 The rcloud storage was removed or did not exist in the first place */ void;
export type DeleteStoragesV2ByStorageIdApiArg = {
  /** the id of the storage */
  storageId: UlidId;
};
export type GetStoragesV2ApiResponse =
  /** status 200 the storage configurations for the project */ CloudStorageGetRead[];
export type GetStoragesV2ApiArg = {
  projectId: UlidId;
};
export type PostStoragesV2ApiResponse =
  /** status 201 The cloud storage entry was created */ CloudStorageGetRead;
export type PostStoragesV2ApiArg = {
  body: CloudStorage | CloudStorageUrl;
};
export type GitlabProjectId = string;
export type UlidId = string;
export type GitRequest = {
  project_id: GitlabProjectId | UlidId;
};
export type StorageType = string;
export type StorageTypeRead = string;
export type StorageName = string;
export type RCloneConfig = {
  [key: string]: number | (string | null) | boolean | object;
};
export type CloudStorage = GitRequest & {
  storage_type?: StorageType;
  name: StorageName;
  configuration: RCloneConfig;
  /** the source path to mount, usually starts with bucket/container name */
  source_path: string;
  /** the target path relative to the repository where the storage should be mounted */
  target_path: string;
  /** Whether this storage should be mounted readonly or not */
  readonly?: boolean;
};
export type CloudStorageRead = GitRequest & {
  storage_type?: StorageTypeRead;
  name: StorageName;
  configuration: RCloneConfig;
  /** the source path to mount, usually starts with bucket/container name */
  source_path: string;
  /** the target path relative to the repository where the storage should be mounted */
  target_path: string;
  /** Whether this storage should be mounted readonly or not */
  readonly?: boolean;
};
export type CloudStorageWithId = CloudStorage & {
  storage_id: UlidId;
};
export type CloudStorageWithIdRead = CloudStorageRead & {
  storage_id: UlidId;
};
export type RCloneOption = {
  /** name of the option */
  name?: string;
  /** help text for the option */
  help?: string;
  /** The cloud provider the option is for (See 'provider' RCloneOption in the schema for potential values) */
  provider?: string;
  /** default value for the option */
  default?: number | string | boolean | object | any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** string representation of the default value */
  default_str?: string;
  /** These list potential values for this option, like an enum. With `exclusive: true`, only a value from the list is allowed. */
  examples?: {
    /** a potential value for the option (think enum) */
    value?: string;
    /** help text for the value */
    help?: string;
    /** The provider this value is applicable for. Empty if valid for all providers. */
    provider?: string;
  }[];
  /** whether the option is required or not */
  required?: boolean;
  /** whether the field is a password (use **** for display) */
  ispassword?: boolean;
  /** whether the value is sensitive (not stored in the service). Do not send this in requests to the service. */
  sensitive?: boolean;
  /** whether this is an advanced config option (probably don't show these to users) */
  advanced?: boolean;
  /** if true, only values from 'examples' can be used */
  exclusive?: boolean;
  /** data type of option value. RClone has more options but they map to the ones listed here. */
  datatype?: "int" | "bool" | "string" | "Time";
};
export type CloudStorageGet = {
  storage: CloudStorageWithId;
  sensitive_fields?: RCloneOption[];
};
export type CloudStorageGetRead = {
  storage: CloudStorageWithIdRead;
  sensitive_fields?: RCloneOption[];
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type SourcePath = string;
export type CloudStoragePatch = {
  project_id?: GitlabProjectId | UlidId;
  storage_type?: StorageType;
  name?: StorageName;
  configuration?: RCloneConfig;
  source_path?: SourcePath;
  /** the target path relative to the repository where the storage should be mounted */
  target_path?: string;
  /** Whether this storage should be mounted readonly or not */
  readonly?: boolean;
};
export type CloudStoragePatchRead = {
  project_id?: GitlabProjectId | UlidId;
  storage_type?: StorageTypeRead;
  name?: StorageName;
  configuration?: RCloneConfig;
  source_path?: SourcePath;
  /** the target path relative to the repository where the storage should be mounted */
  target_path?: string;
  /** Whether this storage should be mounted readonly or not */
  readonly?: boolean;
};
export type CloudStorageUrl = GitRequest & {
  storage_url: string;
  name: StorageName;
  /** the target path relative to the repository where the storage should be mounted */
  target_path: string;
  /** Whether this storage should be mounted readonly or not */
  readonly?: boolean;
};
export const {
  useGetStoragesV2ByStorageIdQuery,
  usePatchStoragesV2ByStorageIdMutation,
  useDeleteStoragesV2ByStorageIdMutation,
  useGetStoragesV2Query,
  usePostStoragesV2Mutation,
} = injectedRtkApi;
