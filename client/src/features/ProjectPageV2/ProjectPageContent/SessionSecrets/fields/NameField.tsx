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
import { Controller, type FieldValues } from "react-hook-form";
import { Input, Label } from "reactstrap";

import type { SessionSecretFormFieldProps } from "./fields.types";

type NameFieldProps<T extends FieldValues> = SessionSecretFormFieldProps<T>;

export default function NameField<T extends FieldValues>({
  control,
  errors,
  name,
}: NameFieldProps<T>) {
  const fieldId = `session-secret-${name}`;
  return (
    <div className="mb-3">
      <Label for={fieldId}>Name</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            className={cx(errors.name && "is-invalid")}
            id={fieldId}
            innerRef={ref}
            placeholder="API Token"
            type="text"
            {...rest}
          />
        )}
      />
      <div className="invalid-feedback">
        {errors.name?.message ? <>{errors.name?.message}</> : <>Invalid name</>}
      </div>
    </div>
  );
}
