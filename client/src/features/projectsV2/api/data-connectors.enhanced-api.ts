import { AbstractKgPaginatedResponse } from "../../../utils/types/pagination.types";
import { processPaginationHeaders } from "../../../utils/helpers/kgPagination.utils";

import { dataConnectorsApi as api } from "./data-connectors.api";

import type {
  GetDataConnectorsApiArg,
  GetDataConnectorsApiResponse as GetDataConnectorsApiResponseOrig,
} from "./data-connectors.api";

export interface GetDataConnectorsApiResponse
  extends AbstractKgPaginatedResponse {
  dataConnectors: GetDataConnectorsApiResponseOrig;
}

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
    patchDataConnectorsByDataConnectorId: {
      invalidatesTags: ["DataConnectors"],
    },
    postDataConnectors: {
      invalidatesTags: ["DataConnectors"],
    },
    postDataConnectorsByDataConnectorIdSecrets: {
      invalidatesTags: ["DataConnectorSecrets"],
    },
  },
});

export { enhancedApi as dataConnectorsApi };
export const {
  // data connectors hooks
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  useGetDataConnectorsPagedQuery: useGetDataConnectorsQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePostDataConnectorsMutation,
  usePostDataConnectorsByDataConnectorIdSecretsMutation,
} = enhancedApi;
