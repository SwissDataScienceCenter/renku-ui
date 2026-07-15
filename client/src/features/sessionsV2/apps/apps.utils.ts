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

/** Error messages returned verbatim by the backend for app operations. */
export const APP_PUBLIC_PROJECT_ONLY_MESSAGE =
  "An app launcher can only be created in a public project.";

/**
 * Shown on a launcher's Publish button when another launcher in the project
 * already has an app. The backend allows only one app deployment per project.
 */
export const APP_ALREADY_EXISTS_MESSAGE =
  "Another launcher in this project already has an app. Only one app is allowed per project at a time.";

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

/**
 * Whether the project already has an app on some launcher other than the given
 * one. The backend enforces at most one app deployment per project (matched by
 * the project-id label, independent of the app's status), so any existing app on
 * another launcher — including a failed or stopped one — blocks publishing here.
 */
export function hasAppOnAnotherLauncher(
  apps: AppResponse[] | undefined,
  launcherId: string,
): boolean {
  return !!apps?.some((app) => app.launcher_id !== launcherId);
}

/**
 * The state shown by the app status indicator next to a launcher's primary
 * action. This is the user-facing collapse of the backend AppStatus (`pending |
 * ready | failed | hibernated`) plus the "no deployment yet" case:
 *   - not-running — no app, or one the platform has hibernated (the UI offers
 *     no resume, so from the user's side it simply isn't running)
 *   - starting    — a deployment is being created or is still pending
 *   - live        — the app is up and reachable
 *   - error       — the deployment failed
 */
export type AppIndicatorState = "not-running" | "starting" | "live" | "error";

/**
 * Derive the indicator state from the observed app (or its absence).
 *
 * `isStarting` lets the caller force the "starting" state while a publish
 * mutation is in flight but the deployment has not yet appeared in the /apps
 * response, so the indicator reflects intent immediately rather than briefly
 * showing "not running". Kept as a pure function so the mapping can be
 * unit-tested independently of the React/RTK plumbing.
 */
export function getAppIndicatorState(
  app: AppResponse | undefined,
  { isStarting = false }: { isStarting?: boolean } = {},
): AppIndicatorState {
  if (isStarting || app?.status === "pending") {
    return "starting";
  }
  if (app == null || app.status === "hibernated") {
    return "not-running";
  }
  if (app.status === "ready") {
    return "live";
  }
  return "error";
}

/** Whether any app in the list is still `pending` (mid-transition server-side). */
export function hasPendingApp(apps: AppResponse[] | undefined): boolean {
  return !!apps?.some((app) => app.status === "pending");
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
 * Force an app URL onto https. Apps on RenkuLab are always served over TLS, but
 * the backend can hand back an `http://` URL; opening or copying that would hit
 * a mixed-content block or a redirect. Only the scheme is rewritten (case
 * insensitively) — the rest of the URL is left untouched, and non-http(s) or
 * schemeless values pass through unchanged.
 */
export function toSecureAppUrl(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}
