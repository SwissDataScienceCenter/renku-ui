import { projectV2Api as api } from "./projectV2.api";
import type {
  ErrorResponse,
  GetProjectsApiArg,
  GetProjectsApiResponse as GetProjectsApiResponseOrig,
  ProjectsList,
} from "./projectV2.api";

interface GetProjectsApiResponse {
  projects: GetProjectsApiResponseOrig;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const injectedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectsPaged: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: `/projects`,
        params: { page: queryArg.page, per_page: queryArg.perPage },
      }),
      transformResponse: (response, meta, queryArg) => {
        const projects = response as ProjectsList;
        const headerPage = meta?.response?.headers.get("page");
        const headerPerPage = meta?.response?.headers.get("per-page");
        const headerTotal = meta?.response?.headers.get("total");
        const headerTotalPages = meta?.response?.headers.get("total-pages");
        const page = headerPage ? parseInt(headerPage) : queryArg.page ?? 1;
        const perPage = headerPerPage
          ? parseInt(headerPerPage)
          : queryArg.perPage ?? 20;
        const total = headerTotal
          ? parseInt(headerTotal)
          : projects
          ? projects.length
          : 0;
        const totalPages = headerTotalPages
          ? parseInt(headerTotalPages)
          : total / perPage;
        return {
          projects,
          page,
          perPage,
          total,
          totalPages,
        };
      },
    }),
  }),
});

const enhancedApi = injectedApi.enhanceEndpoints({
  addTagTypes: ["Project", "Members"],
  endpoints: {
    deleteProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    deleteProjectsByProjectIdMembersAndMemberId: {
      invalidatesTags: ["Members"],
    },
    // alternatively, define a function which is called with the endpoint definition as an argument
    getProjects: {
      providesTags: ["Project"],
    },
    getProjectsPaged: {
      providesTags: ["Project"],
    },
    getProjectsByProjectId: {
      providesTags: ["Project"],
    },
    getProjectsByProjectIdMembers: {
      providesTags: ["Members"],
    },
    patchProjectsByProjectId: {
      invalidatesTags: ["Project"],
    },
    patchProjectsByProjectIdMembers: {
      invalidatesTags: ["Members"],
    },
  },
});

export { enhancedApi as projectV2Api };
export const {
  useGetProjectsPagedQuery: useGetProjectsQuery,
  usePostProjectsMutation,
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMembersMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
} = enhancedApi;

export function isErrorResponse(arg: unknown): arg is { data: ErrorResponse } {
  return (arg as { data: ErrorResponse }).data?.error != null;
}
