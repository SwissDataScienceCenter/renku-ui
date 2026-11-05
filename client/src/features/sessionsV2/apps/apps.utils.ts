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

import { generatePath } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import type { AppResponse, AppStatus } from "../api/apps.api";
import type { Build } from "../api/sessionLaunchersV2.api";

export const APP_PUBLIC_PROJECT_ONLY_MESSAGE =
  "An app launcher can only be created in a public project.";

export const APP_ALREADY_EXISTS_MESSAGE =
  "Another launcher in this project already has an app. Only one app is allowed per project at a time.";

export const APP_STARTING_MESSAGE =
  "The app is still starting and cannot be opened yet.";

export const APP_STATUS_POLLING_INTERVAL_MS = 5_000;

export type AppTransition = "rebuilding" | "starting" | "stopping";

export type AppRedeployPhase = "building" | "stopping" | "starting";

export type AppRedeployStep = "wait" | "stop" | "start" | "done" | "failed";

interface AppRedeployState {
  phase: AppRedeployPhase;
  buildId: string;
  lastBuild?: Pick<Build, "id" | "status">;
  hasApp: boolean;
  stop: { isPending: boolean; isError: boolean };
  start: { isPending: boolean; isError: boolean; isSuccess: boolean };
}

export type AppWaitTarget = { desiredStatus: AppStatus[] } | { deletion: true };

interface AppLobbyLocation {
  namespace: string;
  slug: string;
  launcherId: string;
}

export function findAppForLauncher(
  apps: AppResponse[] | undefined,
  launcherId: string,
): AppResponse | undefined {
  return apps?.find((app) => app.launcher_id === launcherId);
}

export function hasAppOnAnotherLauncher(
  apps: AppResponse[] | undefined,
  launcherId: string,
): boolean {
  return !!apps?.some((app) => app.launcher_id !== launcherId);
}

export function getAppTransition(
  app: AppResponse | undefined,
  {
    isRebuilding = false,
    isStarting = false,
    isStopping = false,
  }: {
    isRebuilding?: boolean;
    isStarting?: boolean;
    isStopping?: boolean;
  } = {},
): AppTransition | null {
  if (isRebuilding) {
    return "rebuilding";
  }
  if (isStopping) {
    return "stopping";
  }
  if (isStarting || app?.status === "pending") {
    return "starting";
  }
  return null;
}

/** The next step of a rebuild and redeploy: build, then stop the app, then start it again. */
export function getNextRedeployStep({
  phase,
  buildId,
  lastBuild,
  hasApp,
  stop,
  start,
}: AppRedeployState): AppRedeployStep {
  if (phase === "building") {
    if (lastBuild?.id !== buildId || lastBuild.status === "in_progress") {
      return "wait";
    }
    if (lastBuild.status !== "succeeded") {
      return "failed";
    }
    return hasApp ? "stop" : "start";
  }
  if (phase === "stopping") {
    if (stop.isError) {
      return "failed";
    }
    return stop.isPending || hasApp ? "wait" : "start";
  }
  if (start.isError) {
    return "failed";
  }
  return start.isSuccess && !start.isPending ? "done" : "wait";
}

export function hasPendingApp(apps: AppResponse[] | undefined): boolean {
  return !!apps?.some((app) => app.status === "pending");
}

export function hasReachedAppTarget(
  app: AppResponse | undefined,
  target: AppWaitTarget,
): boolean {
  if ("deletion" in target) {
    return app == null;
  }
  return app != null && target.desiredStatus.includes(app.status);
}

export function toSecureAppUrl(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

export function getAppLobbyPath({
  namespace,
  slug,
  launcherId,
}: AppLobbyLocation): string {
  return generatePath(ABSOLUTE_ROUTES.v2.projects.show.apps.show, {
    namespace,
    slug,
    launcherId,
  });
}

export function getAppLobbyUrl({
  origin,
  ...location
}: AppLobbyLocation & { origin: string }): string {
  return `${origin.replace(/\/+$/, "")}${getAppLobbyPath(location)}`;
}
