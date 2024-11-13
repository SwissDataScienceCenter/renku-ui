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

export default function NameFormField<T extends FieldValues>({
  control,
  entityName,
  errors,
  helpText,
  name,
}: GenericFormFieldProps<T>) {
  return (
    <>
      <Label className="form-label" for={`${entityName}-name`}>
        Name
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            aria-describedby={`${entityName}-help`}
            className={cx("form-control", errors.name && "is-invalid")}
            data-cy={`${entityName}-name-input`}
            id={`${entityName}-name`}
            type="text"
            {...field}
          />
        )}
        rules={{ required: true, maxLength: 99 }}
      />
      <div className="invalid-feedback">Please provide a name</div>
      {helpText && typeof helpText === "string" && (
        <FormText id={`${entityName}-help`} className="input-hint">
          {helpText}
        </FormText>
      )}
      {helpText && typeof helpText !== "string" && <>{helpText}</>}
    </>
  );
}
