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
import { ArrowRight, Send, XLg } from "react-bootstrap-icons";
import { Button, ModalFooter } from "reactstrap";

import { Loader } from "~/components/Loader";
import type { WizardStep } from "./prerequisitesWizard.types";
import {
  getContinueLabel,
  getStepPendingCount,
  getSubmitLabel,
} from "./prerequisitesWizard.utils";

import styles from "./PrerequisitesWizard.module.scss";

interface WizardFooterProps {
  currentStep: WizardStep;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  nextStep: WizardStep | undefined;
  onCancel: () => void;
  onContinue: () => void;
  onSubmit: () => void;
  steps: WizardStep[];
  submitDisabledReasonId?: string;
  submitLabel: string;
}

export default function WizardFooter({
  currentStep,
  isSubmitDisabled,
  isSubmitting,
  nextStep,
  onCancel,
  onContinue,
  onSubmit,
  steps,
  submitDisabledReasonId,
  submitLabel,
}: WizardFooterProps) {
  const buttonClassName = styles.touchTarget;

  return (
    <ModalFooter
      className={cx(
        "align-items-stretch",
        "align-items-lg-center",
        "flex-column",
        "flex-lg-row",
        "flex-wrap",
      )}
    >
      <Button
        className={buttonClassName}
        color="outline-primary"
        data-cy="prerequisites-wizard-cancel"
        onClick={onCancel}
      >
        <XLg aria-hidden="true" className={cx("bi", "me-1")} />
        Cancel
      </Button>
      {nextStep ? (
        <Button
          className={buttonClassName}
          color={
            getStepPendingCount(currentStep) > 0 ? "outline-primary" : "primary"
          }
          data-cy="prerequisites-wizard-continue"
          disabled={isSubmitting}
          onClick={onContinue}
        >
          {getContinueLabel(currentStep, nextStep)}
          <ArrowRight aria-hidden="true" className={cx("bi", "ms-1")} />
        </Button>
      ) : (
        <Button
          aria-describedby={
            isSubmitDisabled ? submitDisabledReasonId : undefined
          }
          className={buttonClassName}
          color="primary"
          data-cy="prerequisites-wizard-submit"
          disabled={isSubmitDisabled || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Send aria-hidden="true" className={cx("bi", "me-1")} />
          )}
          {getSubmitLabel(steps, submitLabel)}
        </Button>
      )}
    </ModalFooter>
  );
}
