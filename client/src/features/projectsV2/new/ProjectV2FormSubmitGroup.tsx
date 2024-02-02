/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { Button } from "reactstrap";

import type { NewProjectV2State } from "./projectV2New.slice";
import { setCurrentStep } from "./projectV2New.slice";

interface ProjectV2NewFormProps {
  currentStep: NewProjectV2State["currentStep"];
}
export default function ProjectFormSubmitGroup({
  currentStep,
}: ProjectV2NewFormProps) {
  const dispatch = useDispatch();

  const previousStep = useCallback(() => {
    if (currentStep < 1) return;
    const previousStep = (currentStep - 1) as typeof currentStep;
    dispatch(setCurrentStep(previousStep));
  }, [currentStep, dispatch]);

  return (
    <div className={cx("d-flex", "justify-content-between")}>
      <Button
        className={cx(currentStep > 0 ? "visible" : "invisible")}
        onClick={previousStep}
      >
        Back
      </Button>
      <div>
        {currentStep === 0 && (
          <Button className="me-1" type="submit">
            Set Visibility
          </Button>
        )}
        {currentStep === 1 && (
          <Button className="me-1" type="submit">
            Add repositories
          </Button>
        )}
        {currentStep === 2 && <Button type="submit">Review</Button>}
        {currentStep === 3 && <Button type="submit">Create</Button>}
      </div>
    </div>
  );
}
