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

import React, { useEffect, useState } from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { NotebooksHelper } from "../Notebooks.state";
import ProgressStepsIndicator, {
  StatusStepProgressBar,
} from "../../components/progress/ProgressSteps";
import { GoBackButton } from "../../components/buttons/Button";
import {
  ProgressStyle,
  ProgressType,
} from "../../components/progress/Progress";
import { getSessionRunningByProjectName } from "../../utils/helpers/SessionFunctions";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CIStatus {
  ongoing: boolean;
}

interface StatusFetching {
  ci: boolean;
  data: boolean;
  options: boolean;
}

interface StartNotebookAutostartLoaderProps {
  ci: {
    stage: Record<string, any>;
  };
  data: Record<string, any>;
  notebooks: Record<string, any>;
  options: Record<string, any>;
  backUrl: string;
  filters: Record<string, any>;
}
function StartNotebookAutostartLoader(
  props: StartNotebookAutostartLoaderProps
) {
  const { ci, data, notebooks, options, backUrl, filters } = props;
  const ciStatus = NotebooksHelper.checkCiStatus(ci) as CIStatus;
  const [fetching, setFetching] = useState<StatusFetching>({
    ci: !ciStatus.ongoing,
    data: !!data.fetched,
    options: !!options.fetched,
  });
  const isSessionVisible = getSessionRunningByProjectName(
    notebooks.all,
    filters.namespace,
    filters.project
  );
  const [steps, setSteps] = useState([
    {
      id: 0,
      status: StatusStepProgressBar.EXECUTING,
      step: "Checking project data",
    },
    {
      id: 1,
      status: StatusStepProgressBar.WAITING,
      step: "Checking GitLab jobs",
    },
    {
      id: 2,
      status: StatusStepProgressBar.WAITING,
      step: "Checking existing sessions",
    },
    {
      id: 3,
      status: StatusStepProgressBar.WAITING,
      step: "Getting session information",
    },
  ]);

  useEffect(() => {
    const fetched = !notebooks.fetched
      ? []
      : Object.keys(fetching).filter((k) => {
          const key = k as keyof StatusFetching;
          return fetching[key];
        });
    if (!fetched.length) return;
    const statuses = steps;
    if (fetching.ci) statuses[0].status = StatusStepProgressBar.READY;

    if (fetching.options) statuses[1].status = StatusStepProgressBar.READY;

    if (notebooks.fetched !== false)
      statuses[2].status = StatusStepProgressBar.READY;

    if (isSessionVisible) statuses[3].status = StatusStepProgressBar.READY;

    setSteps(statuses);
  }, [fetching, isSessionVisible]); //eslint-disable-line

  useEffect(() => {
    setFetching({
      ci: !ciStatus.ongoing,
      data: !!data.fetched,
      options: !!options.fetched,
    });
  }, [ciStatus.ongoing, data.fetched, options.fetched]);

  const pathWithNamespace = useSelector(
    (state: RootStateOrAny) =>
      state.stateModel.project?.metadata.pathWithNamespace
  );
  const backButtonSessions = (
    <GoBackButton
      label={`Cancel Session Start & back to ${pathWithNamespace}`}
      url={backUrl}
    />
  );
  return (
    <>
      {backButtonSessions}
      <div className="progress-box-small">
        <ProgressStepsIndicator
          description="Checking current status to start your session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title="Step 1 of 2: Checking if launch is possible"
          status={steps}
        />
      </div>
    </>
  );
}

interface StartNotebookLoaderProps {
  backUrl: string;
}
function StartNotebookLoader({ backUrl }: StartNotebookLoaderProps) {
  return (
    <>
      {backUrl}
      <div className="progress-box-small">
        <ProgressStepsIndicator
          description="Checking current status to start your session"
          type={ProgressType.Determinate}
          style={ProgressStyle.Light}
          title="Step 1 of 2: Checking if launch is possible"
          status={[
            {
              id: 0,
              status: StatusStepProgressBar.EXECUTING,
              step: "Checking current sessions",
            },
          ]}
        />
      </div>
    </>
  );
}

export { StartNotebookLoader, StartNotebookAutostartLoader };
