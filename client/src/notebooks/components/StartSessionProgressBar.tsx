/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import * as React from "react";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar
} from "../../utils/components/progress/ProgressSteps";
import { Button } from "../../utils/ts-wrappers";


interface StatusDetail {
  status: string;
  step: string;
}
export interface SessionStatusData {
  details: StatusDetail[];
  message: string;
  readyNumContainers: number;
  state: string;
  totalNumContainers: number;
  isTheSessionReady: boolean;
}
interface StartSessionProgressBarProps {
  sessionStatus?: SessionStatusData;
  isAutoSave?: boolean;
  toggleLogs: Function;
}
const StartSessionProgressBar = (
  {
    sessionStatus,
    isAutoSave,
    toggleLogs
  }: StartSessionProgressBarProps) => {

  const status = getStatusData(sessionStatus?.details, sessionStatus?.state);
  const title = isAutoSave ? "Starting Session (continuing from autosave)" : "Starting Session";
  const logButton = <Button onClick={toggleLogs} className="btn-outline-rk-green mt-3">Open Logs</Button>;

  return (
    <ProgressStepsIndicator
      description="Starting the containers for your session"
      type={ProgressType.Determinate}
      style={ProgressStyle.Light}
      title={title}
      status={status}
      moreOptions={logButton}
    />);
};

function getStatusData(details?: StatusDetail[], state?: string): StepsProgressBar[] {
  if (!details || !details.length) {
    return [{
      id: 1,
      status: StatusStepProgressBar.EXECUTING,
      step: "Fetching session data",
    }];
  }

  let i = 0;
  const steps = [];
  details.map( (s: StatusDetail) => {
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
    status: state === "running" ? StatusStepProgressBar.EXECUTING : StatusStepProgressBar.WAITING,
    step: "Connecting with your session",
  });
  return steps;
}

export default StartSessionProgressBar;
