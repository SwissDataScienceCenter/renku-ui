import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { dataConnectorsApi as api } from "./data-connectors.api";

import type {
  GetDataConnectorsApiArg,
  GetDataConnectorsApiResponse as GetDataConnectorsApiResponseOrig,
  GetDataConnectorsByDataConnectorIdSecretsApiArg,
  GetDataConnectorsByDataConnectorIdSecretsApiResponse,
} from "./data-connectors.api";

export interface GetDataConnectorsApiResponse
  extends AbstractKgPaginatedResponse {
  dataConnectors: GetDataConnectorsApiResponseOrig;
}

interface GetDataConnectorListSecretsApiArg {
  dataConnectorIds: GetDataConnectorsByDataConnectorIdSecretsApiArg["dataConnectorId"][];
}

type GetDataConnectorListSecretsApiResponse = Record<
  string,
  GetDataConnectorsByDataConnectorIdSecretsApiResponse
>;

const injectedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDataConnectorsPaged: builder.query<
      GetDataConnectorsApiResponse,
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
      transformResponse: (response, meta, queryArg) => {
        const dataConnectors = response as GetDataConnectorsApiResponseOrig;
        const headers = meta?.response?.headers;
        const headerResponse = processPaginationHeaders(
          headers,
          queryArg.params == null
            ? {}
            : { page: queryArg.params.page, perPage: queryArg.params.per_page },
          dataConnectors
        );

        return {
          dataConnectors,
          page: headerResponse.page,
          perPage: headerResponse.perPage,
          total: headerResponse.total,
          totalPages: headerResponse.totalPages,
        };
      },
    }),
    getDataConnectorsListSecrets: builder.query<
      GetDataConnectorListSecretsApiResponse,
      GetDataConnectorListSecretsApiArg
    >({
      async queryFn(queryArg, _api, _options, fetchWithBQ) {
        const { dataConnectorIds } = queryArg;
        const result: GetDataConnectorListSecretsApiResponse = {};
        for (const dataConnectorId of dataConnectorIds) {
          const response = await fetchWithBQ(
            `/data_connectors/${dataConnectorId}/secrets`
          );
          if (response.error) {
            return response;
          }
          result[dataConnectorId] =
            response.data as GetDataConnectorsByDataConnectorIdSecretsApiResponse;
        }
        return { data: result };
      },
    }),
  }),
});

const enhancedApi = injectedApi.enhanceEndpoints({
  addTagTypes: ["DataConnectors", "DataConnectorSecrets"],
  endpoints: {
    deleteDataConnectorsByDataConnectorId: {
      invalidatesTags: ["DataConnectors"],
    },
    deleteDataConnectorsByDataConnectorIdSecrets: {
      invalidatesTags: ["DataConnectorSecrets"],
    },
    getDataConnectorsPaged: {
      providesTags: ["DataConnectors"],
    },
    getDataConnectorsListSecrets: {
      providesTags: ["DataConnectorSecrets"],
    },
    getDataConnectorsByDataConnectorIdSecrets: {
      providesTags: ["DataConnectorSecrets"],
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
  },
});

export { enhancedApi as dataConnectorsApi };
export const {
  // data connectors hooks
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  useGetDataConnectorsPagedQuery: useGetDataConnectorsQuery,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  useGetDataConnectorsListSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePostDataConnectorsMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
} = enhancedApi;
