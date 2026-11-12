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

import { useCallback, useState } from "react";

import type { WizardStep } from "./prerequisitesWizard.types";
import {
  createInitialNavigationState,
  goToStep,
  resolveCurrentStepId,
} from "./prerequisitesWizard.utils";

interface UseWizardNavigationArgs {
  steps: WizardStep[];
  initialStepId?: string;
  initialVisitedStepIds?: string[];
  onStepChange?: (stepId: string, previousStepId: string) => void;
}

export default function useWizardNavigation({
  steps,
  initialStepId,
  initialVisitedStepIds,
  onStepChange,
}: UseWizardNavigationArgs) {
  const [state, setState] = useState(() =>
    createInitialNavigationState({
      steps,
      initialStepId,
      initialVisitedStepIds,
    }),
  );

  const currentStepId = resolveCurrentStepId(steps, state.currentStepId);
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  const currentStep = steps[currentIndex];
  const nextStep = steps[currentIndex + 1];

  const goTo = useCallback(
    (stepId: string) => {
      if (currentStepId == null || stepId === currentStepId) {
        return;
      }
      setState((current) => goToStep(current, currentStepId, stepId));
      onStepChange?.(stepId, currentStepId);
    },
    [currentStepId, onStepChange],
  );

  const goNext = useCallback(() => {
    if (nextStep) {
      goTo(nextStep.id);
    }
  }, [goTo, nextStep]);

  return {
    currentStep,
    goNext,
    goTo,
    isLast: currentIndex === steps.length - 1,
    nextStep,
    visitedStepIds: state.visitedStepIds,
  };
}
