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
import { Send } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import type { WizardStepListVariant } from "./WizardStepList";

import styles from "./PrerequisitesWizard.module.scss";

interface WizardSkipAllProps {
  buttonLabel?: string;
  className?: string;
  color: "outline-primary" | "primary";
  isDisabled: boolean;
  note: string;
  noteId: string;
  onClick: () => void;
  variant: WizardStepListVariant;
}

export default function WizardSkipAll({
  buttonLabel,
  className,
  color,
  isDisabled,
  note,
  noteId,
  onClick,
  variant,
}: WizardSkipAllProps) {
  return (
    <div className={className}>
      {buttonLabel && (
        <Button
          aria-describedby={noteId}
          className={cx(
            "mb-1",
            variant === "accordion" && "w-100",
            styles.touchTarget,
          )}
          color={color}
          data-cy={`prerequisites-wizard-skip-all-${variant}`}
          disabled={isDisabled}
          onClick={onClick}
        >
          <Send aria-hidden="true" className={cx("bi", "me-1")} />
          {buttonLabel}
        </Button>
      )}
      <p
        className={cx("mb-0", "small", "text-body-secondary")}
        data-cy={`prerequisites-wizard-skip-all-note-${variant}`}
        id={noteId}
      >
        {note}
      </p>
    </div>
  );
}
