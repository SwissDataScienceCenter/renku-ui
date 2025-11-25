import { repositoriesEmptyApi as api } from "./repositories.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRepository: build.query<GetRepositoryApiResponse, GetRepositoryApiArg>({
      query: (queryArg) => ({
        url: `/repository`,
        params: { url: queryArg.url },
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
export const { useGetRepositoryQuery } = injectedRtkApi;
