import { dataConnectorsEmptyApi as api } from "./data-connectors.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDataConnectors: build.query<
      GetDataConnectorsApiResponse,
      GetDataConnectorsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors`,
        params: { params: queryArg.params },
      }),
    }),
    postDataConnectors: build.mutation<
      PostDataConnectorsApiResponse,
      PostDataConnectorsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors`,
        method: "POST",
        body: queryArg.dataConnectorPost,
      }),
    }),
    getDataConnectorsByDataConnectorId: build.query<
      GetDataConnectorsByDataConnectorIdApiResponse,
      GetDataConnectorsByDataConnectorIdApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}`,
      }),
    }),
    patchDataConnectorsByDataConnectorId: build.mutation<
      PatchDataConnectorsByDataConnectorIdApiResponse,
      PatchDataConnectorsByDataConnectorIdApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}`,
        method: "PATCH",
        body: queryArg.dataConnectorPatch,
        headers: { "If-Match": queryArg["If-Match"] },
      }),
    }),
    deleteDataConnectorsByDataConnectorId: build.mutation<
      DeleteDataConnectorsByDataConnectorIdApiResponse,
      DeleteDataConnectorsByDataConnectorIdApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}`,
        method: "DELETE",
      }),
    }),
    getNamespacesByNamespaceDataConnectorsAndSlug: build.query<
      GetNamespacesByNamespaceDataConnectorsAndSlugApiResponse,
      GetNamespacesByNamespaceDataConnectorsAndSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg["namespace"]}/data_connectors/${queryArg.slug}`,
      }),
    }),
    getDataConnectorsByDataConnectorIdProjectLinks: build.query<
      GetDataConnectorsByDataConnectorIdProjectLinksApiResponse,
      GetDataConnectorsByDataConnectorIdProjectLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/project_links`,
      }),
    }),
    postDataConnectorsByDataConnectorIdProjectLinks: build.mutation<
      PostDataConnectorsByDataConnectorIdProjectLinksApiResponse,
      PostDataConnectorsByDataConnectorIdProjectLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/project_links`,
        method: "POST",
        body: queryArg.dataConnectorToProjectLinkPost,
      }),
    }),
    deleteDataConnectorsByDataConnectorIdProjectLinksAndLinkId: build.mutation<
      DeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdApiResponse,
      DeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/project_links/${queryArg.linkId}`,
        method: "DELETE",
      }),
    }),
    getDataConnectorsByDataConnectorIdSecrets: build.query<
      GetDataConnectorsByDataConnectorIdSecretsApiResponse,
      GetDataConnectorsByDataConnectorIdSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/secrets`,
      }),
    }),
    patchDataConnectorsByDataConnectorIdSecrets: build.mutation<
      PatchDataConnectorsByDataConnectorIdSecretsApiResponse,
      PatchDataConnectorsByDataConnectorIdSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/secrets`,
        method: "PATCH",
        body: queryArg.dataConnectorSecretPatchList,
      }),
    }),
    deleteDataConnectorsByDataConnectorIdSecrets: build.mutation<
      DeleteDataConnectorsByDataConnectorIdSecretsApiResponse,
      DeleteDataConnectorsByDataConnectorIdSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/secrets`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as dataConnectorsApi };
export type GetDataConnectorsApiResponse =
  /** status 200 List of data connectors */ DataConnectorsListRead;
export type GetDataConnectorsApiArg = {
  /** query parameters */
  params?: DataConnectorsGetQuery;
};
export type PostDataConnectorsApiResponse =
  /** status 201 The data connector was created */ DataConnectorRead;
export type PostDataConnectorsApiArg = {
  dataConnectorPost: DataConnectorPost;
};
export type GetDataConnectorsByDataConnectorIdApiResponse =
  /** status 200 The data connector */ DataConnectorRead;
export type GetDataConnectorsByDataConnectorIdApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
};
export type PatchDataConnectorsByDataConnectorIdApiResponse =
  /** status 200 The patched data connector */ DataConnectorRead;
export type PatchDataConnectorsByDataConnectorIdApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  dataConnectorPatch: DataConnectorPatch;
};
export type DeleteDataConnectorsByDataConnectorIdApiResponse =
  /** status 204 The data connector was removed or did not exist in the first place */ void;
export type DeleteDataConnectorsByDataConnectorIdApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
};
export type GetNamespacesByNamespaceDataConnectorsAndSlugApiResponse =
  /** status 200 The data connector */ DataConnectorRead;
export type GetNamespacesByNamespaceDataConnectorsAndSlugApiArg = {
  namespace: string;
  slug: string;
};
export type GetDataConnectorsByDataConnectorIdProjectLinksApiResponse =
  /** status 200 List of data connector to project links */ DataConnectorToProjectLinksList;
export type GetDataConnectorsByDataConnectorIdProjectLinksApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
};
export type PostDataConnectorsByDataConnectorIdProjectLinksApiResponse =
  /** status 201 The data connector was connected to a project */ DataConnectorToProjectLink;
export type PostDataConnectorsByDataConnectorIdProjectLinksApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
  dataConnectorToProjectLinkPost: DataConnectorToProjectLinkPost;
};
export type DeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdApiResponse =
  /** status 204 The data connector was removed or did not exist in the first place */ void;
export type DeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
  /** the ID of the link between a data connector and a project */
  linkId: Ulid;
};
export type GetDataConnectorsByDataConnectorIdSecretsApiResponse =
  /** status 200 The saved storage secrets */ DataConnectorSecretsList;
export type GetDataConnectorsByDataConnectorIdSecretsApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
};
export type PatchDataConnectorsByDataConnectorIdSecretsApiResponse =
  /** status 201 The secrets for cloud storage were saved */ DataConnectorSecretsList;
export type PatchDataConnectorsByDataConnectorIdSecretsApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
  dataConnectorSecretPatchList: DataConnectorSecretPatchList;
};
export type DeleteDataConnectorsByDataConnectorIdSecretsApiResponse =
  /** status 204 The secrets were removed or did not exist in the first place or the storage doesn't exist */ void;
export type DeleteDataConnectorsByDataConnectorIdSecretsApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
};
export type Ulid = string;
export type DataConnectorName = string;
export type Slug = string;
export type StorageType = string;
export type StorageTypeRead = string;
export type RCloneConfig = {
  [key: string]: number | (string | null) | boolean | object;
};
export type SourcePath = string;
export type TargetPath = string;
export type StorageReadOnly = boolean;
export type RCloneOption = {
  /** name of the option */
  name?: string;
  /** help text for the option */
  help?: string;
  /** The cloud provider the option is for (See 'provider' RCloneOption in the schema for potential values) */
  provider?: string;
  /** default value for the option */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: number | string | boolean | object | any;
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
export type CloudStorageCore = {
  storage_type: StorageType;
  configuration: RCloneConfig;
  source_path: SourcePath;
  target_path: TargetPath;
  readonly: StorageReadOnly;
  sensitive_fields: RCloneOption[];
};
export type CloudStorageCoreRead = {
  storage_type: StorageTypeRead;
  configuration: RCloneConfig;
  source_path: SourcePath;
  target_path: TargetPath;
  readonly: StorageReadOnly;
  sensitive_fields: RCloneOption[];
};
export type DataConnectorSecret = {
  name: DataConnectorName;
  secret_id: Ulid;
};
export type CreationDate = string;
export type UserId = string;
export type Visibility = "private" | "public";
export type Description = string;
export type ETag = string;
export type Keyword = string;
export type KeywordsList = Keyword[];
export type DataConnector = {
  id: Ulid;
  name: DataConnectorName;
  namespace: Slug;
  slug: Slug;
  storage: CloudStorageCore;
  secrets?: DataConnectorSecret[];
  creation_date: CreationDate;
  created_by: UserId;
  visibility: Visibility;
  description?: Description;
  etag: ETag;
  keywords?: KeywordsList;
};
export type DataConnectorRead = {
  id: Ulid;
  name: DataConnectorName;
  namespace: Slug;
  slug: Slug;
  storage: CloudStorageCoreRead;
  secrets?: DataConnectorSecret[];
  creation_date: CreationDate;
  created_by: UserId;
  visibility: Visibility;
  description?: Description;
  etag: ETag;
  keywords?: KeywordsList;
};
export type DataConnectorsList = DataConnector[];
export type DataConnectorsListRead = DataConnectorRead[];
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
export type DataConnectorsGetQuery = PaginationRequest & {
  /** A namespace, used as a filter. */
  namespace?: string;
};
export type CloudStorageCorePost = {
  storage_type?: StorageType;
  configuration: RCloneConfig;
  source_path: SourcePath;
  target_path: TargetPath;
  readonly?: StorageReadOnly;
};
export type CloudStorageCorePostRead = {
  storage_type?: StorageTypeRead;
  configuration: RCloneConfig;
  source_path: SourcePath;
  target_path: TargetPath;
  readonly?: StorageReadOnly;
};
export type CloudStorageUrlV2 = {
  storage_url: string;
  target_path: TargetPath;
  readonly?: StorageReadOnly;
};
export type DataConnectorPost = {
  name: DataConnectorName;
  namespace: Slug;
  slug?: Slug;
  storage: CloudStorageCorePost | CloudStorageUrlV2;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorPostRead = {
  name: DataConnectorName;
  namespace: Slug;
  slug?: Slug;
  storage: CloudStorageCorePostRead | CloudStorageUrlV2;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type CloudStorageCorePatch = {
  storage_type?: StorageType;
  configuration?: RCloneConfig;
  source_path?: SourcePath;
  target_path?: TargetPath;
  readonly?: StorageReadOnly;
};
export type CloudStorageCorePatchRead = {
  storage_type?: StorageTypeRead;
  configuration?: RCloneConfig;
  source_path?: SourcePath;
  target_path?: TargetPath;
  readonly?: StorageReadOnly;
};
export type DataConnectorPatch = {
  name?: DataConnectorName;
  namespace?: Slug;
  slug?: Slug;
  storage?: CloudStorageCorePatch;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorPatchRead = {
  name?: DataConnectorName;
  namespace?: Slug;
  slug?: Slug;
  storage?: CloudStorageCorePatchRead;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorToProjectLink = {
  id: Ulid;
  data_connector_id: Ulid;
  project_id: Ulid;
  creation_date: CreationDate;
  created_by: UserId;
};
export type DataConnectorToProjectLinksList = DataConnectorToProjectLink[];
export type DataConnectorToProjectLinkPost = {
  project_id: Ulid;
};
export type DataConnectorSecretsList = DataConnectorSecret[];
export type SecretValueNullable = string | null;
export type DataConnectorSecretPatch = {
  name: DataConnectorName;
  value: SecretValueNullable;
};
export type DataConnectorSecretPatchList = DataConnectorSecretPatch[];
export const {
  useGetDataConnectorsQuery,
  usePostDataConnectorsMutation,
  useGetDataConnectorsByDataConnectorIdQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useGetNamespacesByNamespaceDataConnectorsAndSlugQuery,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
} = injectedRtkApi;
