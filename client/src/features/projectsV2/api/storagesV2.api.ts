type GitlabProjectId = string;
type UlidId = string;
type ProjectId = {
  project_id: GitlabProjectId | UlidId;
};
type StorageType = string;
type StorageTypeRead = string;
type StorageName = string;
type RCloneConfig = {
  [key: string]: number | (string | null) | boolean | object;
};
type CloudStorage = ProjectId & {
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
type CloudStorageRead = ProjectId & {
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
type RCloneOption = {
  /** name of the option */
  name?: string;
  /** help text for the option */
  help?: string;
  /** The cloud provider the option is for (See 'provider' RCloneOption in the schema for potential values) */
  provider?: string;
  /** default value for the option */
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
export type CloudStorageGet = {
  storage: CloudStorageWithId;
  sensitive_fields?: RCloneOption[];
};
export type CloudStorageGetRead = {
  storage: CloudStorageWithIdRead;
  sensitive_fields?: RCloneOption[];
};
export type CloudStorageSecretGet = {
  /** Name of the field to store credential for */
  name: string;
  secret_id: UlidId;
};
