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

export const SESSION_STATES = {
  RUNNING: "running",
  STARTING: "starting",
  STOPPING: "stopping",
  HIBERNATED: "hibernated",
  FAILED: "failed",
} as const;

export const SESSION_STYLES = {
  WARNING: {
    textColor: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: linePlaying,
  },
  SUCCESS: {
    textColor: "text-success-emphasis",
    bgColor: "success",
    bgOpacity: 10,
    borderColor: "border-success",
    sessionLine: linePlaying,
  },
  HIBERNATED: {
    textColor: "text-dark-emphasis",
    bgColor: "light",
    bgOpacity: 100,
    borderColor: "border-dark-subtle",
    sessionLine: linePaused,
  },
  FAILED: {
    textColor: "text-danger-emphasis",
    bgColor: "danger",
    bgOpacity: 10,
    borderColor: "border-danger",
    sessionLine: lineFailed,
  },
  STOPPING: {
    textColor: "text-warning-emphasis",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineStopped,
  },
  DEFAULT: {
    textColor: "text-warning",
    bgColor: "warning",
    bgOpacity: 10,
    borderColor: "border-warning",
    sessionLine: lineBlock,
  },
} as const;
