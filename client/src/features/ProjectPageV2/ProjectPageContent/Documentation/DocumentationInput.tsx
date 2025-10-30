/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { FormGroup, FormText, Input, Label } from "reactstrap";

import {
  ErrorLabel,
  InputLabel,
} from "../../../../components/formlabels/FormLabels";

interface DocumentationInputProps<T extends FieldValues> {
  control: Control<T>;
  help?: string | React.ReactNode;
  label?: string;
  name: string;
  required?: boolean;
}

function DocumentationInput<T extends FieldValues>({
  control,
  help,
  label,
  name,
  required,
}: DocumentationInputProps<T>) {
  const { error } = control.getFieldState(name as Path<T>);
  return (
    <div>
      <FormGroup className="field-group">
        {label && (
          <div className={cx("pb-2", label == null && "mb-4")}>
            <Label htmlFor={name} required={required ?? false}>
              <InputLabel text={label} isRequired={required ?? false} />
            </Label>
          </div>
        )}
        <div data-cy={`markdown-editor-${name}`}>
          <Controller
            control={control}
            name={name as Path<T>}
            render={({ field }) => (
              <Input
                id={`${name}-text-area`}
                data-cy={`text-area-${name}`}
                type="textarea"
                disabled={false}
                rows={field.value ? field.value.split("\n").length + 2 : 4}
                {...field}
              />
            )}
          />
        </div>
        {help && <FormText color="muted">{help}</FormText>}
        {error && (
          <ErrorLabel
            text={
              error.message ?? "There is a problem with the text in this field."
            }
          />
        )}
      </FormGroup>
    </div>
  );
}

export default DocumentationInput;
