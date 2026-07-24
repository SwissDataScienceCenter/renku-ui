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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as persistedLogsGeneratedApi };
export type GetPersistedLogsSessionsByLauncherIdApiResponse =
  /** status 200 The session logs from the corresponding run and container, paginated.
   */ PersistedSessionLogs;
export type GetPersistedLogsSessionsByLauncherIdApiArg = {
  launcherId: Ulid;
  params?: PersistedLogsGetQuery;
};
export type GetPersistedLogsSessionsByLauncherIdRunsApiResponse =
  /** status 200 The session runs for which logs exist.
   */ SessionRuns;
export type GetPersistedLogsSessionsByLauncherIdRunsApiArg = {
  launcherId: Ulid;
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
export type SessionRunLog = {
  container: string;
  logs: PersistedLogLines;
};
export type SessionRunLogs = SessionRunLog[];
export type PersistedSessionLogs = {
  run: SessionRun;
  logs: SessionRunLogs;
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
export type PersistedLogsGetQuery = {
  run_id?: Ulid;
  submission_id?: string;
};
export type SessionRuns = SessionRun[];
