import { repositoriesEmptyApi as api } from "./repositories.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRepositories: build.query<
      GetRepositoriesApiResponse,
      GetRepositoriesApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories`,
        params: { url: queryArg.url },
      }),
    }),
    getRepositoriesByRepositoryUrl: build.query<
      GetRepositoriesByRepositoryUrlApiResponse,
      GetRepositoriesByRepositoryUrlApiArg
    >({
      query: (queryArg) => ({ url: `/repositories/${queryArg.repositoryUrl}` }),
    }),
    getRepositoriesProbe: build.query<
      GetRepositoriesProbeApiResponse,
      GetRepositoriesProbeApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/probe`,
        params: { url: queryArg.url },
      }),
    }),
    getRepositoriesByRepositoryUrlProbe: build.query<
      GetRepositoriesByRepositoryUrlProbeApiResponse,
      GetRepositoriesByRepositoryUrlProbeApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/${queryArg.repositoryUrl}/probe`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as repositoriesGeneratedApi };
export type GetRepositoriesApiResponse =
  /** status 200 The repository metadata. */ RepositoryProviderData;
export type GetRepositoriesApiArg = {
  url: string;
};
export type GetRepositoriesByRepositoryUrlApiResponse =
  /** status 200 The repository metadata. */ RepositoryProviderData;
export type GetRepositoriesByRepositoryUrlApiArg = {
  repositoryUrl: string;
};
export type GetRepositoriesProbeApiResponse =
  /** status 200 The repository seems to be available. */ void;
export type GetRepositoriesProbeApiArg = {
  url: string;
};
export type GetRepositoriesByRepositoryUrlProbeApiResponse =
  /** status 200 The repository seems to be available. */ void;
export type GetRepositoriesByRepositoryUrlProbeApiArg = {
  repositoryUrl: string;
};
export type Ulid = string;
export type ProviderId = string;
export type ProviderConnection = {
  id: Ulid;
  provider_id: ProviderId;
  status: string;
};
export type ProviderData = {
  id: ProviderId;
  name: string;
  url: string;
};
export type Metadata = {
  git_url: string;
  web_url?: string;
  pull_permission: boolean;
  push_permission?: boolean;
};
export type RepositoryProviderData = {
  status: "valid" | "invalid" | "unknown";
  connection?: ProviderConnection;
  provider?: ProviderData;
  metadata?: Metadata;
  error_code?:
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
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export const {
  useGetRepositoriesQuery,
  useGetRepositoriesByRepositoryUrlQuery,
  useGetRepositoriesProbeQuery,
  useGetRepositoriesByRepositoryUrlProbeQuery,
} = injectedRtkApi;
