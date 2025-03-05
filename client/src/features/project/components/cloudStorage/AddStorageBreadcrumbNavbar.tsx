/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useMemo } from "react";
import { Breadcrumb, BreadcrumbItem, Button } from "reactstrap";

import { CLOUD_STORAGE_TOTAL_STEPS } from "./projectCloudStorage.constants";
import { AddCloudStorageState } from "./projectCloudStorage.types";

// *** Navigation: breadcrumbs and advanced mode selector *** //

interface AddStorageBreadcrumbNavbarProps {
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
}

export default function AddStorageBreadcrumbNavbar({
  setState,
  state,
}: AddStorageBreadcrumbNavbarProps) {
  const { step, completedSteps } = state;
  const items = useMemo(() => {
    const steps = state.advancedMode
      ? [0, CLOUD_STORAGE_TOTAL_STEPS]
      : Array.from(
          { length: CLOUD_STORAGE_TOTAL_STEPS },
          (_, index) => index + 1
        );
    const items = steps.map((stepNumber) => {
      const active = stepNumber === step;
      const disabled = stepNumber > completedSteps + 1;
      return (
        <BreadcrumbItem active={active} key={stepNumber}>
          {active ? (
            <>{mapStepToName[stepNumber]}</>
          ) : (
            <>
              <Button
                className={cx(
                  "p-0",
                  (active || disabled) && "text-decoration-none"
                )}
                color="link"
                disabled={disabled}
                onClick={() => {
                  setState({ step: stepNumber });
                }}
              >
                {mapStepToName[stepNumber]}
              </Button>
            </>
          )}
        </BreadcrumbItem>
      );
    });
    return items;
  }, [completedSteps, setState, step, state.advancedMode]);

  return (
    <Breadcrumb data-cy="cloud-storage-edit-navigation">{items}</Breadcrumb>
  );
}

const mapStepToName: { [key: number]: string } = {
  0: "Advanced configuration",
  1: "Storage",
  2: "Options",
  3: "Mount",
};
