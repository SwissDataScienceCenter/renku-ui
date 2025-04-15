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
import { ChevronDown, XLg } from "react-bootstrap-icons";
import {
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";
import Select, {
  type ClassNamesConfig,
  type GroupBase,
  type OptionProps,
  type SelectComponentsConfig,
  type SingleValue,
  type SingleValueProps,
  components,
} from "react-select";
import { Label } from "reactstrap";

import type { RepositoryWithProbe } from "../../../repositories/repositories.types";

import styles from "./Select.module.scss";

interface CodeRepositorySelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {
  repositoriesDetails: RepositoryWithProbe[];
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
    <div>
      <Label for="builder-environment-code-repository-select-input">
        Code repository
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
              data-cy="code-repository-select"
            >
              <CodeRepositorySelect
                name={controllerProps.name}
                defaultValue={defaultValue}
                options={repositoriesDetails}
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
        defaultValue={defaultValue as PathValue<T, Path<T>>}
      />
    </div>
  );
}

interface CodeRepositorySelectProps {
  name: string;

  defaultValue?: string;

  options: RepositoryWithProbe[];

  onChange?: (newValue?: string) => void;
  onBlur?: () => void;
  value: string;
  disabled?: boolean;
}

function CodeRepositorySelect({
  name,
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
    if (onChange_ != null && defaultValue_ && !value_) {
      onChange_(defaultValue_);
    }
  }, [defaultValue_, onChange_, value_]);

  return (
    <Select
      id="builder-environment-code-repository-select"
      inputId="builder-environment-code-repository-select-input"
      name={name}
      isClearable={false}
      isSearchable
      options={options}
      getOptionLabel={(option) => option.repositoryUrl}
      getOptionValue={(option) => option.repositoryUrl}
      unstyled
      isOptionDisabled={(option) => !option.probe}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      isDisabled={disabled}
      defaultValue={defaultValue}
      classNames={selectClassNames}
      components={selectComponents}
    />
  );
}

const selectClassNames: ClassNamesConfig<RepositoryWithProbe, false> = {
  control: ({ menuIsOpen }) =>
    cx(menuIsOpen ? "rounded-top" : "rounded", "border", styles.control),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border"),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected, isDisabled }) =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "column-gap-3",
      "justify-content-sm-between",
      "px-3",
      "py-2",
      isDisabled && "text-secondary",
      styles.option,
      isDisabled && styles.optionIsDisabled,
      isFocused && !isDisabled && styles.optionIsFocused,
      !isFocused && isSelected && !isDisabled && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  loadingMessage: () => cx("p-3"),
  singleValue: () => cx("px-3"),
};

interface OptionOrSingleValueContentProps {
  option: RepositoryWithProbe;
}

function OptionOrSingleValueContent({
  option,
}: OptionOrSingleValueContentProps) {
  return (
    <>
      <span>{option.repositoryUrl}</span>
      {!option.probe && (
        <span>
          <XLg className={cx("bi", "me-1")} />
          No public access
        </span>
      )}
    </>
  );
}

const selectComponents: SelectComponentsConfig<
  RepositoryWithProbe,
  false,
  GroupBase<RepositoryWithProbe>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="bi" />
      </components.DropdownIndicator>
    );
  },
  Option: (
    props: OptionProps<
      RepositoryWithProbe,
      false,
      GroupBase<RepositoryWithProbe>
    >
  ) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent option={data} />
      </components.Option>
    );
  },
  SingleValue: (
    props: SingleValueProps<
      RepositoryWithProbe,
      false,
      GroupBase<RepositoryWithProbe>
    >
  ) => {
    const { data } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent option={data} />
      </components.SingleValue>
    );
  },
};
