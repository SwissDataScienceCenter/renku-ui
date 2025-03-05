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
import { Breadcrumb, BreadcrumbItem, Button } from "reactstrap";

export enum LauncherType {
  Environment = "environment",
  LauncherDetails = "launcherDetails",
}
interface SessionLauncherBreadcrumbNavbarProps {
  setStep: (newState: LauncherType) => void;
  step: LauncherType;
  readyToGoNext: boolean;
}
export const SessionLauncherBreadcrumbNavbar = ({
  setStep,
  step,
  readyToGoNext,
}: SessionLauncherBreadcrumbNavbarProps) => {
  const handleStepChange = (newStep: LauncherType) => {
    if (newStep === "launcherDetails" && !readyToGoNext) return;
    setStep(newStep);
  };

  const breadcrumbItems = [
    {
      label: "1. Define Environment",
      stepKey: "environment",
      isActive: step === "environment",
    },
    {
      label: "2. Define Launcher Details",
      stepKey: "launcherDetails",
      isActive: step === "launcherDetails",
      disabled: !readyToGoNext,
    },
  ];

  return (
    <Breadcrumb data-cy="add-session-launcher-navigation">
      {breadcrumbItems.map(({ label, stepKey, isActive, disabled }) => (
        <BreadcrumbItem key={stepKey} active={isActive}>
          <Button
            className={cx(
              "p-0",
              isActive && ["text-decoration-none", "fw-bold"]
            )}
            color="link"
            onClick={() => handleStepChange(stepKey as LauncherType)}
            disabled={disabled}
          >
            {label}
          </Button>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};
