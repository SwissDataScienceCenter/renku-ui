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
import { useEffect, useId, useRef, type ReactNode, type Ref } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import type { WizardStep } from "./prerequisitesWizard.types";
import {
  getRemainingItemCount,
  getSkipAllNote,
  getSubmitBlock,
} from "./prerequisitesWizard.utils";
import useWizardNavigation from "./useWizardNavigation.hook";
import WizardFooter from "./WizardFooter";
import WizardSkipAll from "./WizardSkipAll";
import WizardStepList, { type WizardStepListVariant } from "./WizardStepList";
import WizardStepsAccordion from "./WizardStepsAccordion";

import styles from "./PrerequisitesWizard.module.scss";

export interface PrerequisitesWizardProps {
  initialStepId?: string;
  initialVisitedStepIds?: string[];
  isOpen: boolean;
  isSubmitDisabled?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onContinue?: (currentStepId: string) => void;
  onStepChange?: (stepId: string, previousStepId: string) => void;
  onSubmit: () => void;
  /** Label of the button that submits from any step. Omit to hide the button. */
  skipAllLabel?: string;
  steps: WizardStep[];
  submitDisabledReason?: string;
  submitLabel: string;
  /** Completes the skip-all note: "Skips the 3 remaining items and {submitOutcome}." */
  submitOutcome?: string;
  /** Secondary content under `summaryTitle`, e.g. metadata of what is being configured. */
  summaryDetails?: ReactNode;
  /** Name of what the steps configure. Shown above the step list, and under the title on small screens. */
  summaryTitle?: string;
  title: string;
}

export default function PrerequisitesWizard(props: PrerequisitesWizardProps) {
  const { isOpen, onCancel, steps } = props;
  const titleId = useId();
  const hasSteps = steps.length > 0;

  return (
    <Modal
      backdrop="static"
      centered
      data-cy="prerequisites-wizard"
      fullscreen="lg"
      isOpen={isOpen && hasSteps}
      keyboard
      labelledBy={titleId}
      scrollable
      size="xl"
      toggle={onCancel}
    >
      <PrerequisitesWizardContent {...props} titleId={titleId} />
    </Modal>
  );
}

interface PrerequisitesWizardContentProps extends PrerequisitesWizardProps {
  titleId: string;
}

function PrerequisitesWizardContent({
  initialStepId,
  initialVisitedStepIds,
  isSubmitDisabled = false,
  isSubmitting = false,
  onCancel,
  onContinue,
  onStepChange,
  onSubmit,
  skipAllLabel,
  steps,
  submitDisabledReason,
  submitLabel,
  submitOutcome,
  summaryDetails,
  summaryTitle,
  title,
  titleId,
}: PrerequisitesWizardContentProps) {
  const idPrefix = useId();
  const navigation = useWizardNavigation({
    steps,
    initialStepId,
    initialVisitedStepIds,
    onStepChange,
  });
  const { currentStep, visitedStepIds } = navigation;
  const headingRef = useFocusOnStepChange(currentStep?.id);

  if (currentStep == null) {
    return null;
  }

  const submitBlock = getSubmitBlock(
    steps,
    isSubmitDisabled,
    submitDisabledReason,
  );
  const disabledReason = submitBlock.reason;
  const reasonId = `${idPrefix}-submit-disabled-reason`;
  const skipAllButtonLabel = navigation.isLast ? undefined : skipAllLabel;
  const stepsNavigation: WizardStepsNavigationProps = {
    currentStepId: currentStep.id,
    onSelect: navigation.goTo,
    skipAll:
      skipAllButtonLabel || disabledReason
        ? {
            buttonLabel: skipAllButtonLabel,
            isDisabled: submitBlock.blocked || isSubmitting,
            note:
              disabledReason ??
              getSkipAllNote(getRemainingItemCount(steps), submitOutcome),
            noteIdPrefix: `${idPrefix}-skip-all-note`,
            onClick: onSubmit,
          }
        : null,
    steps,
    visitedStepIds,
  };

  return (
    <>
      <WizardHeader
        onCancel={onCancel}
        summaryDetails={summaryDetails}
        summaryTitle={summaryTitle}
        title={title}
        titleId={titleId}
      />
      <ModalBody
        className={cx(
          "bg-body-tertiary",
          "d-flex",
          "flex-column",
          "flex-lg-row",
          "p-0",
          styles.body,
        )}
      >
        <WizardPanel
          summaryDetails={summaryDetails}
          summaryTitle={summaryTitle}
          stepsNavigation={stepsNavigation}
        />
        <WizardMobileSteps
          currentStep={currentStep}
          stepsNavigation={stepsNavigation}
        />
        <WizardStepContent
          headingId={`${idPrefix}-step-heading`}
          headingRef={headingRef}
          step={currentStep}
        />
      </ModalBody>
      {disabledReason && (
        <span className="visually-hidden" id={reasonId}>
          {disabledReason}
        </span>
      )}
      <WizardFooter
        currentStep={currentStep}
        isSubmitDisabled={submitBlock.blocked}
        isSubmitting={isSubmitting}
        nextStep={navigation.nextStep}
        onCancel={onCancel}
        onContinue={() => {
          onContinue?.(currentStep.id);
          navigation.goNext();
        }}
        onSubmit={onSubmit}
        steps={steps}
        submitDisabledReasonId={disabledReason ? reasonId : undefined}
        submitLabel={submitLabel}
      />
    </>
  );
}

function useFocusOnStepChange(stepId: string | undefined) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedStepIdRef = useRef(stepId);

  useEffect(() => {
    if (stepId === focusedStepIdRef.current) {
      return;
    }
    focusedStepIdRef.current = stepId;
    headingRef.current?.focus();
  }, [stepId]);

  return headingRef;
}

interface WizardHeaderProps {
  onCancel: () => void;
  summaryDetails?: ReactNode;
  summaryTitle?: string;
  title: string;
  titleId: string;
}

function WizardHeader({
  onCancel,
  summaryDetails,
  summaryTitle,
  title,
  titleId,
}: WizardHeaderProps) {
  return (
    <ModalHeader
      className="gap-3"
      data-cy="prerequisites-wizard-header"
      tag="div"
      toggle={onCancel}
    >
      <div className="min-w-0">
        <h2 className="mb-0" id={titleId}>
          {title}
        </h2>
        {(summaryTitle || summaryDetails) && (
          <div className="d-lg-none">
            {summaryTitle && (
              <p className={cx("mb-0", "small", "text-body-secondary")}>
                {summaryTitle}
              </p>
            )}
            {summaryDetails && (
              <div
                className={cx(
                  "small",
                  "text-body-secondary",
                  summaryTitle && "mt-1",
                )}
              >
                {summaryDetails}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalHeader>
  );
}

interface WizardSkipAllConfig {
  buttonLabel?: string;
  isDisabled: boolean;
  note: string;
  noteIdPrefix: string;
  onClick: () => void;
}

interface WizardStepsNavigationProps {
  currentStepId: string;
  onSelect: (stepId: string) => void;
  skipAll: WizardSkipAllConfig | null;
  steps: WizardStep[];
  visitedStepIds: string[];
}

function WizardStepsNavigation({
  skipAll,
  variant,
  ...stepListProps
}: WizardStepsNavigationProps & { variant: WizardStepListVariant }) {
  return (
    <>
      <WizardStepList {...stepListProps} variant={variant} />
      {skipAll && (
        <WizardSkipAll
          buttonLabel={skipAll.buttonLabel}
          className="px-3"
          isDisabled={skipAll.isDisabled}
          note={skipAll.note}
          noteId={`${skipAll.noteIdPrefix}-${variant}`}
          onClick={skipAll.onClick}
          variant={variant}
        />
      )}
    </>
  );
}

interface WizardPanelProps {
  stepsNavigation: WizardStepsNavigationProps;
  summaryDetails?: ReactNode;
  summaryTitle?: string;
}

function WizardPanel({
  stepsNavigation,
  summaryDetails,
  summaryTitle,
}: WizardPanelProps) {
  return (
    <div
      className={cx(
        "d-none",
        "d-lg-flex",
        "flex-column",
        "gap-3",
        "py-3",
        styles.panel,
      )}
      data-cy="prerequisites-wizard-panel"
    >
      {(summaryTitle || summaryDetails) && (
        <div className="px-3">
          {summaryTitle && (
            <p className={cx("fs-3", "fw-bold", "mb-1")}>{summaryTitle}</p>
          )}
          {summaryDetails && (
            <div className={cx("small", "text-body-secondary")}>
              {summaryDetails}
            </div>
          )}
        </div>
      )}
      <WizardStepsNavigation {...stepsNavigation} variant="panel" />
    </div>
  );
}

interface WizardMobileStepsProps {
  currentStep: WizardStep;
  stepsNavigation: WizardStepsNavigationProps;
}

function WizardMobileSteps({
  currentStep,
  stepsNavigation,
}: WizardMobileStepsProps) {
  return (
    <div className={cx("d-flex", "d-lg-none", "flex-column", "gap-3", "p-3")}>
      <WizardStepsAccordion currentStep={currentStep}>
        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <WizardStepsNavigation {...stepsNavigation} variant="accordion" />
        </div>
      </WizardStepsAccordion>
    </div>
  );
}

interface WizardStepContentProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  step: WizardStep;
}

function WizardStepContent({
  headingId,
  headingRef,
  step,
}: WizardStepContentProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cx(
        "bg-body",
        "flex-grow-1",
        "m-lg-0",
        "mb-3",
        "min-w-0",
        "mx-3",
        "p-3",
        "p-lg-4",
        "overflow-scroll",
        styles.content,
      )}
      data-cy="prerequisites-wizard-step-content"
    >
      <h3 className="mb-1" id={headingId} ref={headingRef} tabIndex={-1}>
        {step.label}
      </h3>
      {step.description && <p className="mb-3">{step.description}</p>}
      {step.content}
    </section>
  );
}
