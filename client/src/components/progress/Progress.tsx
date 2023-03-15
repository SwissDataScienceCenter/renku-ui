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
/* eslint-enable no-unused-vars */

export interface ProgressIndicatorProps {
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
  percentage?: number;
  currentStatus?: string;
  feedback?: string;
}

/**
 * Project Visibility functional component
 * @param {ProgressIndicatorProps} props - progress indicator options
 */
const ProgressIndicator = ({
  type = ProgressType.Indeterminate,
  style = ProgressStyle.Dark,
  title,
  description,
  percentage,
  currentStatus = "",
  feedback = "",
}: ProgressIndicatorProps) => {
  const progressBar =
    type === ProgressType.Indeterminate ? (
      <div className="progress-bar">
        <div className="progress-bar-determinate-auto"></div>
        <div className="progress-bar-indeterminate"></div>
      </div>
    ) : (
      <div className="progress-bar">
        <div className="progress-bar-determinate" style={{ width: `${percentage ?? 0}%` }}></div>
      </div>
    );

  const percentageLabel =
    type === ProgressType.Determinate && typeof percentage === "number" ? (
      <span className="fw-bold px-2">{percentage}%</span>
    ) : null;

  return (
    <div className={`progress-box progress-box--${style}`}>
      <h2 className="progress-title">{title}</h2>
      <p className="pb-2">{description}</p>
      <div className="progress-indicator">
        <div className={`progress-bar-box ${style === ProgressStyle.Light ? "progress-bar-box--light" : ""}`}>
          {progressBar}
        </div>
        <p className="pt-1">
          {currentStatus}
          {percentageLabel}
        </p>
      </div>
      <p className="pt-1">{feedback}</p>
    </div>
  );
};

export default ProgressIndicator;
