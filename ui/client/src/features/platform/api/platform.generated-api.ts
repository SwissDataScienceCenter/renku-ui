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
export type PatchPlatformConfigApiResponse =
  /** status 200 The updated platform configuration */ PlatformConfig;
export type PatchPlatformConfigApiArg = {
  /** If-Match header, for avoiding mid-air collisions */
  "If-Match": ETag;
  platformConfigPatch: PlatformConfigPatch;
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
  };
};
export type PlatformConfigPatch = {
  incident_banner?: IncidentBanner;
};
export const { useGetPlatformConfigQuery, usePatchPlatformConfigMutation } =
  injectedRtkApi;
