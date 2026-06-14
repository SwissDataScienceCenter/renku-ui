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
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Label } from "reactstrap";

import type { ResourcePoolWithIdFiltered } from "../../api/computeResources.api";
import SessionClassSelector from "../SessionClassSelector";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";
import type { SubmitJobForm } from "./useSubmitJobForm";

interface SubmitJobResourceClassFieldProps {
  control: Control<SubmitJobForm>;
  isErrorResourcePools: boolean;
  isLoadingResourcePools: boolean;
  isSubmitDisabled: boolean;
  resourcePools: ResourcePoolWithIdFiltered[] | undefined;
  setValue: UseFormSetValue<SubmitJobForm>;
}

export default function SubmitJobResourceClassField({
  control,
  isErrorResourcePools,
  isLoadingResourcePools,
  isSubmitDisabled,
  resourcePools,
  setValue,
}: SubmitJobResourceClassFieldProps) {
  const resourceClassSelector = isLoadingResourcePools ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length === 0 || isErrorResourcePools ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <Controller
      control={control}
      name="resourceClass"
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <SessionClassSelector
            id="submitJobResourceClass"
            currentSessionClass={value}
            resourcePools={resourcePools}
            disabled={isSubmitDisabled}
            onChange={(resourceClass) => {
              onChange(resourceClass);
              if (resourceClass) {
                setValue("diskStorage", resourceClass.default_storage);
              }
            }}
          />
          {error && (
            <div className={cx("small", "text-danger")}>
              {error.message || "Please provide a valid resource class."}
            </div>
          )}
        </>
      )}
      rules={{ required: "Please provide a valid resource class." }}
    />
  );

  return (
    <div>
      <Label className="form-label" for="submitJobResourceClass">
        Compute resources
      </Label>
      <div className="field-group">{resourceClassSelector}</div>
    </div>
  );
}
