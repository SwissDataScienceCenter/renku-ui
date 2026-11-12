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
import { useId, useState, type ReactNode } from "react";
import { ListCheck } from "react-bootstrap-icons";
import { Collapse } from "reactstrap";

import type { WizardStep } from "./prerequisitesWizard.types";
import WizardStepStatus from "./WizardStepStatus";

interface WizardStepsAccordionProps {
  children: ReactNode;
  currentStep: WizardStep;
}

export default function WizardStepsAccordion({
  children,
  currentStep,
}: WizardStepsAccordionProps) {
  const bodyId = useId();
  const [openForStepId, setOpenForStepId] = useState<string | null>(null);
  const isOpen = openForStepId === currentStep.id;

  return (
    <div className="accordion" data-cy="prerequisites-wizard-steps-accordion">
      <div className="accordion-item">
        <div className="accordion-header">
          <button
            aria-controls={bodyId}
            aria-expanded={isOpen}
            className={cx("accordion-button", "gap-3", !isOpen && "collapsed")}
            data-cy="prerequisites-wizard-steps-accordion-toggle"
            onClick={() => setOpenForStepId(isOpen ? null : currentStep.id)}
            type="button"
          >
            <ListCheck
              aria-hidden="true"
              className={cx("bi", "flex-shrink-0", "fs-4")}
            />
            <span className={cx("d-flex", "flex-column", "min-w-0")}>
              <span className={cx("small", "text-body-secondary")}>Steps</span>
              <span
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-wrap",
                  "gap-2",
                )}
              >
                <span className="fw-semibold">{currentStep.label}</span>
                <WizardStepStatus step={currentStep} />
              </span>
            </span>
          </button>
        </div>
        <Collapse className="accordion-collapse" id={bodyId} isOpen={isOpen}>
          <div className={cx("accordion-body", "pb-3", "pt-0", "px-0")}>
            {children}
          </div>
        </Collapse>
      </div>
    </div>
  );
}
