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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import {
  Controller,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";

import type { ResourceClassFormRemote } from "../adminComputeResources.utils";

const FORWARD_RESOURCE_VALUES_HELP =
  "When true, Amalthea forwards the resource class CPU, memory, and GPU values to FirecREST. When false, the HPC grid selects the resources."; // eslint-disable-line spellcheck/spell-checker

interface ResourceClassFirecrestFieldsProps<T extends FieldValues> {
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, ResourceClassFormRemote | undefined>;
}

export default function ResourceClassFirecrestFields<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourceClassFirecrestFieldsProps<T>) {
  const systemNameField = `${name}.systemName` as FieldPathByValue<T, string>;
  const partitionField = `${name}.partition` as FieldPathByValue<T, string>;
  const forwardResourceValuesField =
    `${name}.forwardResourceValues` as FieldPathByValue<T, boolean>;

  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for={`${formPrefix}RemoteSystemName`}>
          System name
          <span className={cx("small", "text-muted", "ms-2")}>(Optional)</span>
        </Label>
        <Controller
          control={control}
          name={systemNameField}
          render={({ field }) => (
            <Input
              id={`${formPrefix}RemoteSystemName`}
              placeholder='System name, e.g. "eiger"' // eslint-disable-line spellcheck/spell-checker
              type="text"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      </div>

      <div className="mb-3">
        <Label className="form-label" for={`${formPrefix}RemotePartition`}>
          Partition
          <span className={cx("small", "text-muted", "ms-2")}>(Optional)</span>
        </Label>
        <Controller
          control={control}
          name={partitionField}
          render={({ field }) => (
            <Input
              id={`${formPrefix}RemotePartition`}
              placeholder='SLURM partition, e.g. "normal"'
              type="text"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      </div>

      <div className="mb-3">
        <Controller
          control={control}
          name={forwardResourceValuesField}
          render={({ field }) => (
            <div className="form-check">
              <Input
                className="form-check-input"
                id={`${formPrefix}RemoteForwardResourceValues`}
                type="checkbox"
                checked={field.value}
                innerRef={field.ref}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
              <Label
                className={cx("form-check-label", "ms-2")}
                for={`${formPrefix}RemoteForwardResourceValues`}
              >
                Forward resource values
              </Label>
            </div>
          )}
        />
        <FormText>{FORWARD_RESOURCE_VALUES_HELP}</FormText>
      </div>
    </>
  );
}
