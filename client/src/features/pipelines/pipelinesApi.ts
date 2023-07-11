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
import { GetPipelinesParams } from "./pipelines.types";

const pipelinesApi = createApi({
  reducerPath: "pipelines",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/projects" }),
  tagTypes: ["Job", "Pipeline"],
  endpoints: (builder) => ({
    getPipelines: builder.query<unknown, GetPipelinesParams>({
      query: ({ commit, projectId }) => ({
        url: `${projectId}/pipelines`,
        params: {
          ...(commit ? { sha: commit } : {}),
        },
      }),
    }),
  }),
});

export default pipelinesApi;
export const { useGetPipelinesQuery } = pipelinesApi;
