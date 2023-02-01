/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { formatProjectMetadata, ProjectMetadata } from "../../utils/helpers/ProjectFunctions";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface QueryParams {
  per_page: number;
  endCursor: string;
}

interface MemberProjectResponse {
  data: ProjectMetadata[];
  endCursor: string;
  hasNextPage: boolean;
}


export const projectApi = createApi({
  reducerPath: "projects",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api" }),
  endpoints: (builder) => ({
    getNamespaces: builder.query({
      query: (ownerOnly?: boolean) => ({ url: `/namespaces${ownerOnly ? "?owned_only=true" : ""}`, method: "GET" }),
    }),
    getGroupByPath: builder.query<any, string>({
      query: (projectPath) => {
        const urlEncodedPath = encodeURIComponent(projectPath);
        return { url: `/groups/${urlEncodedPath}`, method: "GET" };
      }
    }),
    getMemberProjects: builder.query<any, QueryParams>({
      query: (queryParams: QueryParams ) => {
        const params = { "variables": null, "operationName": null };
        let query = `{
          projects(membership: true, first:${queryParams.per_page}, after:"${queryParams.endCursor}") {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              id
              name
              fullPath
              namespace {
                fullPath
              }
              path,
              httpUrlToRepo,
              userPermissions {
                adminProject,
                pushCode,
                removeProject
              }
            }
          }
        }`;
        let headers = {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        };
        return {
          url: `/graphql`,
          method: "POST",
          body: JSON.stringify({ ...params, query }),
          headers: new Headers(headers)
        };
      },
      transformResponse: (response: any): MemberProjectResponse => {
        try {
          const projects = response?.data?.projects?.nodes;
          const pageInfo = response?.data?.projects?.pageInfo;
          const data = projects?.map((project: any) => formatProjectMetadata(project));
          return {
            endCursor: pageInfo.endCursor,
            hasNextPage: pageInfo.hasNextPage,
            data,
          };
        }
        catch (e) {
          return {
            data: [],
            endCursor: "",
            hasNextPage: false,
          };
        }
      },
      keepUnusedDataFor: 5,
    }),
    getRecentlyVisitedProjects: builder.query<any, number>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        // get list of projects recently visited
        const projectListRequest = await fetchWithBQ(`/last-projects/${_arg}`);
        if (projectListRequest.error)
          return { error: projectListRequest.error as FetchBaseQueryError };
        const resultProjects = projectListRequest.data as any;
        const projects = resultProjects.projects;

        if (projects?.length > 0) {
          // if the user has recent projects get the project information
          const projectRequests = [];
          for (const project of projects) {
            projectRequests
              .push(fetchWithBQ(`/projects/${encodeURIComponent(project)}?statistics=false&doNotTrack=true`));
          }

          try {
            const resultAllProjectData = await Promise.allSettled(projectRequests);
            const projectList = [];
            for (const projectData of resultAllProjectData) {
              if (projectData.status === "fulfilled")
                projectList.push(formatProjectMetadata(projectData.value.data));
            }
            return { data: projectList };
          }
          catch (e) {
            return { error: e as FetchBaseQueryError };
          }
        }
        else {
          return { data: [] };
        }
      },
    }),
  }),
  refetchOnMountOrArgChange: 3,
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetNamespacesQuery,
  useGetGroupByPathQuery,
  useGetMemberProjectsQuery,
  useGetRecentlyVisitedProjectsQuery
} = projectApi;
