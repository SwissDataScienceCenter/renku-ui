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

import type { ReactNode } from "react";

export type WizardStepStatus = "notVisited" | "current" | "inProgress" | "done";

interface WizardStepBase {
  id: string;
  label: string;
  isRequired?: boolean; // Blocks submit and skip-all until the step is complete.
  description?: ReactNode;
  content: ReactNode;
}

export type WizardSingleStep = WizardStepBase & {
  kind: "single";
  isSatisfied?: boolean;
  pendingText?: string;
};

export type WizardMultiStep = WizardStepBase & {
  kind: "multi";
  resolved: number;
  total: number;
};

export type WizardStep = WizardSingleStep | WizardMultiStep;

export interface WizardItemCounts {
  resolved: number;
  total: number;
}

export interface WizardNavigationState {
  currentStepId: string;
  visitedStepIds: string[];
}
