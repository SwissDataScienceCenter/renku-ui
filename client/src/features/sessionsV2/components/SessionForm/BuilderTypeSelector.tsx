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
import { useCallback, useEffect, useMemo } from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";
import Select, { type SingleValue } from "react-select";
import { Label } from "reactstrap";

/* eslint-disable spellcheck/spell-checker */
const BUILDER_TYPES = ["Python (conda)"] as const;
/* eslint-enable spellcheck/spell-checker */

interface BuilderTypeSelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {}

export default function BuilderTypeSelector<T extends FieldValues>({
  ...controllerProps
}: BuilderTypeSelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      controllerProps.defaultValue
        ? controllerProps.defaultValue
        : BUILDER_TYPES[0],
    [controllerProps.defaultValue]
  );

  return (
    <div>
      <Label for="builder-environment-type-select-input">
        Environment type
      </Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div
              className={cx(error && "is-invalid")}
              data-cy="environment-type-select"
            >
              <BuilderTypeSelect
                name={controllerProps.name}
                defaultValue={defaultValue}
                options={BUILDER_TYPES}
                onBlur={onBlur}
                onChange={onChange}
                value={value ?? ""}
                disabled={disabled}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid environment type.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select an environment type.",
          }
        }
        defaultValue={defaultValue as PathValue<T, Path<T>>}
      />
    </div>
  );
}

interface BuilderTypeSelectProps {
  name: string;

  defaultValue?: string;

  options: readonly string[];

  onChange?: (newValue?: string) => void;
  onBlur?: () => void;
  value: string;
  disabled?: boolean;
}

function BuilderTypeSelect({
  name,
  options,
  defaultValue,
  onBlur,
  onChange: onChange_,
  disabled,
  value,
}: BuilderTypeSelectProps) {
  const onChange = useCallback(
    (newValue: SingleValue<{ value: string }>) => {
      onChange_?.(newValue?.value);
    },
    [onChange_]
  );

  // We need to set the default value by hand here
  useEffect(() => {
    if (onChange_ != null && defaultValue) {
      onChange_(defaultValue);
    }
  }, [defaultValue, onChange_]);

  return (
    <Select
      id="builder-environment-type-select"
      inputId="builder-environment-type-select-input"
      name={name}
      isClearable={false}
      isSearchable
      options={options.map((value) => ({ value }))}
      getOptionLabel={({ value }) => value}
      getOptionValue={({ value }) => value}
      // unstyled
      onChange={onChange}
      onBlur={onBlur}
      value={{ value }}
      isDisabled={disabled}
      defaultValue={defaultValue ? { value: defaultValue } : undefined}
    />
  );
}
