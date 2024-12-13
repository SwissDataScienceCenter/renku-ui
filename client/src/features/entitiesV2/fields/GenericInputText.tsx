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
import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { FormText, Input, Label } from "reactstrap";
import type { GenericFormFieldProps } from "./forms.types";

export default function GenericInputText<T extends FieldValues>({
  className,
  control,
  dataCy,
  defaultErrorMessage,
  defaultValue,
  disabled,
  name,
  helpText,
  inputDataCy,
  inputId,
  label,
  rules,
  shouldUnregister, // eslint-disable-line spellcheck/spell-checker
}: GenericFormFieldProps<T>) {
  const inputHelpId = `${inputId}-help`;

  return (
    <div className={className} data-cy={dataCy}>
      {label && <Label for={inputId}>{label}</Label>}
      <Controller
        control={control}
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
        render={({ field: { ref, ...rest }, fieldState: { error } }) => (
          <>
            <Input
              aria-describedby={helpText ? inputHelpId : undefined}
              className={cx(error && "is-invalid")}
              data-cy={inputDataCy}
              id={inputId}
              type="text"
              innerRef={ref}
              {...rest}
            />
            <div className="invalid-feedback">
              {error?.message ?? defaultErrorMessage}
            </div>
          </>
        )}
        rules={rules}
        shouldUnregister={shouldUnregister} // eslint-disable-line spellcheck/spell-checker
      />
      {helpText && <FormText id={inputHelpId}>{helpText}</FormText>}
    </div>
  );
}
