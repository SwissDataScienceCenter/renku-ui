import { repositoriesEmptyApi as api } from "./repositories.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRepositoriesByRepositoryUrl: build.query<
      GetRepositoriesByRepositoryUrlApiResponse,
      GetRepositoriesByRepositoryUrlApiArg
    >({
      query: (queryArg) => ({ url: `/repositories/${queryArg.repositoryUrl}` }),
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
export type GetRepositoriesByRepositoryUrlApiResponse =
  /** status 200 The repository metadata. */ RepositoryProviderData;
export type GetRepositoriesByRepositoryUrlApiArg = {
  repositoryUrl: string;
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
    | "metadata_unauthorized"
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
  useGetRepositoriesByRepositoryUrlQuery,
  useGetRepositoriesByRepositoryUrlProbeQuery,
} = injectedRtkApi;
