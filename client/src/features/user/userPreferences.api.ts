/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { DataServicesError } from "../dataServices/dataServices.types";
import {
  AddPinnedProjectParams,
  RemovePinnedProjectParams,
  UserPreferences,
} from "./userPreferences.types";

const userPreferencesApi = createApi({
  reducerPath: "userPreferencesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/ui-server/api/data/user_preferences",
  }),
  tagTypes: ["UserPreferences"],
  endpoints: (builder) => ({
    getUserPreferences: builder.query<UserPreferences | null, void>({
      query: () => {
        return {
          url: "",
          validateStatus: (response) => {
            return response.status < 400 || response.status == 404;
          },
        };
      },
      transformResponse: (
        result: UserPreferences | DataServicesError | null | undefined
      ) => {
        if (result == null || "error" in result) {
          return null;
        }
        return result;
      },
      providesTags: ["UserPreferences"],
    }),
    addPinnedProject: builder.mutation<UserPreferences, AddPinnedProjectParams>(
      {
        query: ({ project_slug }) => {
          return {
            method: "POST",
            url: "pinned_projects",
            body: { project_slug },
          };
        },
        invalidatesTags: ["UserPreferences"],
      }
    ),
    removePinnedProject: builder.mutation<
      UserPreferences,
      RemovePinnedProjectParams
    >({
      query: ({ project_slug }) => {
        return {
          method: "DELETE",
          url: "pinned_projects",
          params: { project_slug },
        };
      },
      invalidatesTags: ["UserPreferences"],
    }),
  }),
});

export default userPreferencesApi;
export const {
  useGetUserPreferencesQuery,
  useAddPinnedProjectMutation,
  useRemovePinnedProjectMutation,
} = userPreferencesApi;
