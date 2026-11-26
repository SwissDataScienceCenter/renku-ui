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
import { Controller, type Control } from "react-hook-form";
import { Input, Label } from "reactstrap";

import type { StorageQuotaForm } from "./adminComputeResources.types";
import ResourcePoolSelector from "./ResourcePoolSelector";
import StorageFlavorSelector from "./StorageFlavorSelector";

interface StorageQuotaFormContentProps {
  control: Control<StorageQuotaForm>;
  editMode?: boolean;
  idPrefix: string;
}

export default function StorageQuotaFormContent({
  control,
  editMode,
  idPrefix,
}: StorageQuotaFormContentProps) {
  return (
    <>
      {!editMode && (
        <div className="mb-3">
          <ResourcePoolSelector
            control={control}
            name="resource_pool_id"
            idPrefix={idPrefix}
          />
        </div>
      )}

      {!editMode && (
        <div className="mb-3">
          <StorageFlavorSelector
            control={control}
            name="storage_flavor_id"
            idPrefix={idPrefix}
          />
        </div>
      )}

      <div className="mb-3">
        <Label for={`${idPrefix}-max-size`}>
          Maximum size (GB) per storage
        </Label>
        <Controller
          control={control}
          name="max_size"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-max-size`}
                min={1}
                step={1}
                type="number"
                {...field}
                onChange={(event) => {
                  if (isNaN(event.target.valueAsNumber)) {
                    field.onChange(event.target.value);
                  } else {
                    field.onChange(event.target.valueAsNumber);
                  }
                }}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the maximum size."}
              </div>
            </>
          )}
          rules={{
            required: "Please provide a value for the maximum size.",
            min: {
              value: 1,
              message: "The maximum size must be greater or equal to 1.",
            },
            validate: {
              integer: (value: unknown) =>
                Number.isInteger(Number(value)) ||
                "Please provide an integer value.",
            },
          }}
        />
      </div>

      <div className="mb-3">
        <Label for={`${idPrefix}-total-size`}>
          Total size (GB) of the quota
        </Label>
        <Controller
          control={control}
          name="total_size"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-total-size`}
                min={1}
                step={1}
                type="number"
                {...field}
                onChange={(event) => {
                  if (isNaN(event.target.valueAsNumber)) {
                    field.onChange(event.target.value);
                  } else {
                    field.onChange(event.target.valueAsNumber);
                  }
                }}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the total size."}
              </div>
            </>
          )}
          rules={{
            required: "Please provide a value for the total size.",
            min: {
              value: 1,
              message: "The total size must be greater or equal to 1.",
            },
            validate: {
              integer: (value: unknown) =>
                Number.isInteger(Number(value)) ||
                "Please provide an integer value.",
            },
          }}
        />
      </div>
    </>
  );
}
