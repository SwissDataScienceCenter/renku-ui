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
import { Controller, useWatch, type FieldValues } from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";

import { GenericProjectFormFieldProps } from "./formField.types";

type SecretsMountDirectoryFieldProps<T extends FieldValues> =
  GenericProjectFormFieldProps<T>;

export default function SecretsMountDirectoryField<T extends FieldValues>({
  control,
  errors,
  name,
}: SecretsMountDirectoryFieldProps<T>) {
  const fieldId = `project-${name}`;
  const fieldHelpId = `${fieldId}-help`;

  const watch = useWatch({ control, name });

  return (
    <div className="mb-3">
      <Label for={fieldId}>Secrets mount location</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            className={cx(errors.name && "is-invalid")}
            id={fieldId}
            innerRef={ref}
            placeholder="Secret name, e.g., API Token"
            type="text"
            {...rest}
          />
        )}
        rules={{
          required: "Please provide a location for the secrets",
        }}
      />
      <div className="invalid-feedback">
        {errors[name]?.message ? (
          <>{errors[name]?.message}</>
        ) : (
          <>Invalid location</>
        )}
      </div>
      <FormText id={fieldHelpId} tag="div">
        <p className="mb-0">
          This is the location which will be used when mounting secrets inside
          sessions.
        </p>
        {!watch.startsWith("/") && (
          <p>
            Note that this location will be relative to the &quot;working
            directory&quot;.
          </p>
        )}
      </FormText>
    </div>
  );
}
