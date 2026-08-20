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
export const {
  useGetStorageSchemaQuery,
  usePostStorageSchemaValidateMutation,
  usePostStorageSchemaTestConnectionMutation,
  usePostStorageSchemaObscureMutation,
} = injectedRtkApi;
