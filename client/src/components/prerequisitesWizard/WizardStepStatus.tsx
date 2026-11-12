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
import { CheckLg } from "react-bootstrap-icons";

import type { WizardStep } from "./prerequisitesWizard.types";
import {
  getStepPendingCount,
  isStepComplete,
} from "./prerequisitesWizard.utils";

interface WizardStepStatusProps {
  step: WizardStep;
}

export default function WizardStepStatus({ step }: WizardStepStatusProps) {
  if (isStepComplete(step)) {
    return (
      <span className="text-success-emphasis">
        <CheckLg aria-hidden="true" className="bi" />
        <span className="visually-hidden">Done</span>
      </span>
    );
  }

  if (step.kind === "multi") {
    return (
      <span
        className={cx(
          "badge",
          "rounded-pill",
          "bg-warning-subtle",
          "text-warning-emphasis",
          "border",
          "border-warning-subtle",
          "fw-normal",
        )}
      >
        {getStepPendingCount(step)} pending
      </span>
    );
  }

  const pendingText =
    step.pendingText ?? (step.isRequired ? "Required" : "Pending");

  if (step.isRequired) {
    return (
      <span className={cx("small", "text-danger-emphasis", "fw-normal")}>
        {pendingText}
      </span>
    );
  }

  return (
    <span className={cx("small", "text-body-secondary")}>{pendingText}</span>
  );
}
