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
    postDataConnectorsGlobal: build.mutation<
      PostDataConnectorsGlobalApiResponse,
      PostDataConnectorsGlobalApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/global`,
        method: "POST",
        body: queryArg.globalDataConnectorPost,
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
    getDataConnectorsGlobalBySlug: build.query<
      GetDataConnectorsGlobalBySlugApiResponse,
      GetDataConnectorsGlobalBySlugApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/global/${queryArg.slug}`,
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
    getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug: build.query<
      GetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugApiResponse,
      GetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugApiArg
    >({
      query: (queryArg) => ({
        url: `/namespaces/${queryArg["namespace"]}/projects/${queryArg.project}/data_connectors/${queryArg.slug}`,
      }),
    }),
    getDataConnectorsByDataConnectorIdPermissions: build.query<
      GetDataConnectorsByDataConnectorIdPermissionsApiResponse,
      GetDataConnectorsByDataConnectorIdPermissionsApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/permissions`,
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
    getProjectsByProjectIdDataConnectorLinks: build.query<
      GetProjectsByProjectIdDataConnectorLinksApiResponse,
      GetProjectsByProjectIdDataConnectorLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/data_connector_links`,
      }),
    }),
    getProjectsByProjectIdInaccessibleDataConnectorLinks: build.query<
      GetProjectsByProjectIdInaccessibleDataConnectorLinksApiResponse,
      GetProjectsByProjectIdInaccessibleDataConnectorLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}/inaccessible_data_connector_links`,
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
export type PostDataConnectorsGlobalApiResponse =
  /** status 200 The data connector already exists */
  | DataConnectorRead
  | /** status 201 The data connector was created */ DataConnectorRead;
export type PostDataConnectorsGlobalApiArg = {
  globalDataConnectorPost: GlobalDataConnectorPost;
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
export type GetDataConnectorsGlobalBySlugApiResponse =
  /** status 200 The data connector */ DataConnectorRead;
export type GetDataConnectorsGlobalBySlugApiArg = {
  slug: string;
};
export type GetNamespacesByNamespaceDataConnectorsAndSlugApiResponse =
  /** status 200 The data connector */ DataConnectorRead;
export type GetNamespacesByNamespaceDataConnectorsAndSlugApiArg = {
  namespace: string;
  slug: string;
};
export type GetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugApiResponse =
  /** status 200 The data connector */ DataConnectorRead;
export type GetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugApiArg =
  {
    namespace: string;
    project: string;
    slug: string;
  };
export type GetDataConnectorsByDataConnectorIdPermissionsApiResponse =
  /** status 200 The set of permissions. */ DataConnectorPermissions;
export type GetDataConnectorsByDataConnectorIdPermissionsApiArg = {
  /** the ID of the data connector */
  dataConnectorId: Ulid;
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
export type GetProjectsByProjectIdDataConnectorLinksApiResponse =
  /** status 200 List of data connector to project links */ DataConnectorToProjectLinksList;
export type GetProjectsByProjectIdDataConnectorLinksApiArg = {
  /** the ID of the project */
  projectId: Ulid;
};
export type GetProjectsByProjectIdInaccessibleDataConnectorLinksApiResponse =
  /** status 200 List of data connector to project links */ InaccessibleDataConnectorLinks;
export type GetProjectsByProjectIdInaccessibleDataConnectorLinksApiArg = {
  /** the ID of the project */
  projectId: Ulid;
};
export type Ulid = string;
export type DataConnectorName = string;
export type SlugResponse = string;
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
  namespace?: SlugResponse;
  slug: SlugResponse;
  storage: CloudStorageCore;
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
  namespace?: SlugResponse;
  slug: SlugResponse;
  storage: CloudStorageCoreRead;
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
export type OneOrTwoSlugs = string;
export type Slug = string;
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
  namespace?: OneOrTwoSlugs;
  slug?: Slug;
  storage: CloudStorageCorePost | CloudStorageUrlV2;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorPostRead = {
  name: DataConnectorName;
  namespace?: OneOrTwoSlugs;
  slug?: Slug;
  storage: CloudStorageCorePostRead | CloudStorageUrlV2;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type GlobalDataConnectorPost = {
  storage: CloudStorageCorePost | CloudStorageUrlV2;
};
export type GlobalDataConnectorPostRead = {
  storage: CloudStorageCorePostRead | CloudStorageUrlV2;
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
  namespace?: OneOrTwoSlugs;
  slug?: Slug;
  storage?: CloudStorageCorePatch;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorPatchRead = {
  name?: DataConnectorName;
  namespace?: OneOrTwoSlugs;
  slug?: Slug;
  storage?: CloudStorageCorePatchRead;
  visibility?: Visibility;
  description?: Description;
  keywords?: KeywordsList;
};
export type DataConnectorPermissions = {
  /** The user can edit the data connector */
  write?: boolean;
  /** The user can delete the data connector */
  delete?: boolean;
  /** The user can manage data connector members */
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
export type DataConnectorToProjectLinkPost = {
  project_id: Ulid;
};
export type DataConnectorSecretFieldName = string;
export type DataConnectorSecret = {
  name: DataConnectorSecretFieldName;
  secret_id: Ulid;
};
export type DataConnectorSecretsList = DataConnectorSecret[];
export type SecretValueNullable = string | null;
export type DataConnectorSecretPatch = {
  name: DataConnectorSecretFieldName;
  value: SecretValueNullable;
};
export type DataConnectorSecretPatchList = DataConnectorSecretPatch[];
export type InaccessibleDataConnectorLinks = {
  /** The number of data links the user does not have access to */
  count?: number;
};
export const {
  useGetDataConnectorsQuery,
  usePostDataConnectorsMutation,
  usePostDataConnectorsGlobalMutation,
  useGetDataConnectorsByDataConnectorIdQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useGetDataConnectorsGlobalBySlugQuery,
  useGetNamespacesByNamespaceDataConnectorsAndSlugQuery,
  useGetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugQuery,
  useGetDataConnectorsByDataConnectorIdPermissionsQuery,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery,
} = injectedRtkApi;
