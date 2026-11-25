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

import { Controller, type FieldValues } from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";

import type { SessionSecretFormFieldProps } from "./fields.types";

interface SavedSecretNameFieldProps<
  T extends FieldValues,
> extends SessionSecretFormFieldProps<T> {
  formId?: string;
  placeholder?: string;
}

/** Name of the user secret that is created when a new value is saved. */
export default function SavedSecretNameField<T extends FieldValues>({
  control,
  formId,
  name,
  placeholder,
}: SavedSecretNameFieldProps<T>) {
  const fieldIdSuffix = `saved-secret-${name}`;
  const fieldId = formId ? `${formId}-${fieldIdSuffix}` : fieldIdSuffix;

  return (
    <div className="mb-3">
      <Label for={fieldId}>Name</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            data-cy="saved-secret-name-input"
            id={fieldId}
            innerRef={ref}
            placeholder={placeholder}
            type="text"
            {...rest}
          />
        )}
      />
      <FormText>
        The name in your user secrets. You can reuse this secret in other
        projects.
      </FormText>
    </div>
  );
}
