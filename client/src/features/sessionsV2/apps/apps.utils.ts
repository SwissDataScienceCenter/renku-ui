/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { AppResponse, AppStatus } from "../api/apps.api";
import { SESSION_STYLES } from "../SessionStyles.constants";

/** Error messages returned verbatim by the backend for app operations. */
export const APP_PUBLIC_PROJECT_ONLY_MESSAGE =
  "An app launcher can only be created in a public project.";
export const APP_RESUME_REQUIRES_PUBLIC_MESSAGE =
  "This app cannot be resumed because its project is not public.";

/**
 * Find the (single) app deployment backing a given launcher, if any. The
 * backend allows at most one running deployment per launcher.
 */
export function findAppForLauncher(
  apps: AppResponse[] | undefined,
  launcherId: string,
): AppResponse | undefined {
  return apps?.find((app) => app.launcher_id === launcherId);
}

export interface AppStatusDisplay {
  label: string;
  /** Bootstrap utility classes for the status badge. */
  badgeClassName: string;
  /**
   * A short human-readable explanation of the current status, shown alongside
   * the label. It complements the label rather than repeating it (the label
   * already says "Stopped"/"Publishing"), so it is empty where the label says
   * enough on its own (e.g. the live state).
   */
  description: string;
  /**
   * Prefix for the `started` timestamp caption, or null to hide it. The
   * timestamp is when the deployment last started running, so "Published …"
   * only reads correctly while the app is actually up; for a stopped, failed or
   * still-publishing app the caption is suppressed rather than shown as a
   * misleading "Published N seconds ago".
   */
  timeCaptionPrefix: string | null;
  /** Whether the app is reachable and its URL should be offered. */
  isLive: boolean;
}

/**
 * Map the observed app status onto its user-facing label, badge styling and a
 * short description. Mirrors the AppStatus enum from the backend (`pending |
 * ready | failed | hibernated`).
 */
export function getAppStatusDisplay(status: AppStatus): AppStatusDisplay {
  switch (status) {
    case "ready":
      return {
        label: "Available",
        badgeClassName:
          "border-success bg-success-subtle text-success-emphasis",
        description: "",
        timeCaptionPrefix: "Published",
        isLive: true,
      };
    case "pending":
      return {
        label: "Publishing",
        badgeClassName:
          "border-warning bg-warning-subtle text-warning-emphasis",
        description: "This may take a minute.",
        timeCaptionPrefix: null,
        isLive: false,
      };
    case "failed":
      return {
        label: "Error",
        badgeClassName: "border-danger bg-danger-subtle text-danger-emphasis",
        description: "Publishing failed. Try again.",
        timeCaptionPrefix: null,
        isLive: false,
      };
    case "hibernated":
      return {
        label: "Stopped",
        badgeClassName: "border-dark-subtle bg-light text-body-secondary",
        description: "Resume it to start it again.",
        timeCaptionPrefix: null,
        isLive: false,
      };
    default:
      return {
        label: "Unknown",
        badgeClassName:
          "border-warning bg-warning-subtle text-warning-emphasis",
        description: "Status unknown.",
        timeCaptionPrefix: null,
        isLive: false,
      };
  }
}

/** Whether the app is currently stopped (scaled to zero). */
export function isAppHibernated(app: AppResponse): boolean {
  return app.status === "hibernated";
}

/**
 * How often to poll the /apps query while an app action is in flight, in
 * milliseconds. Matches the sessions' DEFAULT_POLLING_INTERVAL_MS so the two
 * feel consistent. Publishing can take up to a minute, so a few-second cadence is
 * responsive without hammering the backend.
 */
export const APP_STATUS_POLLING_INTERVAL_MS = 5_000;

/**
 * The state an in-flight app action is waiting for the deployment to reach.
 * Either the app should settle into one of a set of statuses (publish / resume →
 * ready; stop → hibernated), or the app should disappear from the project
 * (delete). Server-side these transitions are asynchronous, so a single
 * cache-invalidation refetch cannot capture the settled state; the caller polls
 * until the target is reached (see useWaitForAppStatus).
 */
export type AppWaitTarget =
  | { desiredStatus: AppStatus[] }
  | { deletion: true };

/**
 * Whether an observed app has reached the target that ends an action's wait.
 *
 * For a status target the app must exist and hold one of the desired statuses;
 * for a deletion target the app must be gone. Kept as a pure function, separate
 * from the React/RTK plumbing in useWaitForAppStatus, so the decision logic can
 * be unit-tested on its own.
 */
export function hasReachedAppTarget(
  app: AppResponse | undefined,
  target: AppWaitTarget,
): boolean {
  if ("deletion" in target) {
    return app == null;
  }
  return app != null && target.desiredStatus.includes(app.status);
}

/**
 * Map an app status onto the shared session status styles (background tint and
 * emphasis text color) so the app row reads the same as a running session's
 * card. Reuses SESSION_STYLES rather than defining a parallel palette.
 */
export function getAppStatusStyles(
  status: AppStatus,
): (typeof SESSION_STYLES)[keyof typeof SESSION_STYLES] {
  switch (status) {
    case "ready":
      return SESSION_STYLES.SUCCESS;
    case "pending":
      return SESSION_STYLES.WARNING;
    case "failed":
      return SESSION_STYLES.FAILED;
    case "hibernated":
      return SESSION_STYLES.HIBERNATED;
    default:
      return SESSION_STYLES.DEFAULT;
  }
}

/**
 * Force an app URL onto https. Apps on RenkuLab are always served over TLS, but
 * the backend can hand back an `http://` URL; opening or copying that would hit
 * a mixed-content block or a redirect. Only the scheme is rewritten (case
 * insensitively) — the rest of the URL is left untouched, and non-http(s) or
 * schemeless values pass through unchanged.
 */
export function toSecureAppUrl(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}
