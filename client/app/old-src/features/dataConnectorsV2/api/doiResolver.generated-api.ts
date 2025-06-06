import { doiResolverEmptyApi as api } from "./doiResolver.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHandlesByDoi: build.query<
      GetHandlesByDoiApiResponse,
      GetHandlesByDoiApiArg
    >({
      query: (queryArg) => ({
        url: `/handles/${queryArg.doi}`,
        params: { index: queryArg.index },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as doiResolverGeneratedApi };
export type GetHandlesByDoiApiResponse =
  /** status 200 The handle response */ HandleResponse;
export type GetHandlesByDoiApiArg = {
  /** the DOI */
  doi: Doi;
  /** index of interest */
  index?: number;
};
export type HandleResponseValueData = {
  format?: string;
  value?: string | any | object;
};
export type HandleResponseValue = {
  index?: number;
  type?: string;
  data?: HandleResponseValueData;
  ttl?: number;
  timestamp?: string;
};
export type HandleResponseValues = HandleResponseValue[];
export type HandleResponse = {
  responseCode?: number;
  handle?: string;
  values?: HandleResponseValues;
};
export type ErrorResponse = {
  [key: string]: any;
};
export type Doi = string;
export const { useGetHandlesByDoiQuery } = injectedRtkApi;
