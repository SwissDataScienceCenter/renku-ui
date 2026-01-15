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

import type { SessionSecretFormFieldProps } from "./fields.types";

interface FilenameFieldProps<T extends FieldValues>
  extends SessionSecretFormFieldProps<T> {
  secretsMountDirectory: string;
}

export default function FilenameField<T extends FieldValues>({
  control,
  errors,
  name,
  secretsMountDirectory,
}: FilenameFieldProps<T>) {
  const fieldId = `session-secret-${name}`;
  const fieldHelpId = `${fieldId}-help`;

  const watch = useWatch({ control, name });
  const fullPath = watch
    ? `${secretsMountDirectory}/${watch}`
    : `${secretsMountDirectory}/<filename>`;

  return (
    <div className="mb-3">
      <Label for={fieldId}>Filename</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            aria-describedby={fieldHelpId}
            className={cx(errors.filename && "is-invalid")}
            data-cy="add-session-secret-filename-input"
            id={fieldId}
            innerRef={ref}
            placeholder="Name of the file, e.g., api_token.txt"
            type="text"
            {...rest}
          />
        )}
        rules={{
          required: "Please provide a filename",
          pattern: {
            value: /^[a-zA-Z0-9_\-.]+$/,
            message:
              'A valid filename must consist of alphanumeric characters, "-", "_" or "."',
          },
        }}
      />
      <div className="invalid-feedback">
        {errors.filename?.message ? (
          <>{errors.filename?.message}</>
        ) : (
          <>Invalid filename</>
        )}
      </div>
      <FormText id={fieldHelpId} tag="div">
        <p className="mb-0">
          This is the filename which will be used when mounting the secret
          inside sessions.
        </p>
        <p className="mb-0">
          The secret will be populated at:{" "}
          <code className={cx("bg-secondary-subtle", "p-1")}>{fullPath}</code>.
        </p>
      </FormText>
    </div>
  );
}
