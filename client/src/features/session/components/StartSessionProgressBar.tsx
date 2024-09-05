/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Session, SessionStatus } from "../sessions.types";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar,
} from "../../../components/progress/ProgressSteps";
import cx from "classnames";
import { Button } from "reactstrap";
import ProgressIndicator from "../../../components/progress/Progress";
import { SessionV2 } from "../../sessionsV2/sessionsV2.types";

interface StartSessionProgressBarProps {
  includeStepInTitle?: boolean;
  session?: Session;
  toggleLogs: () => void;
}

export default function StartSessionProgressBar({
  includeStepInTitle,
  session,
  toggleLogs,
}: StartSessionProgressBarProps) {
  const statusData = getStatusData(session?.status);
  const title = "Starting Session";
  const logButton = (
    <Button className="mt-3" color="primary" onClick={toggleLogs}>
      Open Logs
    </Button>
  );

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Starting the containers for your session"
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={includeStepInTitle ? `Step 2 of 2: ${title}` : title}
        status={statusData}
        moreOptions={logButton}
      />
    </div>
  );
}

interface StartSessionProgressBarV2Props {
  includeStepInTitle?: boolean;
  session?: SessionV2;
  toggleLogs: () => void;
}
export function StartSessionProgressBarV2({
  includeStepInTitle,
  session,
  toggleLogs,
}: StartSessionProgressBarV2Props) {
  const statusData = session?.status;
  const title = "Starting Session";
  const logButton = (
    <Button className="mt-3" color="outline-primary" onClick={toggleLogs}>
      Open Logs
    </Button>
  );

  const readyNumContainers = statusData?.ready_containers || 0;
  const totalNumContainers = statusData?.total_containers || 1;
  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressIndicator
        description="Starting the containers for your session"
        type={ProgressType.Indeterminate}
        style={ProgressStyle.Light}
        title={includeStepInTitle ? `Step 2 of 2: ${title}` : title}
        feedback={`${readyNumContainers} of ${totalNumContainers} containers ready`}
      />
      <div className={cx("progress-box", "pt-0")}>{logButton}</div>
    </div>
  );
}

function getStatusData(
  status: Pick<SessionStatus, "details" | "state"> | undefined
): StepsProgressBar[] {
  const { details, state } = status ?? {};

  if (!details || !details.length) {
    return [
      {
        id: 1,
        status: StatusStepProgressBar.EXECUTING,
        step: "Fetching session data",
      },
    ];
  }

  let i = 0;
  const steps = [];
  details.map((s) => {
    steps.push({
      id: i,
      status: s.status as StatusStepProgressBar,
      step: s.step,
    });
    i++;
  });

  // add step to wait for the jupyter session  is ready
  steps.push({
    id: i,
    status:
      state === "running"
        ? StatusStepProgressBar.EXECUTING
        : StatusStepProgressBar.WAITING,
    step: "Connecting with your session",
  });
  return steps;
}
