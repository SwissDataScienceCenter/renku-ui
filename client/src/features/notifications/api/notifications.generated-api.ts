import { notificationsEmptyApi as api } from "./notifications.empty-api";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    postAlerts: build.mutation<PostAlertsApiResponse, PostAlertsApiArg>({
      query: (queryArg) => ({
        url: `/alerts`,
        method: "POST",
        body: queryArg.alertPost,
      }),
    }),
    getAlerts: build.query<GetAlertsApiResponse, GetAlertsApiArg>({
      query: (queryArg) => ({
        url: `/alerts`,
        params: { params: queryArg.params },
      }),
    }),
    patchAlertsByAlertId: build.mutation<
      PatchAlertsByAlertIdApiResponse,
      PatchAlertsByAlertIdApiArg
    >({
      query: (queryArg) => ({
        url: `/alerts/${queryArg.alertId}`,
        method: "PATCH",
        body: queryArg.alertPatch,
      }),
    }),
    postWebhooksAlertmanager: build.mutation<
      PostWebhooksAlertmanagerApiResponse,
      PostWebhooksAlertmanagerApiArg
    >({
      query: (queryArg) => ({
        url: `/webhooks/alertmanager`,
        method: "POST",
        body: queryArg.alertmanagerWebhook,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as notificationsGeneratedApi };
export type PostAlertsApiResponse =
  /** status 201 Alert successfully created */ Alert;
export type PostAlertsApiArg = {
  alertPost: AlertPost;
};
export type GetAlertsApiResponse =
  /** status 200 A list of active alerts for the authenticated user. */ AlertList;
export type GetAlertsApiArg = {
  /** query parameters */
  params?: AlertsGetQuery;
};
export type PatchAlertsByAlertIdApiResponse =
  /** status 200 Alert successfully updated */ Alert;
export type PatchAlertsByAlertIdApiArg = {
  /** The ID of the alert to resolve. */
  alertId: Ulid;
  alertPatch: AlertPatch;
};
export type PostWebhooksAlertmanagerApiResponse =
  /** status 200 Webhook processed successfully. Returns 200 for all requests except authentication and validation errors, even if individual alerts fail to process. Failed alerts are logged but do not affect the response. */ {
    message?: string;
  };
export type PostWebhooksAlertmanagerApiArg = {
  alertmanagerWebhook: AlertmanagerWebhook;
};
export type Ulid = string;
export type AlertTitle = string;
export type AlertMessage = string;
export type AlertEventType = string;
export type UserId = string;
export type SessionName = string;
export type Alert = {
  id: Ulid;
  title: AlertTitle;
  message: AlertMessage;
  event_type: AlertEventType;
  user_id: UserId;
  session_name?: SessionName;
  /** The date and time when the alert was created. */
  creation_date: string;
  /** The date and time when the alert was resolved, or null if it is still active. */
  resolved_date?: string | null;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type AlertPost = {
  title: AlertTitle;
  message: AlertMessage;
  event_type: AlertEventType;
  user_id: UserId;
  session_name?: SessionName;
};
export type AlertList = Alert[];
export type AlertsGetQuery = {
  session_name?: SessionName;
};
export type AlertPatch = {
  /** Set to true to mark the alert as resolved. The resolved_date timestamp will be set automatically. */
  resolved?: boolean;
};
export type AlertmanagerAlert = {
  /** The status of the alert */
  status: "firing" | "resolved";
  /** Labels associated with the alert */
  labels: {
    [key: string]: string;
  };
  /** Annotations associated with the alert */
  annotations: {
    [key: string]: string;
  };
  /** The time when the alert started */
  startsAt: string;
  /** The time when the alert ended */
  endsAt?: string;
  /** The URL of the generator that created the alert */
  generatorURL?: string;
  /** A unique fingerprint identifying this alert */
  fingerprint?: string;
};
export type AlertmanagerWebhook = {
  /** Alertmanager version */
  version: string;
  /** Unique key for the group of alerts */
  groupKey: string;
  /** The status of the alerts in this webhook */
  status: "firing" | "resolved";
  /** The name of the receiver that got the alert */
  receiver?: string;
  /** Labels that are common to all alerts in the group */
  groupLabels?: {
    [key: string]: string;
  };
  /** Labels that are common to all alerts */
  commonLabels?: {
    [key: string]: string;
  };
  commonAnnotations?: {
    [key: string]: string;
  };
  /** The external URL of the Alertmanager */
  externalURL?: string;
  /** The number of alerts that have been truncated */
  truncatedAlerts?: number;
  /** The list of alerts */
  alerts: AlertmanagerAlert[];
};
