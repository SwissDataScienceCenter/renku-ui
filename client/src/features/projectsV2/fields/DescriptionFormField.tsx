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

import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

import { FormText, Input, Label } from "reactstrap";
import type { GenericFormFieldProps } from "./formField.types";

export default function DescriptionFormField<T extends FieldValues>({
  control,
  entityName,
  errors,
  name,
}: GenericFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for={`${entityName}-description`}>
        Description
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            aria-describedby={`${entityName}DescriptionHelp`}
            className={cx("form-control", errors.description && "is-invalid")}
            data-cy={`${entityName}-description-input`}
            id={`${entityName}-description`}
            type="textarea"
            {...field}
          />
        )}
        rules={{ maxLength: 500, required: false }}
      />
      <FormText id={`${entityName}DescriptionHelp`} className="input-hint">
        A brief (at most 500 character) description of the {entityName}.
      </FormText>
      <div className="invalid-feedback">Please provide a description</div>
    </div>
  );
}
