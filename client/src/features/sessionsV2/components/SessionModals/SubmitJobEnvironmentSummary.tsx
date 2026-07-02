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

import cx from "classnames";

import { WarnAlert } from "~/components/Alert";
import { TimeCaption } from "~/components/TimeCaption";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import { getEnvironmentKindLabel } from "../../launcherEnvironment.utils";
import useLauncherEnvironmentReadiness from "../../useLauncherEnvironmentReadiness.hook";
import { BuildStatusDescription } from "../BuildStatusComponents";
import { LauncherEnvironmentIcon } from "../SessionForm/LauncherEnvironmentIcon";

interface SubmitJobEnvironmentSummaryProps {
  launcher: SessionLauncher;
}

export default function SubmitJobEnvironmentSummary({
  launcher,
}: SubmitJobEnvironmentSummaryProps) {
  const {
    containerImage,
    isCodeEnvironment,
    isCustomImageEnvironment,
    isLastBuildRunning,
    isLoadingContainerImage,
    lastBuild,
    lastSuccessfulBuild,
    useOldImage,
  } = useLauncherEnvironmentReadiness({ launcher });

  const environmentKindLabel = getEnvironmentKindLabel(launcher.environment);

  return (
    <>
      <h2 className={cx("fw-bold", "mb-0")} data-cy="submit-job-launcher-name">
        {launcher.name}
      </h2>

      <div
        className={cx("d-flex", "flex-wrap", "align-items-center", "gap-4")}
        data-cy="submit-job-environment"
      >
        {environmentKindLabel != null && (
          <span className={cx("text-muted", "small")}>
            <LauncherEnvironmentIcon launcher={launcher} />
            {environmentKindLabel}
          </span>
        )}
        {isCodeEnvironment && (
          <BuildStatusDescription
            status={lastBuild?.status ?? lastSuccessfulBuild?.status}
            createdAt={lastBuild?.created_at ?? lastSuccessfulBuild?.created_at}
            completedAt={
              lastBuild?.status === "succeeded"
                ? lastBuild?.result?.completed_at
                : lastSuccessfulBuild?.status === "succeeded"
                  ? lastSuccessfulBuild?.result?.completed_at
                  : undefined
            }
          />
        )}
      </div>

      {useOldImage && lastSuccessfulBuild && (
        <WarnAlert
          className="mb-0"
          data-cy="submit-job-old-image-warning"
          dismissible={false}
        >
          {isLastBuildRunning ? (
            <p className="mb-1">
              The environment for this launcher is currently rebuilding and not
              yet complete. This job will use the last successfully built
              environment from{" "}
              <TimeCaption
                datetime={lastSuccessfulBuild.created_at}
                enableTooltip
                noCaption
              />
            </p>
          ) : (
            <p className="mb-1">
              The most recent build for this environment failed, so this job
              will use the last successfully built environment from{" "}
              <TimeCaption
                datetime={lastSuccessfulBuild.created_at}
                enableTooltip
                noCaption
              />
            </p>
          )}
        </WarnAlert>
      )}

      {isCustomImageEnvironment &&
        !isLoadingContainerImage &&
        containerImage?.accessible === false && (
          <WarnAlert className="mb-0" dismissible={false}>
            <p className="mb-0">
              Image accessibility could not be verified. You may still submit if
              your integration provides access at runtime.
            </p>
          </WarnAlert>
        )}
    </>
  );
}
