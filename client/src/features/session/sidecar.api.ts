/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  GitStatusResult,
  HealthState,
  PullResult,
  SaveArgs,
  SaveResult,
  SidecarRequestArgs,
} from "./sidecar.types";

const baseQuery = fetchBaseQuery({ baseUrl: "/sessions/" });
const baseQueryWithRedirectHandler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (typeof args === "string") {
    return baseQuery(args, api, extraOptions);
  }

  // Perform the initial query without following redirects
  const newArgs: FetchArgs = {
    ...args,
    redirect: "error",
  };
  const result = await baseQuery(newArgs, api, extraOptions);

  // Handle re-authentication requests manually
  if (result.error && result.error.status === 302) {
    const location = result.meta?.response?.headers.get("Location");
    if (!location) {
      return result;
    }

    const reAuthResult = await baseQuery(location, api, extraOptions);
    // ? If the original request used "POST", then the redirect will end up with "405 Method Not Allowed"
    if (reAuthResult.error == null || reAuthResult.error.status === 405) {
      const resultAgain = await baseQuery(newArgs, api, extraOptions);
      return resultAgain;
    }
  }

  return result;
};

const sessionSidecarApi = createApi({
  reducerPath: "sessionSidecarApi",
  baseQuery: baseQueryWithRedirectHandler,
  tagTypes: [],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    gitStatus: builder.query<GitStatusResult, SidecarRequestArgs>({
      query: (args) => {
        const body = {
          id: 0,
          jsonrpc: "2.0",
          method: "git/get_status",
        };
        return {
          body,
          method: "POST",
          url: `${args.serverName}/sidecar/jsonrpc/`,
        };
      },
    }),
    health: builder.query<HealthState, SidecarRequestArgs>({
      query: (args) => {
        return {
          url: `${args.serverName}/sidecar/health/`,
        };
      },
    }),
    renkuSave: builder.mutation<SaveResult, SaveArgs>({
      query: (args) => {
        const body = {
          id: 0,
          jsonrpc: "2.0",
          method: "renku/run",
          params: {
            command_name: "save",
            message: args.message,
          },
        };
        return {
          body,
          method: "POST",
          url: `${args.serverName}/sidecar/jsonrpc`,
        };
      },
    }),
    renkuPull: builder.mutation<PullResult, SidecarRequestArgs>({
      query: (args) => {
        const body = {
          id: 0,
          jsonrpc: "2.0",
          method: "git/pull",
        };
        return {
          body,
          method: "POST",
          url: `${args.serverName}/sidecar/jsonrpc`,
        };
      },
    }),
  }),
});

export default sessionSidecarApi;
export const {
  useGitStatusQuery,
  useHealthQuery,
  useRenkuSaveMutation,
  useRenkuPullMutation,
} = sessionSidecarApi;
