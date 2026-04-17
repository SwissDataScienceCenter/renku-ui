import { computeResourcesApi } from "../../sessionsV2/api/computeResources.api";
import { resourceUsageGeneratedApi } from "./resourceUsage.generated-api";

const withTagHandling = resourceUsageGeneratedApi.enhanceEndpoints({
  addTagTypes: ["ResourcePoolLimits", "ResourceClassCost"],
  endpoints: {
    getResourcePoolsByResourcePoolIdLimits: {
      providesTags: (result, _error, arg) =>
        result
          ? [
              { id: arg.resourcePoolId, type: "ResourcePoolLimits" },
              "ResourcePoolLimits",
            ]
          : ["ResourcePoolLimits"],
    },
    putResourcePoolsByResourcePoolIdLimits: {
      invalidatesTags: (result, _error, arg) =>
        result
          ? [{ id: arg.resourcePoolId, type: "ResourcePoolLimits" }]
          : ["ResourcePoolLimits"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled;
        dispatch(computeResourcesApi.util.invalidateTags(["ResourcePool"]));
      },
    },
    getResourcePoolsByResourcePoolIdClassesAndClassIdCost: {
      providesTags: (result, _error, arg) =>
        result
          ? [
              {
                id: `${arg.resourcePoolId}-${arg.classId}`,
                type: "ResourceClassCost",
              },
              "ResourceClassCost",
            ]
          : ["ResourceClassCost"],
    },
    putResourcePoolsByResourcePoolIdClassesAndClassIdCost: {
      invalidatesTags: (result, _error, arg) =>
        result
          ? [
              {
                id: `${arg.resourcePoolId}-${arg.classId}`,
                type: "ResourceClassCost",
              },
            ]
          : ["ResourceClassCost"],
    },
  },
});

export const {
  useGetResourcePoolsByResourcePoolIdUsageQuery,
  useGetResourcePoolsByResourcePoolIdLimitsQuery,
  usePutResourcePoolsByResourcePoolIdLimitsMutation,
  useDeleteResourcePoolsByResourcePoolIdLimitsMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdCostQuery,
  usePutResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
} = withTagHandling;

export type * from "./resourceUsage.generated-api";
