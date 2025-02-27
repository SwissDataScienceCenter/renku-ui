import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Project } from "../projectsV2/api/projectV2.api";

export const projectMigrationApi = createApi({
  reducerPath: "renku_v1_projects",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api" }),
  endpoints: (builder) => ({
    getMigration: builder.query<Project, number>({
      query: (projectId) => {
        return {
          url: `/data/renku_v1_projects/${projectId}/migrations`,
          method: "GET",
        };
      },
    }),
  }),
  refetchOnMountOrArgChange: 3,
  keepUnusedDataFor: 0,
});

export const { useGetMigrationQuery } = projectMigrationApi;
