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
import { FormText, Label } from "reactstrap";

import { SECRETS_VALUE_LENGTH_LIMIT } from "../secrets.constants";
import type { UserSecretFormFieldProps } from "./fields.types";

type SecretValueFieldProps<T extends FieldValues> = UserSecretFormFieldProps<T>;

export default function SecretValueField<T extends FieldValues>({
  control,
  errors,
  formId,
  name,
}: SecretValueFieldProps<T>) {
  const fieldIdSuffix = `user-secret-${name}`;
  const fieldId = formId ? `${formId}-${fieldIdSuffix}` : fieldIdSuffix;
  const fieldHelpId = `${fieldId}-help`;

  return (
    <div className="mb-3">
      <Label for={fieldId}>Value</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            id={fieldId}
            aria-describedby={fieldHelpId}
            autoComplete="off one-time-code"
            className={cx("form-control", errors[name] && "is-invalid")}
            placeholder="A secret value..."
            rows={6}
            spellCheck={false}
            {...field}
          />
        )}
        rules={{
          required: "Please provide a value",
          maxLength: {
            value: SECRETS_VALUE_LENGTH_LIMIT,
            message: `Value cannot exceed ${SECRETS_VALUE_LENGTH_LIMIT} characters`,
          },
        }}
      />
      <div className="invalid-feedback">
        {errors[name]?.message ? (
          <>{errors[name]?.message}</>
        ) : (
          <>Invalid value</>
        )}
      </div>
      <FormText id={fieldHelpId} tag="div">
        Values are limited to 5000 characters.
      </FormText>
    </div>
  );
}
