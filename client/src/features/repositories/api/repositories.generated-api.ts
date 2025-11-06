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
  /** status 200 The repository metadata. */ RepositoryProviderMatch;
export type GetRepositoriesByRepositoryUrlApiArg = {
  repositoryUrl: string;
};
export type GetRepositoriesByRepositoryUrlProbeApiResponse =
  /** status 200 The repository seems to be available. */ void;
export type GetRepositoriesByRepositoryUrlProbeApiArg = {
  repositoryUrl: string;
};
export type ProviderId = string;
export type Ulid = string;
export type WebUrl = string;
export type RepositoryPermissions = {
  pull: boolean;
  push: boolean;
};
export type RepositoryMetadata = {
  git_http_url: WebUrl;
  web_url: WebUrl;
  permissions: RepositoryPermissions;
};
export type RepositoryProviderMatch = {
  provider_id: ProviderId;
  connection_id?: Ulid;
  repository_metadata?: RepositoryMetadata;
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
