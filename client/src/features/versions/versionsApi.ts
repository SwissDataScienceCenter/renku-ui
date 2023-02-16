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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

import { NotebooksVersion, NotebooksVersionResponse } from "./versions";

export const versionsApi = createApi({
  reducerPath: "versions",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/" }),
  tagTypes: ["versions"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getNotebooks: builder.query<NotebooksVersion, any>({
      query: (args) => {
        return {
          url: "notebooks/version",
        };
      },
      transformResponse: (response: NotebooksVersionResponse) => {
        // We assume there is only one renku-notebooks service version.
        if (response.versions?.length < 1)
          throw new Error("Unexpected response");
        const singleVersion = response.versions[0];
        return {
          name: response.name,
          version: singleVersion?.version ?? "unavailable",
          anonymousSessionsEnabled: singleVersion?.data?.anonymousSessionsEnabled ?? false,
          sshEnabled: singleVersion?.data?.sshEnabled ?? false,
          cloudstorageEnabled:
            (singleVersion?.data?.cloudstorageEnabled?.azure_blob ?? false) ||
            (singleVersion?.data?.cloudstorageEnabled?.s3 ?? false)
        } as NotebooksVersion;
      },
      transformErrorResponse: (baseQueryReturnValue, meta, arg) => {
        return {
          name: "error",
          version: "unavailable",
          anonymousSessionsEnabled: false,
          sshEnabled: false,
          cloudstorageEnabled: false
        } as NotebooksVersion;
      },
    }),
  }),
});

export const { useGetNotebooksQuery } = versionsApi;
