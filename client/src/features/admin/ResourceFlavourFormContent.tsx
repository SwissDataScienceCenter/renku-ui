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
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Input, Label } from "reactstrap";

import type { ResourceFlavourForm } from "./adminComputeResources.types";

export const RESOURCE_FLAVOUR_NAME_MIN_LENGTH = 5;
const DESCRIPTION_MAX_LENGTH = 500;

interface ResourceFlavourFormContentProps {
  control: Control<ResourceFlavourForm>;
  errors: FieldErrors<ResourceFlavourForm>;
  idPrefix: string;
}

export default function ResourceFlavourFormContent({
  control,
  errors,
  idPrefix,
}: ResourceFlavourFormContentProps) {
  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}Name`}>
          Name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
              id={`${idPrefix}Name`}
              type="text"
              {...field}
            />
          )}
          rules={{
            required: true,
            minLength: RESOURCE_FLAVOUR_NAME_MIN_LENGTH,
          }}
        />
        <div className="invalid-feedback">
          Please provide a name of at least {RESOURCE_FLAVOUR_NAME_MIN_LENGTH}{" "}
          characters
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}Description`}>
          Description
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.description && "is-invalid")}
              id={`${idPrefix}Description`}
              placeholder="Why this flavour is sized the way it is"
              rows={2}
              type="textarea"
              {...field}
            />
          )}
          rules={{ maxLength: DESCRIPTION_MAX_LENGTH }}
        />
        <div className="invalid-feedback">
          The description cannot be longer than {DESCRIPTION_MAX_LENGTH}{" "}
          characters
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}Cpu`}>
          CPUs
        </Label>
        <Controller
          control={control}
          name="cpu"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.cpu && "is-invalid")}
              id={`${idPrefix}Cpu`}
              min={0.1}
              step={0.1}
              type="number"
              {...field}
            />
          )}
          rules={{ required: true, min: 0.1 }}
        />
        <div className="invalid-feedback">Invalid value for CPUs</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}Memory`}>
          Memory (GB RAM)
        </Label>
        <Controller
          control={control}
          name="memory"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.memory && "is-invalid")}
              id={`${idPrefix}Memory`}
              min={1}
              step={1}
              type="number"
              {...field}
            />
          )}
          rules={{ required: true, min: 1 }}
        />
        <div className="invalid-feedback">Invalid value for memory</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}Gpu`}>
          GPUs
        </Label>
        <Controller
          control={control}
          name="gpu"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.gpu && "is-invalid")}
              id={`${idPrefix}Gpu`}
              min={0}
              step={1}
              type="number"
              {...field}
            />
          )}
          rules={{ required: true, min: 0 }}
        />
        <div className="invalid-feedback">Invalid value for GPUs</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}DefaultStorage`}>
          Default disk (GB)
        </Label>
        <Controller
          control={control}
          name="default_storage"
          render={({ field }) => (
            <Input
              className={cx(
                "form-control",
                errors.default_storage && "is-invalid",
              )}
              id={`${idPrefix}DefaultStorage`}
              min={1}
              step={1}
              type="number"
              {...field}
            />
          )}
          rules={{ required: true, min: 1 }}
        />
        <div className="invalid-feedback">
          Invalid value for the default disk
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${idPrefix}MaxStorage`}>
          Max disk (GB)
        </Label>
        <Controller
          control={control}
          name="max_storage"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.max_storage && "is-invalid")}
              id={`${idPrefix}MaxStorage`}
              min={1}
              step={1}
              type="number"
              {...field}
            />
          )}
          rules={{
            required: true,
            min: 1,
            validate: (value, formValues) =>
              Number(value) >= Number(formValues.default_storage),
          }}
        />
        <div className="invalid-feedback">
          The max disk must be at least as large as the default disk
        </div>
      </div>
    </>
  );
}
