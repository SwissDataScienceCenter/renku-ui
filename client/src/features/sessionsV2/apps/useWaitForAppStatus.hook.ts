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

import { skipToken } from "@reduxjs/toolkit/query";

import { useGetAppsQuery } from "../api/apps.api";
import type { AppResponse } from "../api/apps.api";
import {
  APP_STATUS_POLLING_INTERVAL_MS,
  findAppForLauncher,
  hasReachedAppTarget,
  type AppWaitTarget,
} from "./apps.utils";

interface UseWaitForAppStatusArgs {
  projectId: string;
  launcherId: string;
  /** The state we are waiting for the app to reach. */
  target: AppWaitTarget;
  pollingInterval?: number;
  /** Skip while no action is in flight for this launcher. */
  skip?: boolean;
}

/**
 * Poll the /apps query while an app action is in flight, until the deployment
 * reaches the action's target (ready / hibernated / gone), then stop.
 *
 * This is the apps analog of useWaitForSessionStatus. The transitions are
 * server-driven and asynchronous — Knative scales up and down after the
 * mutation returns — so the single cache-invalidation refetch that a mutation
 * triggers is not enough on its own: it captures a snapshot that is often still
 * mid-transition (a stopped app briefly still reads "ready"; a deleted app is
 * briefly still present). The caller flips `skip` off when it fires a mutation
 * and reads `isWaiting` to know when the transition has settled.
 *
 * `isWaiting` stays true while a refetch is in flight so that the post-mutation
 * invalidation refetch — which may still be reporting the pre-action status —
 * does not read as "already at target" for actions whose start and target
 * states overlap (e.g. republishing an app that is currently "failed").
 */
export default function useWaitForAppStatus({
  projectId,
  launcherId,
  target,
  pollingInterval = APP_STATUS_POLLING_INTERVAL_MS,
  skip,
}: UseWaitForAppStatusArgs): {
  isWaiting: boolean;
  app: AppResponse | undefined;
} {
  const result = useGetAppsQuery(skip ? skipToken : { projectId }, {
    // Stay subscribed while an action is in flight (so the invalidation refetch
    // reaches us) and poll until the app settles. RTK Query collapses this and
    // the display query into one request stream per project.
    pollingInterval: skip ? 0 : pollingInterval,
  });

  const app = findAppForLauncher(result.data, launcherId);
  const isWaiting =
    !skip && (result.isFetching || !hasReachedAppTarget(app, target));

  return { isWaiting, app };
}
