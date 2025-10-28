import { computeResourcesEmptyApi as api } from "./computeResources.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getClassesByClassId: build.query<
      GetClassesByClassIdApiResponse,
      GetClassesByClassIdApiArg
    >({
      query: (queryArg) => ({ url: `/classes/${queryArg.classId}` }),
    }),
    getClusters: build.query<GetClustersApiResponse, GetClustersApiArg>({
      query: () => ({ url: `/clusters` }),
    }),
    postClusters: build.mutation<PostClustersApiResponse, PostClustersApiArg>({
      query: (queryArg) => ({
        url: `/clusters`,
        method: "POST",
        body: queryArg.cluster,
      }),
    }),
    getClustersByClusterId: build.query<
      GetClustersByClusterIdApiResponse,
      GetClustersByClusterIdApiArg
    >({
      query: (queryArg) => ({ url: `/clusters/${queryArg.clusterId}` }),
    }),
    putClustersByClusterId: build.mutation<
      PutClustersByClusterIdApiResponse,
      PutClustersByClusterIdApiArg
    >({
      query: (queryArg) => ({
        url: `/clusters/${queryArg.clusterId}`,
        method: "PUT",
        body: queryArg.cluster,
      }),
    }),
    patchClustersByClusterId: build.mutation<
      PatchClustersByClusterIdApiResponse,
      PatchClustersByClusterIdApiArg
    >({
      query: (queryArg) => ({
        url: `/clusters/${queryArg.clusterId}`,
        method: "PATCH",
        body: queryArg.clusterPatch,
      }),
    }),
    deleteClustersByClusterId: build.mutation<
      DeleteClustersByClusterIdApiResponse,
      DeleteClustersByClusterIdApiArg
    >({
      query: (queryArg) => ({
        url: `/clusters/${queryArg.clusterId}`,
        method: "DELETE",
      }),
    }),
    getError: build.query<GetErrorApiResponse, GetErrorApiArg>({
      query: () => ({ url: `/error` }),
    }),
    getResourcePools: build.query<
      GetResourcePoolsApiResponse,
      GetResourcePoolsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools`,
        params: { resource_pools_params: queryArg.resourcePoolsParams },
      }),
    }),
    postResourcePools: build.mutation<
      PostResourcePoolsApiResponse,
      PostResourcePoolsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools`,
        method: "POST",
        body: queryArg.resourcePool,
      }),
    }),
    getResourcePoolsByResourcePoolId: build.query<
      GetResourcePoolsByResourcePoolIdApiResponse,
      GetResourcePoolsByResourcePoolIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}`,
      }),
    }),
    putResourcePoolsByResourcePoolId: build.mutation<
      PutResourcePoolsByResourcePoolIdApiResponse,
      PutResourcePoolsByResourcePoolIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}`,
        method: "PUT",
        body: queryArg.resourcePoolPut,
      }),
    }),
    patchResourcePoolsByResourcePoolId: build.mutation<
      PatchResourcePoolsByResourcePoolIdApiResponse,
      PatchResourcePoolsByResourcePoolIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}`,
        method: "PATCH",
        body: queryArg.resourcePoolPatch,
      }),
    }),
    deleteResourcePoolsByResourcePoolId: build.mutation<
      DeleteResourcePoolsByResourcePoolIdApiResponse,
      DeleteResourcePoolsByResourcePoolIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}`,
        method: "DELETE",
      }),
    }),
    getResourcePoolsByResourcePoolIdClasses: build.query<
      GetResourcePoolsByResourcePoolIdClassesApiResponse,
      GetResourcePoolsByResourcePoolIdClassesApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes`,
        params: { resource_class_params: queryArg.resourceClassParams },
      }),
    }),
    postResourcePoolsByResourcePoolIdClasses: build.mutation<
      PostResourcePoolsByResourcePoolIdClassesApiResponse,
      PostResourcePoolsByResourcePoolIdClassesApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes`,
        method: "POST",
        body: queryArg.resourceClass,
      }),
    }),
    getResourcePoolsByResourcePoolIdClassesAndClassId: build.query<
      GetResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
      GetResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
      }),
    }),
    putResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
      PutResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
      PutResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
        method: "PUT",
        body: queryArg.resourceClass,
      }),
    }),
    patchResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
      PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
      PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
        method: "PATCH",
        body: queryArg.resourceClassPatch,
      }),
    }),
    deleteResourcePoolsByResourcePoolIdClassesAndClassId: build.mutation<
      DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse,
      DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}`,
        method: "DELETE",
      }),
    }),
    getResourcePoolsByResourcePoolIdClassesAndClassIdTolerations: build.query<
      GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse,
      GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/tolerations`,
      }),
    }),
    deleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerations:
      build.mutation<
        DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse,
        DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg
      >({
        query: (queryArg) => ({
          url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/tolerations`,
          method: "DELETE",
        }),
      }),
    getResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinities:
      build.query<
        GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse,
        GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg
      >({
        query: (queryArg) => ({
          url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/node_affinities`,
        }),
      }),
    deleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinities:
      build.mutation<
        DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse,
        DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg
      >({
        query: (queryArg) => ({
          url: `/resource_pools/${queryArg.resourcePoolId}/classes/${queryArg.classId}/node_affinities`,
          method: "DELETE",
        }),
      }),
    getResourcePoolsByResourcePoolIdUsers: build.query<
      GetResourcePoolsByResourcePoolIdUsersApiResponse,
      GetResourcePoolsByResourcePoolIdUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/users`,
      }),
    }),
    postResourcePoolsByResourcePoolIdUsers: build.mutation<
      PostResourcePoolsByResourcePoolIdUsersApiResponse,
      PostResourcePoolsByResourcePoolIdUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/users`,
        method: "POST",
        body: queryArg.poolUsersWithId,
      }),
    }),
    putResourcePoolsByResourcePoolIdUsers: build.mutation<
      PutResourcePoolsByResourcePoolIdUsersApiResponse,
      PutResourcePoolsByResourcePoolIdUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/users`,
        method: "PUT",
        body: queryArg.poolUsersWithId,
      }),
    }),
    getResourcePoolsByResourcePoolIdUsersAndUserId: build.query<
      GetResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse,
      GetResourcePoolsByResourcePoolIdUsersAndUserIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/users/${queryArg.userId}`,
      }),
    }),
    deleteResourcePoolsByResourcePoolIdUsersAndUserId: build.mutation<
      DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse,
      DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/users/${queryArg.userId}`,
        method: "DELETE",
      }),
    }),
    getResourcePoolsByResourcePoolIdQuota: build.query<
      GetResourcePoolsByResourcePoolIdQuotaApiResponse,
      GetResourcePoolsByResourcePoolIdQuotaApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
      }),
    }),
    putResourcePoolsByResourcePoolIdQuota: build.mutation<
      PutResourcePoolsByResourcePoolIdQuotaApiResponse,
      PutResourcePoolsByResourcePoolIdQuotaApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
        method: "PUT",
        body: queryArg.quotaWithId,
      }),
    }),
    patchResourcePoolsByResourcePoolIdQuota: build.mutation<
      PatchResourcePoolsByResourcePoolIdQuotaApiResponse,
      PatchResourcePoolsByResourcePoolIdQuotaApiArg
    >({
      query: (queryArg) => ({
        url: `/resource_pools/${queryArg.resourcePoolId}/quota`,
        method: "PATCH",
        body: queryArg.quotaPatch,
      }),
    }),
    getUsersByUserIdResourcePools: build.query<
      GetUsersByUserIdResourcePoolsApiResponse,
      GetUsersByUserIdResourcePoolsApiArg
    >({
      query: (queryArg) => ({
        url: `/users/${queryArg.userId}/resource_pools`,
        params: { user_resource_params: queryArg.userResourceParams },
      }),
    }),
    postUsersByUserIdResourcePools: build.mutation<
      PostUsersByUserIdResourcePoolsApiResponse,
      PostUsersByUserIdResourcePoolsApiArg
    >({
      query: (queryArg) => ({
        url: `/users/${queryArg.userId}/resource_pools`,
        method: "POST",
        body: queryArg.integerIds,
      }),
    }),
    putUsersByUserIdResourcePools: build.mutation<
      PutUsersByUserIdResourcePoolsApiResponse,
      PutUsersByUserIdResourcePoolsApiArg
    >({
      query: (queryArg) => ({
        url: `/users/${queryArg.userId}/resource_pools`,
        method: "PUT",
        body: queryArg.integerIds,
      }),
    }),
    getVersion: build.query<GetVersionApiResponse, GetVersionApiArg>({
      query: () => ({ url: `/version` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as computeResourcesGeneratedApi };
export type GetClassesByClassIdApiResponse =
  /** status 200 The resource class that was requested */ ResourceClassWithId;
export type GetClassesByClassIdApiArg = {
  classId: string;
};
export type GetClustersApiResponse =
  /** status 200 The cluster configurations */ ClustersWithId;
export type GetClustersApiArg = void;
export type PostClustersApiResponse =
  /** status 201 The cluster configuration was created */ ClusterWithId;
export type PostClustersApiArg = {
  cluster: Cluster;
};
export type GetClustersByClusterIdApiResponse =
  /** status 200 The cluster configuration */ ClusterWithId;
export type GetClustersByClusterIdApiArg = {
  clusterId: Ulid;
};
export type PutClustersByClusterIdApiResponse =
  /** status 200 The cluster configuration */ ClusterWithId;
export type PutClustersByClusterIdApiArg = {
  clusterId: Ulid;
  cluster: Cluster;
};
export type PatchClustersByClusterIdApiResponse =
  /** status 200 The cluster configuration */ ClusterWithId;
export type PatchClustersByClusterIdApiArg = {
  clusterId: Ulid;
  clusterPatch: ClusterPatch;
};
export type DeleteClustersByClusterIdApiResponse =
  /** status 204 The cluster configuration was removed or did not exist in the first place */ void;
export type DeleteClustersByClusterIdApiArg = {
  clusterId: Ulid;
};
export type GetErrorApiResponse = unknown;
export type GetErrorApiArg = void;
export type GetResourcePoolsApiResponse =
  /** status 200 The resource pool definitions */ ResourcePoolsWithIdFiltered;
export type GetResourcePoolsApiArg = {
  /** query parameters */
  resourcePoolsParams?: {
    cpu?: CpuFilter;
    gpu?: Gpu;
    memory?: MemoryFilter;
    max_storage?: StorageFilter;
  };
};
export type PostResourcePoolsApiResponse =
  /** status 201 The resource pool was created */ ResourcePoolWithId;
export type PostResourcePoolsApiArg = {
  resourcePool: ResourcePool;
};
export type GetResourcePoolsByResourcePoolIdApiResponse =
  /** status 200 The resource pool definition */ ResourcePoolWithId;
export type GetResourcePoolsByResourcePoolIdApiArg = {
  resourcePoolId: number;
};
export type PutResourcePoolsByResourcePoolIdApiResponse =
  /** status 200 The resource pool definition */ ResourcePoolWithId;
export type PutResourcePoolsByResourcePoolIdApiArg = {
  resourcePoolId: number;
  resourcePoolPut: ResourcePoolPut;
};
export type PatchResourcePoolsByResourcePoolIdApiResponse =
  /** status 200 The resource pool definition */ ResourcePoolWithId;
export type PatchResourcePoolsByResourcePoolIdApiArg = {
  resourcePoolId: number;
  resourcePoolPatch: ResourcePoolPatch;
};
export type DeleteResourcePoolsByResourcePoolIdApiResponse =
  /** status 204 The resource pool was removed or did not exist in the first place */ void;
export type DeleteResourcePoolsByResourcePoolIdApiArg = {
  resourcePoolId: number;
};
export type GetResourcePoolsByResourcePoolIdClassesApiResponse =
  /** status 200 The resource class in the specific pool */ ResourceClassesWithIdResponse;
export type GetResourcePoolsByResourcePoolIdClassesApiArg = {
  resourcePoolId: number;
  /** Filter for resource classes based on the provided name as a prefix. Omitting this parameter returns all classes. */
  resourceClassParams?: {
    name?: Name;
  };
};
export type PostResourcePoolsByResourcePoolIdClassesApiResponse =
  /** status 201 Created a class in the resource pool */ ResourceClassWithId;
export type PostResourcePoolsByResourcePoolIdClassesApiArg = {
  resourcePoolId: number;
  resourceClass: ResourceClass;
};
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse =
  /** status 200 The resource class that was requested */ ResourceClassWithId;
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdApiArg = {
  resourcePoolId: number;
  classId: string;
};
export type PutResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse =
  /** status 200 Updated the classes in the resource pool */ ResourceClassWithId;
export type PutResourcePoolsByResourcePoolIdClassesAndClassIdApiArg = {
  resourcePoolId: number;
  classId: string;
  resourceClass: ResourceClass;
};
export type PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse =
  /** status 200 Updated the classes in the resource pool */ ResourceClassWithId;
export type PatchResourcePoolsByResourcePoolIdClassesAndClassIdApiArg = {
  resourcePoolId: number;
  classId: string;
  resourceClassPatch: ResourceClassPatch;
};
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiResponse =
  /** status 204 The resource class was removed or did not exist in the first place */ void;
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdApiArg = {
  resourcePoolId: number;
  classId: string;
};
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse =
  /** status 200 All the tolerations for a resource class */ K8SLabelList;
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg =
  {
    resourcePoolId: number;
    classId: string;
  };
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiResponse =
  /** status 204 The tolerations have been removed */ void;
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsApiArg =
  {
    resourcePoolId: number;
    classId: string;
  };
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse =
  /** status 200 All the affinities for a resource class */ NodeAffinityListResponse;
export type GetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg =
  {
    resourcePoolId: number;
    classId: string;
  };
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiResponse =
  /** status 204 The node affinities have been removed */ void;
export type DeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesApiArg =
  {
    resourcePoolId: number;
    classId: string;
  };
export type GetResourcePoolsByResourcePoolIdUsersApiResponse =
  /** status 200 The list of users */ PoolUsersWithId;
export type GetResourcePoolsByResourcePoolIdUsersApiArg = {
  resourcePoolId: number;
};
export type PostResourcePoolsByResourcePoolIdUsersApiResponse =
  /** status 201 The list of users was updated */ PoolUsersWithId;
export type PostResourcePoolsByResourcePoolIdUsersApiArg = {
  resourcePoolId: number;
  /** List of user Ids */
  poolUsersWithId: PoolUsersWithId;
};
export type PutResourcePoolsByResourcePoolIdUsersApiResponse =
  /** status 200 The list of users was updated */ PoolUsersWithId;
export type PutResourcePoolsByResourcePoolIdUsersApiArg = {
  resourcePoolId: number;
  /** List of user Ids */
  poolUsersWithId: PoolUsersWithId;
};
export type GetResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse =
  /** status 200 The user belongs to the resource pool */ PoolUserWithId;
export type GetResourcePoolsByResourcePoolIdUsersAndUserIdApiArg = {
  resourcePoolId: number;
  userId: string;
};
export type DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiResponse =
  /** status 204 The user was removed or it was not part of the pool */ void;
export type DeleteResourcePoolsByResourcePoolIdUsersAndUserIdApiArg = {
  resourcePoolId: number;
  userId: string;
};
export type GetResourcePoolsByResourcePoolIdQuotaApiResponse =
  /** status 200 The resource quota for the resource pool */ QuotaWithId;
export type GetResourcePoolsByResourcePoolIdQuotaApiArg = {
  resourcePoolId: number;
};
export type PutResourcePoolsByResourcePoolIdQuotaApiResponse =
  /** status 200 The quota has been updated */ QuotaWithId;
export type PutResourcePoolsByResourcePoolIdQuotaApiArg = {
  resourcePoolId: number;
  quotaWithId: QuotaWithId;
};
export type PatchResourcePoolsByResourcePoolIdQuotaApiResponse =
  /** status 200 The quota has been updated */ QuotaWithId;
export type PatchResourcePoolsByResourcePoolIdQuotaApiArg = {
  resourcePoolId: number;
  quotaPatch: QuotaPatch;
};
export type GetUsersByUserIdResourcePoolsApiResponse =
  /** status 200 The resource pools that the user has access to */ ResourcePoolsWithId;
export type GetUsersByUserIdResourcePoolsApiArg = {
  userId: string;
  /** Filter for resource classes based on the provided name as a prefix. Omitting this parameter returns all classes. */
  userResourceParams?: {
    name?: Name;
  };
};
export type PostUsersByUserIdResourcePoolsApiResponse =
  /** status 201 The resource pools that the user has been given access to */ ResourcePoolsWithId;
export type PostUsersByUserIdResourcePoolsApiArg = {
  userId: string;
  /** List of resource pool IDs */
  integerIds: IntegerIds;
};
export type PutUsersByUserIdResourcePoolsApiResponse =
  /** status 200 The resource pools that the user has been given access to */ ResourcePoolsWithId;
export type PutUsersByUserIdResourcePoolsApiArg = {
  userId: string;
  /** List of resource pool IDs */
  integerIds: IntegerIds;
};
export type GetVersionApiResponse = /** status 200 The error */ Version;
export type GetVersionApiArg = void;
export type Name = string;
export type Cpu = number;
export type Memory = number;
export type Gpu = number;
export type Storage = number;
export type IntegerId = number;
export type DefaultFlag = boolean;
export type K8SLabel = string;
export type K8SLabelList = K8SLabel[];
export type NodeAffinity = {
  key: K8SLabel;
  required_during_scheduling?: boolean;
};
export type NodeAffinityList = NodeAffinity[];
export type ResourceClassWithId = {
  name: Name;
  cpu: Cpu;
  memory: Memory;
  gpu: Gpu;
  max_storage: Storage;
  default_storage: Storage;
  id: IntegerId;
  default: DefaultFlag;
  tolerations?: K8SLabelList;
  node_affinities?: NodeAffinityList;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type ConfigName = string;
export type Ulid = string;
export type Protocol = "http" | "https";
export type Host = string;
export type Port = number;
export type IngressClassName = string;
export type IngressAnnotations = {
  [key: string]: any;
};
export type TlsSecretName = string;
export type StorageClassName = string;
export type ClusterWithId = {
  name: Name;
  config_name: ConfigName;
  id: Ulid;
  session_protocol: Protocol;
  session_host: Host;
  session_port: Port;
  session_path: string;
  session_ingress_class_name?: IngressClassName;
  session_ingress_annotations: IngressAnnotations;
  session_tls_secret_name: TlsSecretName;
  session_storage_class?: StorageClassName;
  service_account_name?: string;
};
export type ClustersWithId = ClusterWithId[];
export type K8SResourceName = string;
export type Cluster = {
  name: Name;
  config_name: ConfigName;
  session_protocol: Protocol;
  session_host: Host;
  session_port: Port;
  session_path: string;
  session_ingress_class_name?: IngressClassName;
  session_ingress_annotations: IngressAnnotations;
  session_tls_secret_name: TlsSecretName;
  session_storage_class?: StorageClassName;
  service_account_name?: K8SResourceName;
};
export type K8SResourceNamePatch = string;
export type ClusterPatch = {
  name?: Name;
  config_name?: ConfigName;
  session_protocol?: Protocol;
  session_host?: Host;
  session_port?: Port;
  session_path?: string;
  session_ingress_class_name?: IngressClassName;
  session_ingress_annotations?: IngressAnnotations;
  session_tls_secret_name?: TlsSecretName;
  session_storage_class?: StorageClassName;
  service_account_name?: K8SResourceNamePatch;
};
export type QuotaWithId = {
  cpu: Cpu;
  memory: Memory;
  gpu: Gpu;
  id: Name;
};
export type ResourceClassWithIdFiltered = {
  name: Name;
  cpu: Cpu;
  memory: Memory;
  gpu: Gpu;
  max_storage: Storage;
  default_storage: Storage;
  id: IntegerId;
  default: DefaultFlag;
  matching?: boolean;
  tolerations?: K8SLabelList;
  node_affinities?: NodeAffinityList;
};
export type PublicFlag = boolean;
export type RemoteConfigurationFirecrestProviderId = string;
export type RemoteConfigurationFirecrestApiUrl = string;
export type RemoteConfigurationFirecrestSystemName = string;
export type RemoteConfigurationFirecrestPartition = string;
export type RemoteConfigurationFirecrest = {
  /** Kind of remote resource pool */
  kind: "firecrest";
  provider_id?: RemoteConfigurationFirecrestProviderId;
  api_url: RemoteConfigurationFirecrestApiUrl;
  system_name: RemoteConfigurationFirecrestSystemName;
  partition?: RemoteConfigurationFirecrestPartition;
};
export type RemoteConfiguration = RemoteConfigurationFirecrest;
export type IdleThreshold = number;
export type HibernationThreshold = number;
export type ResourcePoolWithIdFiltered = {
  quota?: QuotaWithId;
  classes: ResourceClassWithIdFiltered[];
  name: Name;
  id: IntegerId;
  public: PublicFlag;
  default: DefaultFlag;
  remote?: RemoteConfiguration;
  idle_threshold?: IdleThreshold;
  hibernation_threshold?: HibernationThreshold;
  cluster_id?: Ulid;
};
export type ResourcePoolsWithIdFiltered = ResourcePoolWithIdFiltered[];
export type CpuFilter = number;
export type MemoryFilter = number;
export type StorageFilter = number;
export type ResourcePoolWithId = {
  quota?: QuotaWithId;
  classes: ResourceClassWithId[];
  name: Name;
  id: IntegerId;
  public: PublicFlag;
  default: DefaultFlag;
  remote?: RemoteConfiguration;
  idle_threshold?: IdleThreshold;
  hibernation_threshold?: HibernationThreshold;
  cluster?: {
    id: Ulid;
  };
};
export type QuotaWithOptionalId = {
  cpu: Cpu;
  memory: Memory;
  gpu: Gpu;
  id?: Name;
};
export type ResourceClass = {
  name: Name;
  cpu: Cpu;
  memory: Memory;
  gpu: Gpu;
  max_storage: Storage;
  default_storage: Storage;
  default: DefaultFlag;
  tolerations?: K8SLabelList;
  node_affinities?: NodeAffinityList;
};
export type ResourceClasses = ResourceClass[];
export type ResourcePool = {
  quota?: QuotaWithOptionalId;
  classes: ResourceClasses;
  name: Name;
  public: PublicFlag;
  default: DefaultFlag;
  remote?: RemoteConfiguration;
  idle_threshold?: IdleThreshold;
  hibernation_threshold?: HibernationThreshold;
  cluster_id?: Ulid;
};
export type ResourceClassesWithId = ResourceClassWithId[];
export type ResourcePoolPut = {
  quota?: QuotaWithId;
  classes: ResourceClassesWithId;
  name: Name;
  public: PublicFlag;
  default: DefaultFlag;
  remote?: RemoteConfiguration;
  idle_threshold?: IdleThreshold;
  hibernation_threshold?: HibernationThreshold;
  cluster_id?: Ulid;
};
export type QuotaPatch = {
  cpu?: Cpu;
  memory?: Memory;
  gpu?: Gpu;
};
export type DefaultFlagPatch = boolean;
export type ResourceClassPatchWithId = {
  name?: Name;
  cpu?: Cpu;
  memory?: Memory;
  gpu?: Gpu;
  max_storage?: Storage;
  default_storage?: Storage;
  id: IntegerId;
  default?: DefaultFlagPatch;
  tolerations?: K8SLabelList;
  node_affinities?: NodeAffinityList;
};
export type ResourceClassesPatchWithId = ResourceClassPatchWithId[];
export type PublicFlagPatch = boolean;
export type RemoteConfigurationPatchReset = object;
export type RemoteConfigurationFirecrestPatch = {
  /** Kind of remote resource pool */
  kind?: "firecrest";
  provider_id?: RemoteConfigurationFirecrestProviderId;
  api_url?: RemoteConfigurationFirecrestApiUrl;
  system_name?: RemoteConfigurationFirecrestSystemName;
  partition?: RemoteConfigurationFirecrestPartition;
};
export type RemoteConfigurationPatch =
  | RemoteConfigurationPatchReset
  | RemoteConfigurationFirecrestPatch;
export type ResourcePoolPatch = {
  quota?: QuotaPatch;
  classes?: ResourceClassesPatchWithId;
  name?: Name;
  public?: PublicFlagPatch;
  default?: DefaultFlagPatch;
  remote?: RemoteConfigurationPatch;
  idle_threshold?: IdleThreshold;
  hibernation_threshold?: HibernationThreshold;
  cluster_id?: Ulid;
};
export type ResourceClassesWithIdResponse = ResourceClassWithId[];
export type ResourceClassPatch = {
  name?: Name;
  cpu?: Cpu;
  memory?: Memory;
  gpu?: Gpu;
  max_storage?: Storage;
  default_storage?: Storage;
  default?: DefaultFlagPatch;
  tolerations?: K8SLabelList;
  node_affinities?: NodeAffinityList;
};
export type NodeAffinityListResponse = NodeAffinity[];
export type UserId = string;
export type PoolUserWithId = {
  id: UserId;
  /** If set to true the user will not be able to use the default resource pool */
  no_default_access?: boolean;
};
export type PoolUsersWithId = PoolUserWithId[];
export type ResourcePoolsWithId = ResourcePoolWithId[];
export type IntegerIds = IntegerId[];
export type Version = {
  version: string;
};
export const {
  useGetClassesByClassIdQuery,
  useGetClustersQuery,
  usePostClustersMutation,
  useGetClustersByClusterIdQuery,
  usePutClustersByClusterIdMutation,
  usePatchClustersByClusterIdMutation,
  useDeleteClustersByClusterIdMutation,
  useGetErrorQuery,
  useGetResourcePoolsQuery,
  usePostResourcePoolsMutation,
  useGetResourcePoolsByResourcePoolIdQuery,
  usePutResourcePoolsByResourcePoolIdMutation,
  usePatchResourcePoolsByResourcePoolIdMutation,
  useDeleteResourcePoolsByResourcePoolIdMutation,
  useGetResourcePoolsByResourcePoolIdClassesQuery,
  usePostResourcePoolsByResourcePoolIdClassesMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdQuery,
  usePutResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  usePatchResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsQuery,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdTolerationsMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesQuery,
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdNodeAffinitiesMutation,
  useGetResourcePoolsByResourcePoolIdUsersQuery,
  usePostResourcePoolsByResourcePoolIdUsersMutation,
  usePutResourcePoolsByResourcePoolIdUsersMutation,
  useGetResourcePoolsByResourcePoolIdUsersAndUserIdQuery,
  useDeleteResourcePoolsByResourcePoolIdUsersAndUserIdMutation,
  useGetResourcePoolsByResourcePoolIdQuotaQuery,
  usePutResourcePoolsByResourcePoolIdQuotaMutation,
  usePatchResourcePoolsByResourcePoolIdQuotaMutation,
  useGetUsersByUserIdResourcePoolsQuery,
  usePostUsersByUserIdResourcePoolsMutation,
  usePutUsersByUserIdResourcePoolsMutation,
  useGetVersionQuery,
} = injectedRtkApi;
