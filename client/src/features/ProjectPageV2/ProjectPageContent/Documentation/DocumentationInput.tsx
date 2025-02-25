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
  type FieldError,
  type FieldValues,
  type Path,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { FormGroup, FormText, Input, Label } from "reactstrap";

import {
  ErrorLabel,
  InputLabel,
} from "../../../../components/formlabels/FormLabels";

interface DocumentationInputProps<T extends FieldValues> {
  control: Control<T>;
  error?: FieldError;
  value: string;
  help?: string | React.ReactNode;
  label?: string;
  name: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}

function DocumentationInput<T extends FieldValues>(
  props: DocumentationInputProps<T>
) {
  const value = props.value;
  return (
    <div>
      <FormGroup className="field-group">
        <div className={cx("pb-2", props.label == null && "mb-4")}>
          {props.label && (
            <Label htmlFor={props.name} required={props.required ?? false}>
              <InputLabel
                text={props.label}
                isRequired={props.required ?? false}
              />
            </Label>
          )}
        </div>
        <div data-cy={`markdown-editor-${props.name}`}>
          <Controller
            control={props.control}
            name={props.name as Path<T>}
            render={({ field }) => (
              <Input
                id={`${props.name}-text-area`}
                data-cy={`text-area-${props.name}`}
                type="textarea"
                disabled={false}
                rows={value ? value.split("\n").length + 2 : 4}
                {...field}
              />
            )}
          />
        </div>
        {props.help && <FormText color="muted">{props.help}</FormText>}
        {props.error && (
          <ErrorLabel
            text={
              props.error.message ??
              "There is a problem with the text in this field."
            }
          />
        )}
      </FormGroup>
    </div>
  );
}

export default DocumentationInput;
