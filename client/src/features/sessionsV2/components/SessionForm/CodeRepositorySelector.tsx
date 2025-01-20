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
  type UseControllerProps,
} from "react-hook-form";
import Select, { type SingleValue } from "react-select";

import type { GetRepositoriesProbesResponse } from "../../../repositories/repositories.types";

interface CodeRepositorySelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {
  repositoriesDetails: GetRepositoriesProbesResponse;
}

export default function CodeRepositorySelector<T extends FieldValues>({
  repositoriesDetails,
  ...controllerProps
}: CodeRepositorySelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      controllerProps.defaultValue
        ? controllerProps.defaultValue
        : repositoriesDetails.find(({ probe }) => probe)?.repositoryUrl,
    [controllerProps.defaultValue, repositoriesDetails]
  );

  return (
    <Controller
      {...controllerProps}
      render={({
        field: { onBlur, onChange, value, disabled },
        fieldState: { error },
      }) => (
        <>
          <div
            className={cx(error && "is-invalid")}
            data-cy="code-repository-select"
          >
            <CodeRepositorySelect
              defaultValue={defaultValue}
              options={repositoriesDetails}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              disabled={disabled}
            />
          </div>
          <div className="invalid-feedback">
            {error?.message ? (
              <>{error.message}</>
            ) : (
              <>Please select a valid code repository.</>
            )}
          </div>
        </>
      )}
      rules={
        controllerProps.rules ?? {
          required: "Please select a code repository.",
        }
      }
    />
  );
}

interface CodeRepositorySelectProps {
  defaultValue?: string;

  options: GetRepositoriesProbesResponse;

  onChange?: (newValue?: string) => void;
  onBlur?: () => void;
  value: string;
  disabled?: boolean;
}

function CodeRepositorySelect({
  options,
  defaultValue: defaultValue_,
  onBlur,
  onChange: onChange_,
  value: value_,
  disabled,
}: CodeRepositorySelectProps) {
  const defaultValue = useMemo(
    () => options.find(({ repositoryUrl }) => repositoryUrl === defaultValue_),
    [defaultValue_, options]
  );
  const value = useMemo(
    () => options.find(({ repositoryUrl }) => repositoryUrl === value_),
    [options, value_]
  );

  const onChange = useCallback(
    (
      newValue: SingleValue<{
        repositoryUrl: string;
        probe: boolean;
      }>
    ) => {
      onChange_?.(newValue?.repositoryUrl);
    },
    [onChange_]
  );

  // We need to set the default value by hand here
  useEffect(() => {
    if (onChange_ != null && defaultValue_) {
      onChange_(defaultValue_);
    }
  }, [defaultValue_, onChange_]);

  return (
    <Select
      isClearable={false}
      isSearchable
      options={options}
      getOptionLabel={(option) => option.repositoryUrl}
      getOptionValue={(option) => option.repositoryUrl}
      // unstyled
      isOptionDisabled={(option) => !option.probe}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      isDisabled={disabled}
      defaultValue={defaultValue}
    />
  );
}
