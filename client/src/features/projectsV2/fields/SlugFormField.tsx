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

export default function SlugFormField<T extends FieldValues>({
  control,
  entityName,
  errors,
  name,
}: GenericFormFieldProps<T>) {
  return (
    <div className="mb-3">
      <Label className="form-label" for={`${entityName}-slug`}>
        Slug
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            aria-describedby={`${entityName}SlugHelp`}
            className={cx("form-control", errors.slug && "is-invalid")}
            data-cy={`${entityName}-slug-input`}
            id={`${entityName}-slug`}
            type="text"
            {...field}
          />
        )}
        rules={{
          required: true,
          maxLength: 99,
          pattern:
            /^(?!.*\.git$|.*\.atom$|.*[-._][-._].*)[a-zA-Z0-9][a-zA-Z0-9\-_.]*$/,
        }}
      />
      <div className="invalid-feedback">
        Please provide a slug consisting of lowercase letters, numbers, and
        hyphens.
      </div>
      <FormText id={`${entityName}SlugHelp`} className="input-hint">
        A short, machine-readable identifier for the {entityName}, restricted to
        lowercase letters, numbers, and hyphens.{" "}
        {entityName === "project" && (
          <b>Cannot be changed after project creation.</b>
        )}
      </FormText>
    </div>
  );
}
