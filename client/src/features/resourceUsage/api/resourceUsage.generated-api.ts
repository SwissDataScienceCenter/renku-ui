import { resourceUsageEmptyApi as api } from "./resourceUsage.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getResourcePoolsByResourcePoolIdUsage: build.query<
      GetResourcePoolsByResourcePoolIdUsageApiResponse,
      GetResourcePoolsByResourcePoolIdUsageApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/usage`,
        params: { start_date: queryArg.startDate, end_date: queryArg.endDate },
      }),
    }),
    getResourcePoolsByResourcePoolIdLimits: build.query<
      GetResourcePoolsByResourcePoolIdLimitsApiResponse,
      GetResourcePoolsByResourcePoolIdLimitsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/limits`,
      }),
    }),
    putResourcePoolsByResourcePoolIdLimits: build.mutation<
      PutResourcePoolsByResourcePoolIdLimitsApiResponse,
      PutResourcePoolsByResourcePoolIdLimitsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/limits`,
        method: "PUT",
        body: queryArg.resourcePoolLimitPut,
      }),
    }),
    deleteResourcePoolsByResourcePoolIdLimits: build.mutation<
      DeleteResourcePoolsByResourcePoolIdLimitsApiResponse,
      DeleteResourcePoolsByResourcePoolIdLimitsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/limits`,
        method: "DELETE",
      }),
    }),
    getResourcePoolsByResourcePoolIdClassesAndClassIdCost: build.query<
      GetResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse,
      GetResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/cost`,
      }),
    }),
    putResourcePoolsByResourcePoolIdClassesAndClassIdCost: build.mutation<
      PutResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse,
      PutResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/cost`,
        method: "PUT",
        body: queryArg.resourceClassCostPut,
      }),
    }),
    deleteResourcePoolsByResourcePoolIdClassesAndClassIdCost: build.mutation<
      DeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse,
      DeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/cost`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as resourceUsageGeneratedApi };
export type GetResourcePoolsByResourcePoolIdUsageApiResponse =
  /** status 200 Return the pool limits and current usage. */ ResourcePoolUsage;
export type GetResourcePoolsByResourcePoolIdUsageApiArg = {
  resourcePoolId: number;
  startDate?: string;
  endDate?: string;
};
export type GetResourcePoolsByResourcePoolIdLimitsApiResponse =
  /** status 200 Return the resource pool limits. */ ResourcePoolLimits;
export type GetResourcePoolsByResourcePoolIdLimitsApiArg = {
  resourcePoolId: number;
};
export type PutResourcePoolsByResourcePoolIdLimitsApiResponse =
  /** status 200 The input limits have been updated. */ ResourcePoolLimitPut;
export type PutResourcePoolsByResourcePoolIdLimitsApiArg = {
  resourcePoolId: number;
  resourcePoolLimitPut: ResourcePoolLimitPut;
};
export type DeleteResourcePoolsByResourcePoolIdLimitsApiResponse =
  /** status 204 No content on success. */ void;
export type DeleteResourcePoolsByResourcePoolIdLimitsApiArg = {
  resourcePoolId: number;
};
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse =
  /** status 200 Return the resource class costs. */ ResourceClassCost;
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg = {
  resourcePoolId: number;
  classId: number;
};
export type PutResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse =
  /** status 200 The input cost that has been set. */ ResourceClassCostPut;
export type PutResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg = {
  resourcePoolId: number;
  classId: number;
  resourceClassCostPut: ResourceClassCostPut;
};
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostApiResponse =
  /** status 204 No content on success. */ void;
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostApiArg = {
  resourcePoolId: number;
  classId: number;
};
export type ResourceUsageSummary = {
  runtime: number;
  cost: number;
};
export type ResourcePoolLimits = {
  pool_id: number;
  total_limit: number;
  user_limit: number;
};
export type ResourcePoolUsage = {
  total_usage: ResourceUsageSummary;
  user_usage: ResourceUsageSummary;
  pool_limits: ResourcePoolLimits;
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
export type ResourcePoolLimitPut = {
  total_limit: number;
  user_limit: number;
};
export type ResourceClassCost = {
  resource_pool_id: number;
  resource_class_id: number;
  cost: number;
};
export type ResourceClassCostPut = {
  /** The cost of a resource class is an integer that specifies
    the effective cost of a session using this class running
    for one hour.
     */
  cost: number;
};
export const {
  useGetResourcePoolsByResourcePoolIdUsageQuery,
  useGetResourcePoolsByResourcePoolIdLimitsQuery,
  usePutResourcePoolsByResourcePoolIdLimitsMutation,
  useDeleteResourcePoolsByResourcePoolIdLimitsMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdCostQuery,
  usePutResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
} = injectedRtkApi;
