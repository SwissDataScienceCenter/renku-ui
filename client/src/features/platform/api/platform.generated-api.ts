import { platformEmptyApi as api } from "./platform-empty.api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlatformConfig: build.query<
      GetPlatformConfigApiResponse,
      GetPlatformConfigApiArg
    >({
      query: () => ({ url: `/platform/config` }),
    }),
    patchPlatformConfig: build.mutation<
      PatchPlatformConfigApiResponse,
      PatchPlatformConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/config`,
        method: "PATCH",
        body: queryArg.platformConfigPatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    getPlatformAuthorizationConfig: build.query<
      GetPlatformAuthorizationConfigApiResponse,
      GetPlatformAuthorizationConfigApiArg
    >({
      query: () => ({ url: `/platform/authorization_config` }),
    }),
    patchPlatformAuthorizationConfig: build.mutation<
      PatchPlatformAuthorizationConfigApiResponse,
      PatchPlatformAuthorizationConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/authorization_config`,
        method: "PATCH",
        body: queryArg.authzConfigPatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    getPlatformRedirects: build.query<
      GetPlatformRedirectsApiResponse,
      GetPlatformRedirectsApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/redirects`,
        params: {
          params: queryArg.params,
        },
      }),
    }),
    postPlatformRedirects: build.mutation<
      PostPlatformRedirectsApiResponse,
      PostPlatformRedirectsApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/redirects`,
        method: "POST",
        body: queryArg.urlRedirectPlanPost,
      }),
    }),
    getPlatformRedirectsBySourceUrl: build.query<
      GetPlatformRedirectsBySourceUrlApiResponse,
      GetPlatformRedirectsBySourceUrlApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/redirects/${queryArg.sourceUrl}`,
      }),
    }),
    patchPlatformRedirectsBySourceUrl: build.mutation<
      PatchPlatformRedirectsBySourceUrlApiResponse,
      PatchPlatformRedirectsBySourceUrlApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/redirects/${queryArg.sourceUrl}`,
        method: "PATCH",
        body: queryArg.urlRedirectPlanPatch,
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
    deletePlatformRedirectsBySourceUrl: build.mutation<
      DeletePlatformRedirectsBySourceUrlApiResponse,
      DeletePlatformRedirectsBySourceUrlApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/redirects/${queryArg.sourceUrl}`,
        method: "DELETE",
        headers: {
          "If-Match": queryArg["If-Match"],
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as platformGeneratedApi };
export type GetPlatformConfigApiResponse =
  /** status 200 The platform configuration */ PlatformConfig;
export type GetPlatformConfigApiArg = void;
export type PatchPlatformConfigApiResponse =
  /** status 200 The updated platform configuration */ PlatformConfig;
export type PatchPlatformConfigApiArg = {
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  platformConfigPatch: PlatformConfigPatch;
};
export type GetPlatformAuthorizationConfigApiResponse =
  /** status 200 The authorization configuration */ AuthzConfig;
export type GetPlatformAuthorizationConfigApiArg = void;
export type PatchPlatformAuthorizationConfigApiResponse =
  /** status 200 The updated platform configuration */ AuthzConfig;
export type PatchPlatformAuthorizationConfigApiArg = {
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  authzConfigPatch: AuthzConfigPatch;
};
export type GetPlatformRedirectsApiResponse =
  /** status 200 A list of redirect plans */ UrlRedirectPlanList;
export type GetPlatformRedirectsApiArg = {
  /** query parameters */
  params?: UrlRedirectPlansGetQuery;
};
export type PostPlatformRedirectsApiResponse =
  /** status 201 The redirect info was created */ UrlRedirectPlan;
export type PostPlatformRedirectsApiArg = {
  urlRedirectPlanPost: UrlRedirectPlanPost;
};
export type GetPlatformRedirectsBySourceUrlApiResponse =
  /** status 200 The redirect plan */ UrlRedirectPlan;
export type GetPlatformRedirectsBySourceUrlApiArg = {
  /** The url-encoded source URL */
  sourceUrl: string;
};
export type PatchPlatformRedirectsBySourceUrlApiResponse =
  /** status 200 The redirect info was updated */ UrlRedirectPlan;
export type PatchPlatformRedirectsBySourceUrlApiArg = {
  /** The url-encoded (original) source URL */
  sourceUrl: string;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  urlRedirectPlanPatch: UrlRedirectPlanPatch;
};
export type DeletePlatformRedirectsBySourceUrlApiResponse = unknown;
export type DeletePlatformRedirectsBySourceUrlApiArg = {
  /** The url-encoded (original) source URL */
  sourceUrl: string;
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
};
export type ETag = string;
export type IncidentBanner = string;
export type PlatformConfig = {
  etag: ETag;
  incident_banner: IncidentBanner;
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
export type PlatformConfigPatch = {
  incident_banner?: IncidentBanner;
};
export type AuthzFlag = "admins_only" | "registered_users";
export type AuthzConfig = {
  etag: ETag;
  create_projects: AuthzFlag;
  create_groups: AuthzFlag;
};
export type AuthzConfigPatch = {
  create_projects?: AuthzFlag;
  create_groups?: AuthzFlag;
};
export type SourceUrl = string;
export type TargetUrl = string;
export type UrlRedirectPlan = {
  etag: ETag;
  source_url: SourceUrl;
  target_url: TargetUrl;
};
export type UrlRedirectPlanList = UrlRedirectPlan[];
export type PaginationRequest = {
  /** Result's page number starting from 1 */
  page?: number;
  /** The number of results per page */
  per_page?: number;
};
export type UrlRedirectPlansGetQuery = PaginationRequest;
export type UrlRedirectPlanPost = {
  source_url: SourceUrl;
  target_url: TargetUrl;
};
export type UrlRedirectPlanPatch = {
  target_url?: TargetUrl;
};
export const {
  useGetPlatformConfigQuery,
  usePatchPlatformConfigMutation,
  useGetPlatformAuthorizationConfigQuery,
  usePatchPlatformAuthorizationConfigMutation,
  useGetPlatformRedirectsQuery,
  usePostPlatformRedirectsMutation,
  useGetPlatformRedirectsBySourceUrlQuery,
  usePatchPlatformRedirectsBySourceUrlMutation,
  useDeletePlatformRedirectsBySourceUrlMutation,
} = injectedRtkApi;
