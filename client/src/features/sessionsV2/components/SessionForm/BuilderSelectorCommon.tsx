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
import { ChevronDown } from "react-bootstrap-icons";
import Select, {
  components,
  type ClassNamesConfig,
  type GroupBase,
  type OptionProps,
  type SelectComponentsConfig,
  type SingleValue,
} from "react-select";
import { BUILDER_TYPES } from "../../session.constants";
import type { BuilderSelectorOption } from "../../sessionsV2.types";

import styles from "./Select.module.scss";

interface BuilderSelectorCommonProps {
  defaultValue?: BuilderSelectorOption | undefined;
  disabled?: boolean;
  name: string;
  options: readonly BuilderSelectorOption[];
  value: string;
  onBlur?: () => void;
  onChange?: (newValue?: string) => void;
}

export default function BuilderSelectorCommon({
  defaultValue,
  disabled,
  name,
  options,
  value: value_,
  onBlur,
  onChange: onChange_,
}: BuilderSelectorCommonProps) {
  const value = useMemo(
    () => BUILDER_TYPES.find(({ value }) => value === value_) ?? defaultValue,
    [defaultValue, value_]
  );

  const onChange = useCallback(
    (newValue: SingleValue<BuilderSelectorOption>) => {
      onChange_?.(newValue?.value);
    },
    [onChange_]
  );

  // We need to set the default value by hand here
  useEffect(() => {
    if (onChange_ != null && defaultValue) {
      onChange_(defaultValue.value);
    }
  }, [defaultValue, onChange_]);

  return (
    <Select
      id="builder-environment-type-select"
      inputId="builder-environment-type-select-input"
      name={name}
      isClearable={false}
      isSearchable
      options={options}
      getOptionLabel={({ label }) => label}
      getOptionValue={({ value }) => value}
      unstyled
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

const selectClassNames: ClassNamesConfig<BuilderSelectorOption, false> = {
  control: ({ menuIsOpen }) =>
    cx(menuIsOpen ? "rounded-top" : "rounded", "border", styles.control),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border"),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected, isDisabled }) =>
    cx(
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

const selectComponents: SelectComponentsConfig<
  BuilderSelectorOption,
  false,
  GroupBase<BuilderSelectorOption>
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
      BuilderSelectorOption,
      false,
      GroupBase<BuilderSelectorOption>
    >
  ) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className="fw-bold">{data.label}</div>
        {data.description && <div>{data.description}</div>}
      </components.Option>
    );
  },
};
