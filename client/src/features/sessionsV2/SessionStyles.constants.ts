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

import linePlaying from "../../styles/assets/linePlaying.svg";
import lineFailed from "../../styles/assets/lineFailed.svg";
import linePaused from "../../styles/assets/linePaused.svg";
import lineStopped from "../../styles/assets/lineStopped.svg";
import lineBlock from "../../styles/assets/lineBlock.svg";

import playingIcon from "../../styles/assets/playing.svg";
import failedIcon from "../../styles/assets/failed.svg";
import pausedIcon from "../../styles/assets/paused.svg";
import stoppedIcon from "../../styles/assets/stopped.svg";
import blockIcon from "../../styles/assets/block.svg";

export const SESSION_STATES = {
  RUNNING: "running",
  STARTING: "starting",
  STOPPING: "stopping",
  HIBERNATED: "hibernated",
  FAILED: "failed",
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
  },
  SUCCESS: {
    textColorCard: "text-success-emphasis",
    textColorList: "text-primary",
    bgColor: "success",
    bgOpacity: 10,
    borderColor: "border-success",
    sessionLine: linePlaying,
    sessionIcon: playingIcon,
  },
  HIBERNATED: {
    textColorCard: "text-dark-emphasis",
    textColorList: "text-dark-emphasis",
    bgColor: "light",
    bgOpacity: 100,
    borderColor: "border-dark-subtle",
    sessionLine: linePaused,
    sessionIcon: pausedIcon,
  },
  FAILED: {
    textColorCard: "text-danger-emphasis",
    textColorList: "text-danger-emphasis",
    bgColor: "danger",
    bgOpacity: 10,
    borderColor: "border-danger",
    sessionLine: lineFailed,
    sessionIcon: failedIcon,
  },
  STOPPING: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineStopped,
    sessionIcon: stoppedIcon,
  },
  DEFAULT: {
    textColorCard: "text-warning-emphasis",
    textColorList: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineBlock,
    sessionIcon: blockIcon,
  },
} as const;

export const SESSION_TITLE = {
  [SESSION_STATES.RUNNING]: "My running session",
  [SESSION_STATES.STARTING]: "Launching my session",
  [SESSION_STATES.STOPPING]: "Shutting down my session...",
  [SESSION_STATES.HIBERNATED]: "My paused session",
  [SESSION_STATES.FAILED]: "Error in my session",
  default: "Unknown status",
};

export const SESSION_TITLE_DASHBOARD = {
  [SESSION_STATES.RUNNING]: "Running session",
  [SESSION_STATES.STARTING]: "Launching session",
  [SESSION_STATES.STOPPING]: "Shutting down session...",
  [SESSION_STATES.HIBERNATED]: "Paused session",
  [SESSION_STATES.FAILED]: "Error in session",
  default: "Unknown status",
};
