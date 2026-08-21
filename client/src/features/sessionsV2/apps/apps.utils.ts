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

export const APP_PUBLIC_PROJECT_ONLY_MESSAGE =
  "An app launcher can only be created in a public project.";

export const APP_ALREADY_EXISTS_MESSAGE =
  "Another launcher in this project already has an app. Only one app is allowed per project at a time.";

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

export type AppTransition = "starting" | "stopping";

export function getAppTransition(
  app: AppResponse | undefined,
  {
    isStarting = false,
    isStopping = false,
  }: { isStarting?: boolean; isStopping?: boolean } = {},
): AppTransition | null {
  if (isStopping) {
    return "stopping";
  }
  if (isStarting || app?.status === "pending") {
    return "starting";
  }
  return null;
}

export function hasPendingApp(apps: AppResponse[] | undefined): boolean {
  return !!apps?.some((app) => app.status === "pending");
}

export const APP_STATUS_POLLING_INTERVAL_MS = 5_000;

export type AppWaitTarget = { desiredStatus: AppStatus[] } | { deletion: true };

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

/** Everything needed to address a launcher's lobby. */
interface AppLobbyLocation {
  namespace: string;
  slug: string;
  launcherId: string;
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
