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

interface GetProjectLfsParams {
  projectId: number;
  filePath: string;
  branch: string;
}

export const lfsApi = createApi({
  reducerPath: "lfsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api" }),
  keepUnusedDataFor: 10,
  endpoints: (builder) => ({
    getLFSFile: builder.query<any, GetProjectLfsParams>({
      query: ({ projectId, filePath, branch }) => {
        console.log("✅ send request to getLFSFile");
        return {
          // url: `${projectId}/repository/files/${filePath}/raw?ref=${branch}&lfs=true`,
          url: `get-lfs-file?projectId=${projectId}&filePath=${filePath}&branchName=${branch}`,
        };
      },
      transformResponse: (response: any) => {
        if (!response.result) throw new Error("Unexpected response");
        return {
          files: response.result.files,
          slug: response.result.slug,
          remoteBranch: response.result.remote_branch,
        };
      },
    }),
  }),
});

export const { useGetLFSFileQuery } = lfsApi;
