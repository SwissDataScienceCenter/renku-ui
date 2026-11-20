import { repositoriesEmptyApi as api } from "./repositories.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRepository: build.query<GetRepositoryApiResponse, GetRepositoryApiArg>({
      query: (queryArg) => ({
        url: `/repository`,
        params: {
          url: queryArg.url,
        },
      }),
    }),
    getRepositoryPermissions: build.query<
      GetRepositoryPermissionsApiResponse,
      GetRepositoryPermissionsApiArg
    >({
      query: (queryArg) => ({
        url: `/repository/permissions`,
        params: {
          repository_permissions_params: queryArg.repositoryPermissionsParams,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as repositoriesGeneratedApi };
export type GetRepositoryApiResponse =
  /** status 200 The repository metadata. */ RepositoryProviderData;
export type GetRepositoryApiArg = {
  url: string;
};
export type GetRepositoryPermissionsApiResponse =
  /** status 200 The repository permissions. */ RepositoryPermissions;
export type GetRepositoryPermissionsApiArg = {
  /** query parameters */
  repositoryPermissionsParams: {
    /** Repository URL */
    url: string;
  };
};
export type Ulid = string;
export type ProviderId = string;
export type ProviderConnection = {
  id: Ulid;
  provider_id: ProviderId;
  status: string;
};
export type ProviderKind =
  | "dropbox"
  | "generic_oidc"
  | "github"
  | "gitlab"
  | "google"
  | "zenodo"
  | "scicat";
export type ProviderData = {
  id: ProviderId;
  name: string;
  url: string;
  kind: ProviderKind;
};
export type RepositoryVisibility = "public" | "private";
export type Metadata = {
  git_url: string;
  web_url?: string;
  pull_permission: boolean;
  push_permission?: boolean;
  visibility: RepositoryVisibility;
};
export type RepositoryErrorCode =
  | "no_url_scheme"
  | "no_url_host"
  | "no_git_repo"
  | "no_url_path"
  | "invalid_url_scheme"
  | "invalid_git_url"
  | "metadata_unauthorized"
  | "metadata_oauth"
  | "metadata_unknown"
  | "metadata_validation";
export type RepositoryProviderData = {
  status: "valid" | "invalid" | "unknown";
  connection?: ProviderConnection;
  provider?: ProviderData;
  metadata?: Metadata;
  error_code?: RepositoryErrorCode;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
    /** Sentry trace ID for linking to corresponding log entries */
    trace_id?: string;
  };
};
export type RepositoryPermissions = {
  error_code?: RepositoryErrorCode;
  permissions?: {
    integration_access?: boolean;
  };
};
export const { useGetRepositoryQuery, useGetRepositoryPermissionsQuery } =
  injectedRtkApi;
