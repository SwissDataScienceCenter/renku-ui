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
import { FormText, Input, Label } from "reactstrap";

import type { SessionSecretFormFieldProps } from "./fields.types";

type FilenameFieldProps<T extends FieldValues> = SessionSecretFormFieldProps<T>;

export default function FilenameField<T extends FieldValues>({
  control,
  errors,
  name,
}: FilenameFieldProps<T>) {
  const fieldId = `session-secret-${name}`;
  return (
    <div className="mb-3">
      <Label for={fieldId}>Filename</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            aria-describedby="add-session-secret-filename-help"
            className={cx(errors.filename && "is-invalid")}
            id={fieldId}
            innerRef={ref}
            placeholder="api_token"
            type="text"
            {...rest}
          />
        )}
        rules={{ required: "Please provide a filename" }}
      />
      <div className="invalid-feedback">
        {errors.filename?.message ? (
          <>{errors.filename?.message}</>
        ) : (
          <>Invalid filename</>
        )}
      </div>
      <FormText id="add-session-secret-filename-help" tag="div">
        This is the filename which will be used when mounting the secret inside
        sessions.
      </FormText>
    </div>
  );
}
