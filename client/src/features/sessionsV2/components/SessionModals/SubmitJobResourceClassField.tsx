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
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import {
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  UncontrolledTooltip,
} from "reactstrap";

import type { ResourcePoolWithIdFiltered } from "../../api/computeResources.api";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../session.constants";
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
  areFormInputsDisabled: boolean;
  resourcePools: ResourcePoolWithIdFiltered[] | undefined;
  setValue: UseFormSetValue<SubmitJobForm>;
}

export default function SubmitJobResourceClassField({
  control,
  isErrorResourcePools,
  isLoadingResourcePools,
  areFormInputsDisabled,
  resourcePools,
  setValue,
}: SubmitJobResourceClassFieldProps) {
  const watchCurrentSessionClass = useWatch({ control, name: "resourceClass" });
  const watchCurrentDiskStorage = useWatch({ control, name: "diskStorage" });

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
            disabled={areFormInputsDisabled}
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
      {watchCurrentSessionClass && (
        <div className={cx("field-group", "mt-3")}>
          <Label className="form-label" for="submitJobDiskStorage">
            Disk Storage:{" "}
            <span className="fw-bold">
              {watchCurrentDiskStorage &&
              watchCurrentDiskStorage !=
                watchCurrentSessionClass.default_storage ? (
                <>{watchCurrentDiskStorage} GB</>
              ) : (
                <>{watchCurrentSessionClass.default_storage} GB (default)</>
              )}
            </span>
          </Label>
          <Controller
            control={control}
            name="diskStorage"
            render={({ field, fieldState: { error } }) => (
              <>
                <InputGroup className={cx(error && "is-invalid")}>
                  <Input
                    className={cx(error && "is-invalid")}
                    data-cy="submit-job-disk-storage-input"
                    disabled={areFormInputsDisabled}
                    id="submitJobDiskStorage"
                    type="number"
                    min={MIN_SESSION_STORAGE_GB}
                    max={watchCurrentSessionClass.max_storage}
                    step={STEP_SESSION_STORAGE_GB}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      if (isNaN(event.target.valueAsNumber)) {
                        field.onChange(event.target.value);
                      } else {
                        field.onChange(event.target.valueAsNumber);
                      }
                    }}
                  />
                  <InputGroupText id="submit-job-disk-storage-addon">
                    GB
                  </InputGroupText>
                  <UncontrolledTooltip target="submit-job-disk-storage-addon">
                    Gigabytes
                  </UncontrolledTooltip>
                </InputGroup>
                <div className="invalid-feedback">
                  {error?.message ||
                    "Please provide a valid value for disk storage."}
                </div>
                <FormText>
                  Default: {watchCurrentSessionClass.default_storage} GB, max:{" "}
                  {watchCurrentSessionClass.max_storage} GB
                </FormText>
              </>
            )}
            rules={{
              min: {
                value: MIN_SESSION_STORAGE_GB,
                message: `Please select a value greater than or equal to ${MIN_SESSION_STORAGE_GB}.`,
              },
              max: {
                value: watchCurrentSessionClass.max_storage,
                message: `Selected disk storage exceeds maximum allowed value (${watchCurrentSessionClass.max_storage} GB).`,
              },
              validate: {
                integer: (value: unknown) =>
                  value == null ||
                  value === "" ||
                  (!isNaN(parseInt(`${value}`, 10)) &&
                    parseInt(`${value}`, 10) == parseFloat(`${value}`)),
              },
              deps: ["resourceClass"],
            }}
          />
        </div>
      )}
    </div>
  );
}
