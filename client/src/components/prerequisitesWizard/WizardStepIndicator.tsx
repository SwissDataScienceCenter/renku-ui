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

import type { WizardStepStatus } from "./prerequisitesWizard.types";

import styles from "./PrerequisitesWizard.module.scss";

interface WizardStepIndicatorProps {
  status: WizardStepStatus;
  isPreviousDone?: boolean;
  isDone?: boolean;
  leadsToVisitedStep?: boolean;
}

export default function WizardStepIndicator({
  status,
  isPreviousDone,
  isDone,
  leadsToVisitedStep,
}: WizardStepIndicatorProps) {
  return (
    <span aria-hidden="true" className={styles.indicator}>
      {isPreviousDone != null && (
        <span
          className={cx(
            styles.connectorAbove,
            isPreviousDone && styles.connectorDone,
            status === "notVisited" && styles.connectorDashed,
          )}
        />
      )}
      <span className={cx(styles.circle, styles[status])} />
      {isDone != null && (
        <span
          className={cx(
            styles.connectorBelow,
            isDone && styles.connectorDone,
            leadsToVisitedStep === false && styles.connectorDashed,
          )}
        />
      )}
    </span>
  );
}
