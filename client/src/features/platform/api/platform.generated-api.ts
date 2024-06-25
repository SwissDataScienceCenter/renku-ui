import { platformEmptyApi as api } from "./platform-empty.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlatformConfig: build.query<
      GetPlatformConfigApiResponse,
      GetPlatformConfigApiArg
    >({
      query: () => ({ url: `/platform/config` }),
    }),
    postPlatformConfig: build.mutation<
      PostPlatformConfigApiResponse,
      PostPlatformConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/config`,
        method: "POST",
        body: queryArg.platformConfigPost,
      }),
    }),
    patchPlatformConfig: build.mutation<
      PatchPlatformConfigApiResponse,
      PatchPlatformConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/platform/config`,
        method: "PATCH",
        body: queryArg.platformConfigPatch,
        headers: { "If-Match": queryArg["If-Match"] },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as platformGeneratedApi };
export type GetPlatformConfigApiResponse =
  /** status 200 The platform configuration */ PlatformConfig;
export type GetPlatformConfigApiArg = void;
export type PostPlatformConfigApiResponse =
  /** status 201 The initial platform configuration */ PlatformConfig;
export type PostPlatformConfigApiArg = {
  platformConfigPost: PlatformConfigPost;
};
export type PatchPlatformConfigApiResponse =
  /** status 200 The updated platform configuration */ PlatformConfig;
export type PatchPlatformConfigApiArg = {
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  platformConfigPatch: PlatformConfigPatch;
};
export type ETag = string;
export type DisableUi = boolean;
export type MaintenanceBanner = string;
export type StatusPageId = string;
export type PlatformConfig = {
  etag: ETag;
  disable_ui: DisableUi;
  maintenance_banner: MaintenanceBanner;
  status_page_id: StatusPageId;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type PlatformConfigPost = {
  disable_ui?: DisableUi;
  maintenance_banner?: MaintenanceBanner;
  status_page_id?: StatusPageId;
};
export type PlatformConfigPatch = {
  disable_ui?: DisableUi;
  maintenance_banner?: MaintenanceBanner;
  status_page_id?: StatusPageId;
};
export const {
  useGetPlatformConfigQuery,
  usePostPlatformConfigMutation,
  usePatchPlatformConfigMutation,
} = injectedRtkApi;
