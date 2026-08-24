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
    postStorage: build.mutation<PostStorageApiResponse, PostStorageApiArg>({
      query: (queryArg) => ({
        url: `/storage`,
        method: "POST",
        body: queryArg.projectStoragePost,
      }),
    }),
    getStorageConfig: build.query<
      GetStorageConfigApiResponse,
      GetStorageConfigApiArg
    >({
      query: () => ({ url: `/storage/config` }),
    }),
    getStorageAllow: build.query<
      GetStorageAllowApiResponse,
      GetStorageAllowApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/allow`,
        params: {
          params: queryArg.params,
        },
      }),
    }),
    postStorageAllow: build.mutation<
      PostStorageAllowApiResponse,
      PostStorageAllowApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/allow`,
        method: "POST",
        body: queryArg.projectStorageAllowPost,
      }),
    }),
    getStorageAllowByProjectId: build.query<
      GetStorageAllowByProjectIdApiResponse,
      GetStorageAllowByProjectIdApiArg
    >({
      query: (queryArg) => ({ url: `/storage/allow/${queryArg.projectId}` }),
    }),
    patchStorageAllowByProjectId: build.mutation<
      PatchStorageAllowByProjectIdApiResponse,
      PatchStorageAllowByProjectIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/allow/${queryArg.projectId}`,
        method: "PATCH",
        body: queryArg.projectStorageAllowPatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    deleteStorageAllowByProjectId: build.mutation<
      DeleteStorageAllowByProjectIdApiResponse,
      DeleteStorageAllowByProjectIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/allow/${queryArg.projectId}`,
        method: "DELETE",
      }),
    }),
    getStorageByStorageId: build.query<
      GetStorageByStorageIdApiResponse,
      GetStorageByStorageIdApiArg
    >({
      query: (queryArg) => ({ url: `/storage/${queryArg.storageId}` }),
    }),
    patchStorageByStorageId: build.mutation<
      PatchStorageByStorageIdApiResponse,
      PatchStorageByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/${queryArg.storageId}`,
        method: "PATCH",
        body: queryArg.projectStoragePatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    deleteStorageByStorageId: build.mutation<
      DeleteStorageByStorageIdApiResponse,
      DeleteStorageByStorageIdApiArg
    >({
      query: (queryArg) => ({
        url: `/storage/${queryArg.storageId}`,
        method: "DELETE",
      }),
    }),
    getProjectsByProjectIdStorage: build.query<
      GetProjectsByProjectIdStorageApiResponse,
      GetProjectsByProjectIdStorageApiArg
    >({
      query: (queryArg) => ({ url: `/projects/${queryArg.projectId}/storage` }),
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
export type PostStorageApiResponse =
  /** status 201 The data connector was created */ ProjectStorage;
export type PostStorageApiArg = {
  projectStoragePost: ProjectStoragePost;
};
export type GetStorageConfigApiResponse =
  /** status 200 The configuration data */ ProjectStorageConfig;
export type GetStorageConfigApiArg = void;
export type GetStorageAllowApiResponse =
  /** status 200 List of storage allow entries */ ProjectStorageAllowList;
export type GetStorageAllowApiArg = {
  /** query parameters */
  params?: ProjectStorageAllowListQuery;
};
export type PostStorageAllowApiResponse =
  /** status 201 The project was added to the allow list */ ProjectStorageAllowPost;
export type PostStorageAllowApiArg = {
  projectStorageAllowPost: ProjectStorageAllowPost;
};
export type GetStorageAllowByProjectIdApiResponse =
  /** status 200 The project storage allow entry */ ProjectStorageAllow;
export type GetStorageAllowByProjectIdApiArg = {
  projectId: Ulid;
};
export type PatchStorageAllowByProjectIdApiResponse =
  /** status 200 The patched project storage allow entry */ ProjectStorageAllow;
export type PatchStorageAllowByProjectIdApiArg = {
  projectId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  projectStorageAllowPatch: ProjectStorageAllowPatch;
};
export type DeleteStorageAllowByProjectIdApiResponse = unknown;
export type DeleteStorageAllowByProjectIdApiArg = {
  projectId: Ulid;
};
export type GetStorageByStorageIdApiResponse =
  /** status 200 The project storage information */ ProjectStorage;
export type GetStorageByStorageIdApiArg = {
  storageId: Ulid;
};
export type PatchStorageByStorageIdApiResponse =
  /** status 200 The patched project storage entry */ ProjectStorage;
export type PatchStorageByStorageIdApiArg = {
  storageId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  projectStoragePatch: ProjectStoragePatch;
};
export type DeleteStorageByStorageIdApiResponse = unknown;
export type DeleteStorageByStorageIdApiArg = {
  storageId: Ulid;
};
export type GetProjectsByProjectIdStorageApiResponse =
  /** status 200 The list of project storages (currently either one or empty). */ ProjectStorageList;
export type GetProjectsByProjectIdStorageApiArg = {
  projectId: Ulid;
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
export type CreationDate = string;
export type UserId = string;
export type ETag = string;
export type ProjectStorage = {
  id: Ulid;
  project_id: Ulid;
  size: number;
  mount_path: string;
  creation_date: CreationDate;
  created_by: UserId;
  updated_at: CreationDate;
  etag: ETag;
};
export type ProjectSlug = string;
export type ProjectStoragePost = {
  namespace: ProjectSlug;
  size: number;
  mount_path: string;
};
export type MaxStorageSize = number;
export type ProjectStorageConfig = {
  enabled: boolean;
  max_size: MaxStorageSize;
};
export type ProjectStorageAllow = {
  project_id: Ulid;
  name: string;
  namespace: string;
  max_size: MaxStorageSize;
  etag: ETag;
};
export type ProjectStorageAllowList = ProjectStorageAllow[];
export type PaginationRequest = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  per_page?: number;
};
export type ProjectStorageAllowListQuery = PaginationRequest & {
  /** Filter by project name (partial match). */
  project_name?: string;
};
export type ProjectIdRef = {
  id: Ulid;
};
export type ProjectSlugRef = {
  slug: ProjectSlug;
};
export type ProjectRef = ProjectIdRef | ProjectSlugRef;
export type ProjectStorageAllowPost = {
  project_ref: ProjectRef;
  max_size: MaxStorageSize;
};
export type ProjectStorageAllowPatch = {
  max_size?: MaxStorageSize;
};
export type ProjectStoragePatch = {
  /** The maximum size in GB */
  size?: number;
  /** The mount path for the storage */
  mount_path?: string;
};
export type ProjectStorageList = ProjectStorage[];
export const {
  useGetStorageSchemaQuery,
  usePostStorageSchemaValidateMutation,
  usePostStorageSchemaTestConnectionMutation,
  usePostStorageSchemaObscureMutation,
  usePostStorageMutation,
  useGetStorageConfigQuery,
  useGetStorageAllowQuery,
  usePostStorageAllowMutation,
  useGetStorageAllowByProjectIdQuery,
  usePatchStorageAllowByProjectIdMutation,
  useDeleteStorageAllowByProjectIdMutation,
  useGetStorageByStorageIdQuery,
  usePatchStorageByStorageIdMutation,
  useDeleteStorageByStorageIdMutation,
  useGetProjectsByProjectIdStorageQuery,
} = injectedRtkApi;
