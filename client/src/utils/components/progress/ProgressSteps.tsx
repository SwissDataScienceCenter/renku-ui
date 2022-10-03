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
import "./Progress.css";
import {
  CheckCircleFill,
  XCircleFill
} from "../../ts-wrappers";
import { Loader } from "../Loader";

/**
 *  renku-ui
 *
 *  Progress.tsx
 *  Progress component
 */

// These values are actually used, but the ts compiler does not realize it
/* eslint-disable no-unused-vars */
export enum ProgressType {
  Determinate = "Determinate",
  Indeterminate = "Indeterminate",
}

export enum ProgressStyle {
  Light = "light",
  Dark = "dark",
}

export enum StatusStepProgressBar {
  READY = "ready",
  EXECUTING = "executing",
  WAITING = "waiting",
  FAILED = "failed"
}
/* eslint-enable no-unused-vars */

export interface StepsProgressBar {
  id: number;
  status: StatusStepProgressBar;
  step: string;
}

export interface ProgressStepsIndicatorProps {
  /**
   * Type of progress-bar. Indeterminate or Determinate
   * @default Indeterminate
   */
  type: ProgressType;

  /**
   * Style for background. Light or Dark
   * @default Dark
   */
  style: ProgressStyle;
  title: string;
  description: string;
  status: StepsProgressBar[];
  moreOptions?: React.ReactNode;
}

/**
 * Project Visibility functional component
 * @param {ProgressIndicatorProps} props - progress indicator options
 */
const ProgressStepsIndicator = (
  {
    style = ProgressStyle.Dark,
    title,
    description,
    status,
    moreOptions
  }: ProgressStepsIndicatorProps) => {

  const content = status.map( (s) => <ProgressStep key={`step-${s.id}`} step={s} />);
  return (
    <div className={`progress-box progress-box--${style}`}>
      <h2 className="progress-title">{title}</h2>
      <p className="pb-2">{description}</p>
      <div className="mt-3 details-progress-box">
        {content}
        {moreOptions}
      </div>
    </div>
  );
};

interface progressStepProps {
  step: StepsProgressBar
}
function ProgressStep({ step }: progressStepProps) {
  let content;
  switch (step.status) {
    case StatusStepProgressBar.EXECUTING:
      content = <><Loader size="14" inline="true" />{step.step}</>;
      break;
    case StatusStepProgressBar.READY:
      content = <><CheckCircleFill className="text-rk-green" />{step.step}</>;
      break;
    case StatusStepProgressBar.WAITING:
      content = <><Loader size="14" inline="true" /><span className="text-rk-text-light">{step.step}</span></>;
      break;
    case StatusStepProgressBar.FAILED:
      content = <><XCircleFill className="text-rk-danger-shadow"/>{step.step}</>;
      break;
  }

  return <div className="d-flex gap-2 mt-2 align-items-center">{content}</div>;
}

export default ProgressStepsIndicator;
