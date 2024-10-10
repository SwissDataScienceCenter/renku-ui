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

const enhancedApi = injectedApi.enhanceEndpoints({
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
    getDataConnectorsPaged: {
      providesTags: ["DataConnectors"],
    },
    getDataConnectorsByDataConnectorId: {
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
  },
});

export { enhancedApi as dataConnectorsApi };
export const {
  // data connectors hooks
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  useGetDataConnectorsPagedQuery: useGetDataConnectorsQuery,
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  useGetDataConnectorsListSecretsQuery,
  useGetNamespacesByNamespaceDataConnectorsAndSlugQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsMutation,
} = enhancedApi;
