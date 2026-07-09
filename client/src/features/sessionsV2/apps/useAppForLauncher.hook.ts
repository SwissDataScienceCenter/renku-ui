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
import { findAppForLauncher } from "./apps.utils";

interface UseAppForLauncherArgs {
  projectId: string;
  launcherId: string;
  /** Skip the query entirely (e.g. the launcher is not an app launcher). */
  skip?: boolean;
}

/**
 * Read the (single) app deployment backing a launcher.
 *
 * This is the display-side read, analogous to how the sessions list uses
 * useGetSessionsQuery: it does not poll on its own. Both consumers — the
 * launcher card and its action buttons — hit the same /apps query, so RTK Query
 * collapses them into one request, and freshness while an action is in flight is
 * driven by useWaitForAppStatus (which polls the same cache key until the app
 * reaches the action's target), mirroring useWaitForSessionStatus.
 */
export default function useAppForLauncher({
  projectId,
  launcherId,
  skip,
}: UseAppForLauncherArgs): ReturnType<typeof useGetAppsQuery> & {
  app: AppResponse | undefined;
} {
  const result = useGetAppsQuery(skip ? skipToken : { projectId });
  const app = findAppForLauncher(result.data, launcherId);
  return { ...result, app };
}
