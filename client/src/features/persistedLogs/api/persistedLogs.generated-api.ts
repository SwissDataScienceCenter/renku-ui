import { persistedLogsEmptyApi as api } from "./persistedLogs.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPersistedLogsSessionsByLauncherId: build.query<
      GetPersistedLogsSessionsByLauncherIdApiResponse,
      GetPersistedLogsSessionsByLauncherIdApiArg
    >({
      query: (queryArg) => ({
        url: `/persisted_logs/sessions/${queryArg.launcherId}`,
        params: {
          params: queryArg.params,
        },
      }),
    }),
    getPersistedLogsSessionsByLauncherIdRuns: build.query<
      GetPersistedLogsSessionsByLauncherIdRunsApiResponse,
      GetPersistedLogsSessionsByLauncherIdRunsApiArg
    >({
      query: (queryArg) => ({
        url: `/persisted_logs/sessions/${queryArg.launcherId}/runs`,
      }),
    }),
    getPersistedLogsBuildsByBuildId: build.query<
      GetPersistedLogsBuildsByBuildIdApiResponse,
      GetPersistedLogsBuildsByBuildIdApiArg
    >({
      query: (queryArg) => ({
        url: `/persisted_logs/builds/${queryArg.buildId}`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as persistedLogsGeneratedApi };
export type GetPersistedLogsSessionsByLauncherIdApiResponse =
  /** status 200 The persisted logs from the corresponding session run.
   */ PersistedSessionLogs;
export type GetPersistedLogsSessionsByLauncherIdApiArg = {
  launcherId: Ulid;
  params?: PersistedSessionLogsGetQuery;
};
export type GetPersistedLogsSessionsByLauncherIdRunsApiResponse =
  /** status 200 The session runs for which logs exist.
   */ SessionRuns;
export type GetPersistedLogsSessionsByLauncherIdRunsApiArg = {
  launcherId: Ulid;
};
export type GetPersistedLogsBuildsByBuildIdApiResponse =
  /** status 200 The image build logs from the corresponding image build.
   */ PersistedBuildLogs;
export type GetPersistedLogsBuildsByBuildIdApiArg = {
  buildId: Ulid;
};
export type Ulid = string;
export type SessionRun = {
  id: Ulid;
  session_uid?: string;
  launcher_id: Ulid;
  submission_id?: string;
};
export type NanoTimestamp = string;
export type PersistedLogLine = {
  timestamp: NanoTimestamp;
  log_line: string;
};
export type PersistedLogLines = PersistedLogLine[];
export type ContainerLogs = {
  container: string;
  logs: PersistedLogLines;
};
export type LogsPerContainer = ContainerLogs[];
export type PersistedSessionLogs = {
  run: SessionRun;
  logs: LogsPerContainer;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
    /** Sentry trace ID for linking to corresponding log entries */
    trace_id?: string;
  };
};
export type PersistedSessionLogsGetQuery = {
  run_id?: Ulid;
  submission_id?: string;
};
export type SessionRuns = SessionRun[];
export type PersistedBuildLogs = {
  logs: LogsPerContainer;
};
