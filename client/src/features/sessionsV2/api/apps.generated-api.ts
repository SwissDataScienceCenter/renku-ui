import { appsEmptyApi as api } from "./apps.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getApps: build.query<GetAppsApiResponse, GetAppsApiArg>({
      query: (queryArg) => ({
        url: `/apps`,
        params: {
          project_id: queryArg.projectId,
        },
      }),
    }),
    postApps: build.mutation<PostAppsApiResponse, PostAppsApiArg>({
      query: (queryArg) => ({
        url: `/apps`,
        method: "POST",
        body: queryArg.appPostRequest,
      }),
    }),
    getAppsByAppName: build.query<
      GetAppsByAppNameApiResponse,
      GetAppsByAppNameApiArg
    >({
      query: (queryArg) => ({ url: `/apps/${queryArg.appName}` }),
    }),
    patchAppsByAppName: build.mutation<
      PatchAppsByAppNameApiResponse,
      PatchAppsByAppNameApiArg
    >({
      query: (queryArg) => ({
        url: `/apps/${queryArg.appName}`,
        method: "PATCH",
        body: queryArg.appPatchRequest,
      }),
    }),
    deleteAppsByAppName: build.mutation<
      DeleteAppsByAppNameApiResponse,
      DeleteAppsByAppNameApiArg
    >({
      query: (queryArg) => ({
        url: `/apps/${queryArg.appName}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as appsGeneratedApi };
export type GetAppsApiResponse =
  /** status 200 The list of apps the caller can see */ AppListResponse;
export type GetAppsApiArg = {
  /** If set, only return apps belonging to this project */
  projectId?: Ulid;
};
export type PostAppsApiResponse =
  /** status 201 The app was created */ AppResponse;
export type PostAppsApiArg = {
  appPostRequest: AppPostRequest;
};
export type GetAppsByAppNameApiResponse =
  /** status 200 The app for the given name */ AppResponse;
export type GetAppsByAppNameApiArg = {
  /** The name of the app to retrieve */
  appName: AppName;
};
export type PatchAppsByAppNameApiResponse =
  /** status 200 The updated app */ AppResponse;
export type PatchAppsByAppNameApiArg = {
  /** The name of the app to update */
  appName: AppName;
  appPatchRequest: AppPatchRequest;
};
export type DeleteAppsByAppNameApiResponse = unknown;
export type DeleteAppsByAppNameApiArg = {
  /** The name of the app to delete */
  appName: AppName;
};
export type AppName = string;
export type Ulid = string;
export type AppStatus = "pending" | "ready" | "failed" | "hibernated";
export type AppResponse = {
  name: AppName;
  launcher_id: Ulid;
  status: AppStatus;
  url?: string | null;
  project_id: Ulid;
  started?: string | null;
  image?: string | null;
};
export type AppListResponse = AppResponse[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
    /** Sentry trace ID for linking to corresponding log entries */
    trace_id?: string;
  };
};
export type AppPostRequest = {
  launcher_id: Ulid;
};
export type AppState = "running" | "hibernated";
export type AppPatchRequest = {
  state?: AppState;
};
export const {
  useGetAppsQuery,
  usePostAppsMutation,
  useGetAppsByAppNameQuery,
  usePatchAppsByAppNameMutation,
  useDeleteAppsByAppNameMutation,
} = injectedRtkApi;
