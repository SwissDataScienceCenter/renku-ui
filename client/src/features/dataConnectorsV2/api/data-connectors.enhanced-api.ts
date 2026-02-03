import { processApiPaginationHeaders } from "~/utils/helpers/pagination.utils";
import {
  DataConnectorsPaginated,
  DataConnectorToProjectLinksPaginated,
} from "../dataConnectors.types";
import type {
  GetDataConnectorsApiArg,
  GetDataConnectorsApiResponse,
  GetDataConnectorsByDataConnectorIdApiArg,
  GetDataConnectorsByDataConnectorIdApiResponse,
  GetDataConnectorsByDataConnectorIdProjectLinksApiArg,
  GetDataConnectorsByDataConnectorIdProjectLinksApiResponse,
  GetDataConnectorsByDataConnectorIdSecretsApiArg,
  GetDataConnectorsByDataConnectorIdSecretsApiResponse,
} from "./data-connectors.api";
import { dataConnectorsApi as api } from "./data-connectors.api";

interface GetDataConnectorsListByDataConnectorIdsApiArg {
  dataConnectorIds: GetDataConnectorsByDataConnectorIdApiArg["dataConnectorId"][];
}

type GetDataConnectorsListByDataConnectorIdsApiResponse = Record<
  string,
  GetDataConnectorsByDataConnectorIdApiResponse
>;

interface GetDataConnectorListSecretsApiArg {
  dataConnectorIds: GetDataConnectorsByDataConnectorIdSecretsApiArg["dataConnectorId"][];
}

type GetDataConnectorListSecretsApiResponse = Record<
  string,
  GetDataConnectorsByDataConnectorIdSecretsApiResponse
>;

const withNewEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getDataConnectorsListByDataConnectorIds: builder.query<
      GetDataConnectorsListByDataConnectorIdsApiResponse,
      GetDataConnectorsListByDataConnectorIdsApiArg
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { dataConnectorIds } = queryArg;
        const result: GetDataConnectorsListByDataConnectorIdsApiResponse = {};
        const promises = dataConnectorIds.map((dataConnectorId) =>
          fetchWithBQ(`/data_connectors/${dataConnectorId}`)
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < dataConnectorIds.length; i++) {
          const dataConnectorId = dataConnectorIds[i];
          const response = responses[i];
          if (response.error) return response;
          result[dataConnectorId] =
            response.data as GetDataConnectorsByDataConnectorIdApiResponse;
        }
        return { data: result };
      },
    }),
    getDataConnectorsListSecrets: builder.query<
      GetDataConnectorListSecretsApiResponse,
      GetDataConnectorListSecretsApiArg
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { dataConnectorIds } = queryArg;
        const result: GetDataConnectorListSecretsApiResponse = {};
        const promises = dataConnectorIds.map((dataConnectorId) =>
          fetchWithBQ(`/data_connectors/${dataConnectorId}/secrets`)
        );
        const responses = await Promise.all(promises);
        for (let i = 0; i < dataConnectorIds.length; i++) {
          const dataConnectorId = dataConnectorIds[i];
          const response = responses[i];
          if (response.error) return response;
          result[dataConnectorId] =
            response.data as GetDataConnectorsByDataConnectorIdSecretsApiResponse;
        }
        return { data: result };
      },
    }),
  }),
});

const withPagination = withNewEndpoints.injectEndpoints({
  endpoints: (builder) => ({
    getDataConnectors: builder.query<
      DataConnectorsPaginated,
      GetDataConnectorsApiArg
    >({
      query: (queryArg) => ({
        url: "/data_connectors",
        params: {
          namespace: queryArg.params?.namespace,
          page: queryArg.params?.page,
          per_page: queryArg.params?.per_page,
        },
      }),
      transformResponse: (data: GetDataConnectorsApiResponse, meta) => {
        const headers = meta?.response?.headers;
        const pagination = processApiPaginationHeaders(headers);
        return {
          data,
          pagination,
        };
      },
    }),
    getDataConnectorsByDataConnectorIdProjectLinks: builder.query<
      DataConnectorToProjectLinksPaginated,
      GetDataConnectorsByDataConnectorIdProjectLinksApiArg
    >({
      query: (queryArg) => ({
        url: `/data_connectors/${queryArg.dataConnectorId}/project_links`,
        params: {
          page: queryArg.params?.page,
          per_page: queryArg.params?.per_page,
        },
      }),
      transformResponse: (
        data: GetDataConnectorsByDataConnectorIdProjectLinksApiResponse,
        meta
      ) => {
        const headers = meta?.response?.headers;
        const pagination = processApiPaginationHeaders(headers);
        return {
          data,
          pagination,
        };
      },
    }),
  }),
  overrideExisting: true,
});

const enhancedApi = withPagination.enhanceEndpoints({
  addTagTypes: [
    "DataConnectors",
    "DataConnectorsProjectLinks",
    "DataConnectorSecrets",
  ],
  endpoints: {
    deleteDataConnectorsByDataConnectorId: {
      invalidatesTags: ["DataConnectors"],
    },
    deleteDataConnectorsByDataConnectorIdProjectLinksAndLinkId: {
      invalidatesTags: ["DataConnectorsProjectLinks"],
    },
    deleteDataConnectorsByDataConnectorIdSecrets: {
      invalidatesTags: ["DataConnectorSecrets"],
    },
    getDataConnectors: {
      providesTags: ["DataConnectors"],
    },
    getDataConnectorsByDataConnectorId: {
      providesTags: ["DataConnectors"],
    },
    getDataConnectorsListByDataConnectorIds: {
      providesTags: ["DataConnectors"],
    },
    getDataConnectorsListSecrets: {
      providesTags: ["DataConnectorSecrets"],
    },
    getDataConnectorsByDataConnectorIdProjectLinks: {
      providesTags: ["DataConnectorsProjectLinks"],
    },
    getDataConnectorsByDataConnectorIdSecrets: {
      providesTags: ["DataConnectorSecrets"],
    },
    getNamespacesByNamespaceDataConnectorsAndSlug: {
      providesTags: ["DataConnectors"],
    },
    getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug: {
      providesTags: ["DataConnectors"],
    },
    getProjectsByProjectIdDataConnectorLinks: {
      providesTags: ["DataConnectorsProjectLinks"],
    },
    patchDataConnectorsByDataConnectorId: {
      invalidatesTags: ["DataConnectors"],
    },
    patchDataConnectorsByDataConnectorIdSecrets: {
      invalidatesTags: ["DataConnectorSecrets"],
    },
    postDataConnectors: {
      invalidatesTags: ["DataConnectors"],
    },
    postDataConnectorsByDataConnectorIdProjectLinks: {
      invalidatesTags: ["DataConnectorsProjectLinks"],
    },
    postDataConnectorsGlobal: {
      invalidatesTags: ["DataConnectors"],
    },
  },
});

export { enhancedApi as dataConnectorsApi };
export const {
  // data connectors hooks
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  useGetDataConnectorsQuery,
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  useGetDataConnectorsListByDataConnectorIdsQuery,
  useGetDataConnectorsListSecretsQuery,
  useGetNamespacesByNamespaceDataConnectorsAndSlugQuery,
  useGetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsMutation,
  usePostDataConnectorsGlobalMutation,
  useGetDataConnectorsByDataConnectorIdPermissionsQuery,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery,
} = enhancedApi;
