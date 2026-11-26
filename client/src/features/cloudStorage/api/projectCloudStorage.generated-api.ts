import { projectCloudStorageEmptyApi as api } from "./projectCloudStorage.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStorageSchema: build.query<
      GetStorageSchemaApiResponse,
      GetStorageSchemaApiArg
    >({
      query: () => ({ url: `/storage_schema` }),
    }),
    postStorageSchemaValidate: build.mutation<
      PostStorageSchemaValidateApiResponse,
      PostStorageSchemaValidateApiArg
    >({
      query: (queryArg) => ({
        url: `/storage_schema/validate`,
        method: "POST",
        body: queryArg.rCloneConfigValidate,
      }),
    }),
    postStorageSchemaTestConnection: build.mutation<
      PostStorageSchemaTestConnectionApiResponse,
      PostStorageSchemaTestConnectionApiArg
    >({
      query: (queryArg) => ({
        url: `/storage_schema/test_connection`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    postStorageSchemaObscure: build.mutation<
      PostStorageSchemaObscureApiResponse,
      PostStorageSchemaObscureApiArg
    >({
      query: (queryArg) => ({
        url: `/storage_schema/obscure`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getStorages: build.query<GetStoragesApiResponse, GetStoragesApiArg>({
      query: (queryArg) => ({
        url: `/storages`,
        params: {
          params: queryArg.params,
        },
      }),
    }),
    postStorages: build.mutation<PostStoragesApiResponse, PostStoragesApiArg>({
      query: (queryArg) => ({
        url: `/storages`,
        method: "POST",
        body: queryArg.projectStoragePost,
      }),
    }),
    getStoragesByStorageId: build.query<
      GetStoragesByStorageIdApiResponse,
      GetStoragesByStorageIdApiArg
    >({
      query: (queryArg) => ({ url: `/storages/${queryArg.storageId}` }),
    }),
    patchStoragesByStorageId: build.mutation<
      PatchStoragesByStorageIdApiResponse,
      PatchStoragesByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storages/${queryArg.storageId}`,
        method: "PATCH",
        body: queryArg.projectStoragePatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    deleteStoragesByStorageId: build.mutation<
      DeleteStoragesByStorageIdApiResponse,
      DeleteStoragesByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storages/${queryArg.storageId}`,
        method: "DELETE",
      }),
    }),
    patchStoragesByStorageIdAdmin: build.mutation<
      PatchStoragesByStorageIdAdminApiResponse,
      PatchStoragesByStorageIdAdminApiArg
    >({
      query: (queryArg) => ({
        url: `/storages/${queryArg.storageId}/admin`,
        method: "PATCH",
        body: queryArg.projectStorageAdminPatchV2,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as projectCloudStorageGeneratedApi };
export type GetStorageSchemaApiResponse =
  /** status 200 The cloud storage schema definition */ RCloneSchema;
export type GetStorageSchemaApiArg = void;
export type PostStorageSchemaValidateApiResponse = unknown;
export type PostStorageSchemaValidateApiArg = {
  rCloneConfigValidate: RCloneConfigValidate;
};
export type PostStorageSchemaTestConnectionApiResponse = unknown;
export type PostStorageSchemaTestConnectionApiArg = {
  body: {
    configuration: RCloneConfig;
    source_path: SourcePath;
  };
};
export type PostStorageSchemaObscureApiResponse =
  /** status 200 The config with password values obscured */ RCloneConfig;
export type PostStorageSchemaObscureApiArg = {
  body: {
    configuration: RCloneConfig;
  };
};
export type GetStoragesApiResponse =
  /** status 200 The list of all visible project storages */ ProjectStorages;
export type GetStoragesApiArg = {
  params?: ProjectStoragesGetQuery;
};
export type PostStoragesApiResponse =
  /** status 201 The newly created project storage */ ProjectStorage;
export type PostStoragesApiArg = {
  projectStoragePost: ProjectStoragePost;
};
export type GetStoragesByStorageIdApiResponse =
  /** status 200 The project storage */ ProjectStorage;
export type GetStoragesByStorageIdApiArg = {
  storageId: Ulid;
};
export type PatchStoragesByStorageIdApiResponse =
  /** status 200 The updated project storage */ ProjectStorage;
export type PatchStoragesByStorageIdApiArg = {
  storageId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  projectStoragePatch: ProjectStoragePatch;
};
export type DeleteStoragesByStorageIdApiResponse = unknown;
export type DeleteStoragesByStorageIdApiArg = {
  storageId: Ulid;
};
export type PatchStoragesByStorageIdAdminApiResponse =
  /** status 200 The updated project storage */ ProjectStorage;
export type PatchStoragesByStorageIdAdminApiArg = {
  storageId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  projectStorageAdminPatchV2: ProjectStorageAdminPatchV2;
};
export type RCloneOption = {
  /** name of the option */
  name: string;
  /** help text for the option */
  help: string;
  /** The cloud provider the option is for (See 'provider' RCloneOption in the schema for potential values) */
  provider?: string;
  /** default value for the option */
  default: number | string | boolean | object | any;
  /** string representation of the default value */
  default_str: string;
  /** These list potential values for this option, like an enum. With `exclusive: true`, only a value from the list is allowed. */
  examples?: {
    /** a potential value for the option (think enum) */
    value: string;
    /** help text for the value */
    help: string;
    /** The provider this value is applicable for. Empty if valid for all providers. */
    provider?: string;
  }[];
  /** whether the option is required or not */
  required: boolean;
  /** whether the field is a password (use **** for display) */
  ispassword: boolean;
  /** whether the value is sensitive (not stored in the service). Do not send this in requests to the service. */
  sensitive: boolean;
  /** whether this is an advanced config option (probably don't show these to users) */
  advanced: boolean;
  /** if true, only values from 'examples' can be used */
  exclusive: boolean;
  /** data type of option value. RClone has more options but they map to the ones listed here. */
  type:
    | "int"
    | "bool"
    | "string"
    | "stringArray"
    | "Time"
    | "Duration"
    | "MultiEncoder"
    | "SizeSuffix"
    | "SpaceSepList"
    | "CommaSepList"
    | "Tristate"
    | "Encoding"
    | "Bits";
};
export type RCloneEntry = {
  /** Human readable name of the provider */
  name: string;
  /** description of the provider */
  description: string;
  /** Machine readable name of the provider */
  prefix: string;
  /** Fields/properties used for this storage. */
  options: RCloneOption[];
};
export type RCloneSchema = RCloneEntry[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
    /** Sentry trace ID for linking to corresponding log entries */
    trace_id?: string;
  };
};
export type RCloneConfigValidate = {
  [key: string]: number | (string | null) | boolean | object;
};
export type RCloneConfig = {
  [key: string]: number | (string | null) | boolean | object;
};
export type SourcePath = string;
export type Ulid = string;
export type MaxStorageSize = number;
export type UserId = string;
export type CreationDate = string;
export type ETag = string;
export type ProjectStorage = {
  id: Ulid;
  project_id: Ulid;
  storage_quota_id: Ulid;
  requested_size: MaxStorageSize;
  actual_size?: MaxStorageSize;
  mount_path: string;
  k8s_pvc_name?: string;
  k8s_pvc_status?: string;
  created_by: UserId;
  creation_date: CreationDate;
  updated_at: CreationDate;
  etag: ETag;
};
export type ProjectStorages = ProjectStorage[];
export type ProjectStoragesGetQuery = {
  project_id?: Ulid;
  storage_quota_id?: Ulid;
};
export type ProjectStoragePost = {
  project_id: Ulid;
  storage_quota_id: Ulid;
  requested_size: MaxStorageSize;
  mount_path: string;
};
export type ProjectStoragePatch = {
  requested_size?: MaxStorageSize;
  mount_path?: string;
};
export type ProjectStorageAdminPatchV2 = {
  project_id?: Ulid;
  storage_quota_id?: Ulid;
  k8s_pvc_name?: string;
};
export const {
  useGetStorageSchemaQuery,
  usePostStorageSchemaValidateMutation,
  usePostStorageSchemaTestConnectionMutation,
  usePostStorageSchemaObscureMutation,
  useGetStoragesQuery,
  usePostStoragesMutation,
  useGetStoragesByStorageIdQuery,
  usePatchStoragesByStorageIdMutation,
  useDeleteStoragesByStorageIdMutation,
  usePatchStoragesByStorageIdAdminMutation,
} = injectedRtkApi;
