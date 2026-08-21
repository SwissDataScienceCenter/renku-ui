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
import { useCallback } from "react";

import {
  appsApi,
  useGetAppsByAppNameLogsQuery,
} from "../sessionsV2/api/apps.api";
import { formatAppLogTabLabel, isAppUserContainerLog } from "./appLogs.utils";
import LogsModal from "./LogsModal";

const APP_LOGS_MAX_LINES = 250;

interface AppLogsModalProps {
  appName: string;
  isOpen: boolean;
  toggle: () => void;
}

/**
 * The logs of a running app, keyed by "<pod name>/<container name>". Unlike a
 * session an app can be backed by more than one pod, and an idle app scales to
 * zero and then has no pods at all — so an empty response is a normal outcome
 * here rather than a sign that something went wrong.
 */
export default function AppLogsModal({
  appName,
  isOpen,
  toggle,
}: AppLogsModalProps) {
  const query = useGetAppsByAppNameLogsQuery(
    isOpen ? { appName, maxLines: APP_LOGS_MAX_LINES } : skipToken,
  );

  const [trigger] = appsApi.endpoints.getAppsByAppNameLogs.useLazyQuery();
  const downloadQueryTrigger = useCallback(
    () => trigger({ appName }),
    [appName, trigger],
  );

  return (
    <LogsModal
      isOpen={isOpen}
      name={appName}
      query={query}
      downloadQueryTrigger={downloadQueryTrigger}
      title="App logs"
      toggle={toggle}
      defaultTab={isAppUserContainerLog}
      tabLabel={formatAppLogTabLabel}
      emptyMessage="No logs available. An app with no traffic scales down to zero and keeps no logs; send it a request and try again."
    />
  );
}
