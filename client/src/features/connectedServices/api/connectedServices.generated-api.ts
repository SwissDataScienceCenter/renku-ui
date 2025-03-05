import { connectedServicesEmptyApi as api } from "./connectedServices.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOauth2Providers: build.query<
      GetOauth2ProvidersApiResponse,
      GetOauth2ProvidersApiArg
    >({
      query: () => ({ url: `/oauth2/providers` }),
    }),
    postOauth2Providers: build.mutation<
      PostOauth2ProvidersApiResponse,
      PostOauth2ProvidersApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/providers`,
        method: "POST",
        body: queryArg.providerPost,
      }),
    }),
    getOauth2ProvidersByProviderId: build.query<
      GetOauth2ProvidersByProviderIdApiResponse,
      GetOauth2ProvidersByProviderIdApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/providers/${queryArg.providerId}`,
      }),
    }),
    patchOauth2ProvidersByProviderId: build.mutation<
      PatchOauth2ProvidersByProviderIdApiResponse,
      PatchOauth2ProvidersByProviderIdApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/providers/${queryArg.providerId}`,
        method: "PATCH",
        body: queryArg.providerPatch,
      }),
    }),
    deleteOauth2ProvidersByProviderId: build.mutation<
      DeleteOauth2ProvidersByProviderIdApiResponse,
      DeleteOauth2ProvidersByProviderIdApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/providers/${queryArg.providerId}`,
        method: "DELETE",
      }),
    }),
    getOauth2ProvidersByProviderIdAuthorize: build.query<
      GetOauth2ProvidersByProviderIdAuthorizeApiResponse,
      GetOauth2ProvidersByProviderIdAuthorizeApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/providers/${queryArg.providerId}/authorize`,
        params: { authorize_params: queryArg.authorizeParams },
      }),
    }),
    getOauth2Connections: build.query<
      GetOauth2ConnectionsApiResponse,
      GetOauth2ConnectionsApiArg
    >({
      query: () => ({ url: `/oauth2/connections` }),
    }),
    getOauth2ConnectionsByConnectionId: build.query<
      GetOauth2ConnectionsByConnectionIdApiResponse,
      GetOauth2ConnectionsByConnectionIdApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/connections/${queryArg.connectionId}`,
      }),
    }),
    getOauth2ConnectionsByConnectionIdAccount: build.query<
      GetOauth2ConnectionsByConnectionIdAccountApiResponse,
      GetOauth2ConnectionsByConnectionIdAccountApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/connections/${queryArg.connectionId}/account`,
      }),
    }),
    getOauth2ConnectionsByConnectionIdInstallations: build.query<
      GetOauth2ConnectionsByConnectionIdInstallationsApiResponse,
      GetOauth2ConnectionsByConnectionIdInstallationsApiArg
    >({
      query: (queryArg) => ({
        url: `/oauth2/connections/${queryArg.connectionId}/installations`,
        params: { params: queryArg.params },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as connectedServicesGeneratedApi };
export type GetOauth2ProvidersApiResponse =
  /** status 200 The list of providers. */ ProviderList;
export type GetOauth2ProvidersApiArg = void;
export type PostOauth2ProvidersApiResponse =
  /** status 201 The OAuth2 Client was created */ Provider;
export type PostOauth2ProvidersApiArg = {
  providerPost: ProviderPost;
};
export type GetOauth2ProvidersByProviderIdApiResponse =
  /** status 200 The provider. */ Provider;
export type GetOauth2ProvidersByProviderIdApiArg = {
  providerId: string;
};
export type PatchOauth2ProvidersByProviderIdApiResponse =
  /** status 200 The updated OAuth2 Client */ Provider;
export type PatchOauth2ProvidersByProviderIdApiArg = {
  providerId: string;
  providerPatch: ProviderPatch;
};
export type DeleteOauth2ProvidersByProviderIdApiResponse =
  /** status 204 The OAuth2 Client was removed or did not exist in the first place */ void;
export type DeleteOauth2ProvidersByProviderIdApiArg = {
  providerId: string;
};
export type GetOauth2ProvidersByProviderIdAuthorizeApiResponse = unknown;
export type GetOauth2ProvidersByProviderIdAuthorizeApiArg = {
  providerId: string;
  /** query parameters */
  authorizeParams?: {
    /** The URL to redirect the user to once the authorization flow has been completed. */
    next_url?: string;
  };
};
export type GetOauth2ConnectionsApiResponse =
  /** status 200 The list of connections. */ ConnectionList;
export type GetOauth2ConnectionsApiArg = void;
export type GetOauth2ConnectionsByConnectionIdApiResponse =
  /** status 200 The connection. */ Connection;
export type GetOauth2ConnectionsByConnectionIdApiArg = {
  connectionId: string;
};
export type GetOauth2ConnectionsByConnectionIdAccountApiResponse =
  /** status 200 The retrieved account information. */ ConnectedAccount;
export type GetOauth2ConnectionsByConnectionIdAccountApiArg = {
  connectionId: string;
};
export type GetOauth2ConnectionsByConnectionIdInstallationsApiResponse =
  /** status 200 The list of available GitHub installations. */ AppInstallationList;
export type GetOauth2ConnectionsByConnectionIdInstallationsApiArg = {
  connectionId: string;
  /** Query parameters */
  params?: PaginationRequest;
};
export type ProviderId = string;
export type ProviderKind = "gitlab" | "github";
export type ApplicationSlug = string;
export type ClientId = string;
export type ClientSecret = string;
export type DisplayName = string;
export type ApiScope = string;
export type ProviderUrl = string;
export type UsePkce = boolean;
export type Provider = {
  id: ProviderId;
  kind: ProviderKind;
  app_slug: ApplicationSlug;
  client_id: ClientId;
  client_secret?: ClientSecret;
  display_name: DisplayName;
  scope: ApiScope;
  url: ProviderUrl;
  use_pkce: UsePkce;
};
export type ProviderList = Provider[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type ProviderPost = {
  id: ProviderId;
  kind: ProviderKind;
  app_slug?: ApplicationSlug;
  client_id: ClientId;
  client_secret?: ClientSecret;
  display_name: DisplayName;
  scope: ApiScope;
  url: ProviderUrl;
  use_pkce?: UsePkce;
};
export type ProviderPatch = {
  kind?: ProviderKind;
  app_slug?: ApplicationSlug;
  client_id?: ClientId;
  client_secret?: ClientSecret;
  display_name?: DisplayName;
  scope?: ApiScope;
  url?: ProviderUrl;
  use_pkce?: UsePkce;
};
export type Ulid = string;
export type ConnectionStatus = "connected" | "pending";
export type Connection = {
  id: Ulid;
  provider_id: ProviderId;
  status: ConnectionStatus;
};
export type ConnectionList = Connection[];
export type ExternalUsername = string;
export type WebUrl = string;
export type ConnectedAccount = {
  username: ExternalUsername;
  web_url: WebUrl;
};
export type AppInstallation = {
  id: number;
  account_login: string;
  account_web_url: string;
  repository_selection: "all" | "selected";
  suspended_at?: string;
};
export type AppInstallationList = AppInstallation[];
export type PaginationRequest = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  per_page?: number;
};
