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

import type {
  WizardItemCounts,
  WizardNavigationState,
  WizardStep,
  WizardStepStatus,
} from "./prerequisitesWizard.types";

export function getStepItemCounts(step: WizardStep): WizardItemCounts {
  if (step.kind === "single") {
    return { resolved: step.isSatisfied ? 1 : 0, total: 1 };
  }
  return { resolved: Math.min(step.resolved, step.total), total: step.total };
}

export function isStepComplete(step: WizardStep): boolean {
  const { resolved, total } = getStepItemCounts(step);
  return resolved >= total;
}

export function getStepPendingCount(step: WizardStep): number {
  const { resolved, total } = getStepItemCounts(step);
  return total - resolved;
}

interface GetStepStatusArgs {
  stepId: string;
  currentStepId: string;
  visitedStepIds: string[];
  resolved: number;
  total: number;
}

export function getResolvedSummary(step: WizardStep): string {
  const { resolved, total } = getStepItemCounts(step);
  return resolved >= total
    ? `All ${total} resolved`
    : `${resolved} of ${total} resolved`;
}

export function getStepStatus({
  stepId,
  currentStepId,
  visitedStepIds,
  resolved,
  total,
}: GetStepStatusArgs): WizardStepStatus {
  if (stepId === currentStepId) {
    return "current";
  }
  if (resolved >= total) {
    return "done";
  }
  if (visitedStepIds.includes(stepId)) {
    return "inProgress";
  }
  return "notVisited";
}

export function getRemainingItemCount(steps: WizardStep[]): number {
  return steps
    .filter((step) => !step.isRequired)
    .reduce((count, step) => count + getStepPendingCount(step), 0);
}

function firstOpenRequiredStep(steps: WizardStep[]): WizardStep | undefined {
  return steps.find((step) => step.isRequired && !isStepComplete(step));
}

export interface SubmitBlock {
  blocked: boolean;
  reason?: string;
}

/** Submit and skip-all stay disabled while a required step is open, or when the caller blocks them. Continue stays available. */
export function getSubmitBlock(
  steps: WizardStep[],
  isSubmitDisabled: boolean,
  submitDisabledReason?: string,
): SubmitBlock {
  const requiredStep = firstOpenRequiredStep(steps);
  const blocked = isSubmitDisabled || requiredStep != null;
  if (!blocked) {
    return { blocked: false };
  }
  return {
    blocked: true,
    reason:
      submitDisabledReason ??
      (requiredStep == null
        ? undefined
        : `Finish ${toInlineLabel(requiredStep.label)} first.`),
  };
}

/** Makes the first letter lowercase for use mid-sentence, keeping acronyms such as "SSH". */
export function toInlineLabel(label: string): string {
  const [firstWord] = label.split(" ");
  if (firstWord.length > 1 && firstWord === firstWord.toUpperCase()) {
    return label;
  }
  return label.charAt(0).toLowerCase() + label.slice(1);
}

export function getSubmitLabel(
  steps: WizardStep[],
  submitLabel: string,
): string {
  if (getRemainingItemCount(steps) > 0) {
    return `Skip all and ${toInlineLabel(submitLabel)}`;
  }
  return submitLabel;
}

export function getContinueLabel(
  currentStep: WizardStep,
  nextStep: WizardStep,
): string {
  const destination = `to ${toInlineLabel(nextStep.label)}`;
  if (!currentStep.isRequired && getStepPendingCount(currentStep) > 0) {
    return `Skip all and continue ${destination}`;
  }
  return `Continue ${destination}`;
}

export function getSkipAllNote(
  remainingCount: number,
  submitOutcome?: string,
): string {
  if (remainingCount === 0) {
    return "All items are resolved.";
  }
  const items = remainingCount === 1 ? "item" : "items";
  const skipped = `Skips the ${remainingCount} remaining ${items}`;
  return submitOutcome ? `${skipped} and ${submitOutcome}.` : `${skipped}.`;
}

function getPendingDescription(step: WizardStep): string {
  if (step.kind === "multi") {
    return `${getStepPendingCount(step)} pending`;
  }
  return toInlineLabel(
    step.pendingText ?? (step.isRequired ? "Required" : "Pending"),
  );
}

export function getStepAccessibleName(
  step: WizardStep,
  status: WizardStepStatus,
): string {
  if (isStepComplete(step)) {
    return `${step.label}, done`;
  }
  const visitDescription =
    status === "inProgress"
      ? "in progress"
      : status === "notVisited"
        ? "not visited"
        : null;
  return [step.label, getPendingDescription(step), visitDescription]
    .filter(Boolean)
    .join(", ");
}

interface CreateInitialNavigationStateArgs {
  steps: WizardStep[];
  initialStepId?: string;
  initialVisitedStepIds?: string[];
}

export function createInitialNavigationState({
  steps,
  initialStepId,
  initialVisitedStepIds = [],
}: CreateInitialNavigationStateArgs): WizardNavigationState {
  const initialStep =
    steps.find((step) => step.id === initialStepId) ?? steps[0];
  return {
    currentStepId: initialStep?.id ?? "",
    visitedStepIds: initialVisitedStepIds,
  };
}

/** Falls back to the first step when the current id is not in the list. */
export function resolveCurrentStepId(
  steps: WizardStep[],
  currentStepId: string,
): string | undefined {
  if (steps.some((step) => step.id === currentStepId)) {
    return currentStepId;
  }
  return steps[0]?.id;
}

export function goToStep(
  state: WizardNavigationState,
  fromStepId: string,
  toStepId: string,
): WizardNavigationState {
  if (toStepId === fromStepId) {
    return state;
  }
  const visitedStepIds =
    fromStepId.length === 0 || state.visitedStepIds.includes(fromStepId)
      ? state.visitedStepIds
      : [...state.visitedStepIds, fromStepId];
  return { currentStepId: toStepId, visitedStepIds };
}
