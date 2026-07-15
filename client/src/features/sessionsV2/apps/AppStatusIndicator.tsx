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
import {
  CircleFill,
  ExclamationTriangleFill,
  SlashCircle,
} from "react-bootstrap-icons";

import { Loader } from "~/components/Loader";
import type { AppIndicatorState } from "./apps.utils";

import styles from "./AppStatusIndicator.module.scss";

/**
 * Presentation for each indicator state: the label shown to the user and the
 * Bootstrap text-color class. Rendered as plain inline text (icon + label)
 * rather than a badge, so it sits quietly next to the primary action.
 */
const INDICATOR_DISPLAY: Record<
  AppIndicatorState,
  { label: string; textClassName: string }
> = {
  "not-running": {
    label: "Not running",
    textClassName: "text-body-secondary",
  },
  starting: {
    label: "Starting",
    textClassName: "text-warning-emphasis",
  },
  live: {
    label: "Live",
    textClassName: "text-success-emphasis",
  },
  error: {
    label: "Error",
    textClassName: "text-danger-emphasis",
  },
};

function IndicatorIcon({ state }: { state: AppIndicatorState }) {
  switch (state) {
    case "live":
      // A pulsing filled dot to signal the app is up and reachable.
      return (
        <CircleFill
          className={cx("bi", "me-1", styles.pulseDot)}
          fontSize={14}
        />
      );
    case "starting":
      return <Loader className="me-1" inline size={14} />;
    case "error":
      return <ExclamationTriangleFill className={cx("bi", "me-1")} fontSize={14} />;
    case "not-running":
    default:
      return <SlashCircle className={cx("bi", "me-1")} fontSize={14} />;
  }
}

interface AppStatusIndicatorProps {
  state: AppIndicatorState;
}

/**
 * A small status indicator (icon + label) shown next to an app launcher's
 * primary action. It replaces the former per-app sub-card: the launcher header
 * now carries the status inline rather than in a separate row. Rendered as
 * plain colored text, not a badge/pill.
 */
export default function AppStatusIndicator({ state }: AppStatusIndicatorProps) {
  const { label, textClassName } = INDICATOR_DISPLAY[state];
  return (
    <span
      data-cy="app-status-indicator"
      data-app-status={state}
      className={cx(
        styles.statusText,
        "d-inline-flex",
        "align-items-center",
        "text-nowrap",
        textClassName,
      )}
    >
      <IndicatorIcon state={state} />
      {label}
    </span>
  );
}
