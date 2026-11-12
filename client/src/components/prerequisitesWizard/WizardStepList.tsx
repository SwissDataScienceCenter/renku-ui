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

import type {
  WizardStep,
  WizardStepStatus as WizardStepStatusType,
} from "./prerequisitesWizard.types";
import {
  getResolvedSummary,
  getStepAccessibleName,
  getStepItemCounts,
  getStepStatus,
  isStepComplete,
} from "./prerequisitesWizard.utils";
import WizardStepIndicator from "./WizardStepIndicator";
import WizardStepStatus from "./WizardStepStatus";

import styles from "./PrerequisitesWizard.module.scss";

export type WizardStepListVariant = "panel" | "accordion";

interface WizardStepListProps {
  currentStepId: string;
  onSelect: (stepId: string) => void;
  steps: WizardStep[];
  variant: WizardStepListVariant;
  visitedStepIds: string[];
}

export default function WizardStepList({
  currentStepId,
  onSelect,
  steps,
  variant,
  visitedStepIds,
}: WizardStepListProps) {
  const statuses = steps.map((step) =>
    getStepStatus({
      stepId: step.id,
      currentStepId,
      visitedStepIds,
      ...getStepItemCounts(step),
    }),
  );

  return (
    <nav aria-label="Steps">
      <ol className={cx("list-unstyled", "mb-0")}>
        {steps.map((step, index) => (
          <li key={step.id}>
            <WizardStepButton
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              isPreviousDone={index > 0 && isStepComplete(steps[index - 1])}
              leadsToVisitedStep={
                index < steps.length - 1
                  ? statuses[index + 1] !== "notVisited"
                  : undefined
              }
              onSelect={onSelect}
              status={statuses[index]}
              step={step}
              variant={variant}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface WizardStepButtonProps {
  isFirst: boolean;
  isLast: boolean;
  isPreviousDone: boolean;
  leadsToVisitedStep?: boolean;
  onSelect: (stepId: string) => void;
  status: WizardStepStatusType;
  step: WizardStep;
  variant: WizardStepListVariant;
}

function WizardStepButton({
  isFirst,
  isLast,
  isPreviousDone,
  leadsToVisitedStep,
  onSelect,
  status,
  step,
  variant,
}: WizardStepButtonProps) {
  const isCurrent = status === "current";

  return (
    <button
      aria-current={isCurrent ? "step" : undefined}
      aria-label={getStepAccessibleName(step, status)}
      className={cx(
        "d-flex",
        "focus-ring",
        "gap-3",
        "px-3",
        "text-body",
        "text-start",
        "border-0",
        "py-0",
        styles.stepButton,
        isCurrent &&
          (variant === "panel"
            ? styles.stepButtonCurrentInPanel
            : styles.stepButtonCurrentInAccordion),
      )}
      data-cy={`prerequisites-wizard-step-${step.id}-${variant}`}
      onClick={() => onSelect(step.id)}
      type="button"
    >
      <WizardStepIndicator
        isDone={isLast ? undefined : isStepComplete(step)}
        isPreviousDone={isFirst ? undefined : isPreviousDone}
        leadsToVisitedStep={leadsToVisitedStep}
        status={status}
      />
      <span className={cx("flex-grow-1", "min-w-0", "py-2")}>
        <span
          className={cx(
            "align-items-start",
            "d-flex",
            "gap-2",
            "justify-content-between",
          )}
        >
          <span
            className={cx(
              (isCurrent || status === "done") && "text-primary",
              isCurrent && "fw-semibold",
            )}
          >
            {step.label}
          </span>
          <WizardStepStatus step={step} />
        </span>
        {step.kind === "multi" && (
          <span className={cx("d-block", "small", "text-body-secondary")}>
            {getResolvedSummary(step)}
          </span>
        )}
      </span>
    </button>
  );
}
