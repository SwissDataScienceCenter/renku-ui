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

interface SessionLauncherBreadcrumbNavbarProps {
  setStep: (newState: "environment" | "launcherDetails") => void;
  step: "environment" | "launcherDetails";
  readyToGoNext: boolean;
}
export const SessionLauncherBreadcrumbNavbar = ({
  setStep,
  step,
  readyToGoNext,
}: SessionLauncherBreadcrumbNavbarProps) => {
  return (
    <Breadcrumb data-cy="add-session-launcher-navigation">
      <BreadcrumbItem active={step === "environment"} key={"link-environment"}>
        <Button
          className={cx(
            "p-0",
            step === "environment" && ["text-decoration-none", "fw-bold"]
          )}
          color="link"
          onClick={() => {
            setStep("environment");
          }}
        >
          {" "}
          1. Define Environment
        </Button>
      </BreadcrumbItem>
      <BreadcrumbItem
        active={step === "launcherDetails"}
        key={"link-launcher-details"}
      >
        <Button
          className={cx(
            "p-0",
            step === "launcherDetails" && ["text-decoration-none", "fw-bold"]
          )}
          color="link"
          disabled={!readyToGoNext}
          onClick={() => {
            setStep("launcherDetails");
          }}
        >
          {" "}
          2. Define launcher details
        </Button>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};
