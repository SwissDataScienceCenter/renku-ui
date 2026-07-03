/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import {
  CheckCircleFill,
  ExclamationDiamondFill,
  GearFill,
  PauseBtnFill,
} from "react-bootstrap-icons";

import blockIcon from "../../styles/assets/block.svg";
import failedIcon from "../../styles/assets/failed.svg";
import lineBlock from "../../styles/assets/lineBlock.svg";
import lineFailed from "../../styles/assets/lineFailed.svg";
import linePaused from "../../styles/assets/linePaused.svg";
import linePlaying from "../../styles/assets/linePlaying.svg";
import lineStopped from "../../styles/assets/lineStopped.svg";
import pausedIcon from "../../styles/assets/paused.svg";
import playingIcon from "../../styles/assets/playing.svg";
import stoppedIcon from "../../styles/assets/stopped.svg";

export const SESSION_STATES = {
  RUNNING: "running",
  STARTING: "starting",
  STOPPING: "stopping",
  HIBERNATED: "hibernated",
  FAILED: "failed",
  SUCCEEDED: "succeeded",
} as const;

export const SESSION_STYLES = {
  WARNING: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: linePlaying,
    sessionIcon: playingIcon,
    jobIcon: ExclamationDiamondFill,
  },
  SUCCESS: {
    textColorCard: "text-success-emphasis",
    textColorList: "text-primary",
    bgColor: "success",
    bgOpacity: 10,
    borderColor: "border-success",
    sessionLine: linePlaying,
    sessionIcon: playingIcon,
    jobIcon: CheckCircleFill,
  },
  HIBERNATED: {
    textColorCard: "text-dark-emphasis",
    textColorList: "text-dark-emphasis",
    bgColor: "light",
    bgOpacity: 100,
    borderColor: "border-dark-subtle",
    sessionLine: linePaused,
    sessionIcon: pausedIcon,
    jobIcon: PauseBtnFill,
  },
  FAILED: {
    textColorCard: "text-danger-emphasis",
    textColorList: "text-danger-emphasis",
    bgColor: "danger",
    bgOpacity: 10,
    borderColor: "border-danger",
    sessionLine: lineFailed,
    sessionIcon: failedIcon,
    jobIcon: ExclamationDiamondFill,
  },
  STOPPING: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineStopped,
    sessionIcon: stoppedIcon,
    jobIcon: PauseBtnFill,
  },
  RUNNING_JOB: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: linePlaying,
    sessionIcon: playingIcon,
    jobIcon: GearFill,
  },
  DEFAULT: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineBlock,
    sessionIcon: blockIcon,
    jobIcon: GearFill,
  },
} as const;

export const SESSION_TITLE = {
  [SESSION_STATES.RUNNING]: "My running session",
  [SESSION_STATES.STARTING]: "Launching my session",
  [SESSION_STATES.STOPPING]: "Shutting down my session...",
  [SESSION_STATES.HIBERNATED]: "My paused session",
  [SESSION_STATES.FAILED]: "Error in my session",
  [SESSION_STATES.SUCCEEDED]: "Session succeeded (TBD)",
  default: "Unknown status",
};

export const SESSION_TITLE_DASHBOARD = {
  [SESSION_STATES.RUNNING]: "Running session",
  [SESSION_STATES.STARTING]: "Launching session",
  [SESSION_STATES.STOPPING]: "Shutting down session...",
  [SESSION_STATES.HIBERNATED]: "Paused session",
  [SESSION_STATES.FAILED]: "Error in session",
  [SESSION_STATES.SUCCEEDED]: "Session succeeded (TBD)",
  default: "Unknown status",
};

export const JOB_TITLE = {
  [SESSION_STATES.RUNNING]: "Running job",
  [SESSION_STATES.STARTING]: "Submitting job",
  [SESSION_STATES.STOPPING]: "Removing my job...",
  [SESSION_STATES.HIBERNATED]: "Paused job",
  [SESSION_STATES.FAILED]: "Errored job", //eslint-disable-line spellcheck/spell-checker
  [SESSION_STATES.SUCCEEDED]: "Completed job",
  default: "Unknown status",
};
