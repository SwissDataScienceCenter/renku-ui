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
import { useCallback, useMemo } from "react";

import {
  sessionLaunchersV2Api,
  useGetBuildsByBuildIdLogsQuery as useGetBuildLogsQuery,
  type Build,
  type BuildList,
} from "../sessionsV2/api/sessionLaunchersV2.api";
import LogsModal from "./LogsModal";

const BUILD_LOGS_MAX_LINES = 250;

interface BuildLogsModalProps {
  builds: BuildList | undefined;
  isOpen: boolean;
  toggle: () => void;
}

export default function BuildLogsModal({
  builds,
  isOpen,
  toggle,
}: BuildLogsModalProps) {
  const lastBuild = builds?.at(0);
  const inProgressBuild = useMemo(
    () => builds?.find(({ status }) => status === "in_progress"),
    [builds]
  );
  const hasInProgressBuild = !!inProgressBuild;

  if (lastBuild == null) {
    return null;
  }

  return (
    <BuildLogsModalInner
      build={lastBuild}
      hasInProgressBuild={hasInProgressBuild}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
}

interface BuildLogsModalInnerProps {
  build: Build;
  hasInProgressBuild: boolean;
  isOpen: boolean;
  toggle: () => void;
}

function BuildLogsModalInner({
  build,
  hasInProgressBuild,
  isOpen,
  toggle,
}: BuildLogsModalInnerProps) {
  const query = useGetBuildLogsQuery(
    isOpen
      ? {
          buildId: build.id,
          maxLines: BUILD_LOGS_MAX_LINES,
        }
      : skipToken
  );

  const [trigger] =
    sessionLaunchersV2Api.endpoints.getBuildsByBuildIdLogs.useLazyQuery();
  const downloadQueryTrigger = useCallback(
    () => trigger({ buildId: build.id }),
    [build.id, trigger]
  );

  return (
    <LogsModal
      isOpen={isOpen}
      name={build.id}
      query={query}
      downloadQueryTrigger={downloadQueryTrigger}
      title={`${hasInProgressBuild ? "Current" : "Last"} build logs`}
      toggle={toggle}
      defaultTab="step-build-and-push"
    />
  );
}
