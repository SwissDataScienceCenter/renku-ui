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
    pollingInterval: skip ? 0 : pollingInterval,
  });

  const app = findAppForLauncher(result.data, launcherId);
  const isWaiting =
    !skip && (result.isFetching || !hasReachedAppTarget(app, target));

  return { isWaiting, app };
}
