import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type HealthState = { status: string };

interface SidecarRequestArgs {
  serverName: string;
}

interface SaveArgs extends SidecarRequestArgs {
  message?: string;
}

interface JsonRpcResult {
  id: number;
  jsonRpc: string;
}

interface GitStatusResult extends JsonRpcResult {
  result: {
    ahead: number;
    behind: number;
    branch: string;
    clean: boolean;
    commit: string;
    status: string;
  };
}

interface RenkuOpResult extends JsonRpcResult {
  result: string;
  error?: {
    code: number;
    message: string;
  };
}

interface SaveResult extends RenkuOpResult {}
interface PullResult extends RenkuOpResult {}

export const sessionSidecarApi = createApi({
  reducerPath: "sessionSidecarApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/sessions/" }),
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
          url: `${args.serverName}/sidecar/jsonrpc`,
        };
      },
    }),
    health: builder.query<HealthState, SidecarRequestArgs>({
      query: (args) => {
        return {
          url: `${args.serverName}/sidecar/health`,
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

export const {
  useGitStatusQuery,
  useHealthQuery,
  useRenkuSaveMutation,
  useRenkuPullMutation,
} = sessionSidecarApi;

export type { GitStatusResult, HealthState };
