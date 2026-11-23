/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import Select, {
  components,
  type ClassNamesConfig,
  type DropdownIndicatorProps,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type SelectComponentsConfig,
} from "react-select";

import type { BuilderSelectorOption } from "../../sessionsV2.types";

import styles from "./Select.module.scss";

interface BuilderMultiSelectorCommonProps {
  disabled?: boolean;
  id: string;
  inputId: string;
  name: string;
  options: readonly BuilderSelectorOption[];
  placeholder?: string;
  value: readonly string[];
  onBlur?: () => void;
  onChange?: (newValue: string[]) => void;
}

export default function BuilderMultiSelectorCommon({
  disabled,
  id,
  inputId,
  name,
  options,
  placeholder,
  value: value_,
  onBlur,
  onChange: onChange_,
}: BuilderMultiSelectorCommonProps) {
  const value = useMemo(
    () =>
      value_.map(
        (item) =>
          options.find((option) => option.value === item) ?? {
            label: item,
            value: item,
          },
      ),
    [options, value_],
  );

  const onChange = useCallback(
    (next: MultiValue<BuilderSelectorOption>) => {
      onChange_?.(next.map((option) => option.value));
    },
    [onChange_],
  );

  return (
    <Select
      classNames={selectClassNames}
      closeMenuOnSelect={false}
      components={selectComponents}
      getOptionLabel={({ label }) => label}
      getOptionValue={({ value: optionValue }) => optionValue}
      hideSelectedOptions={false}
      id={id}
      inputId={inputId}
      isClearable={false}
      isDisabled={disabled}
      isMulti
      isSearchable={false}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      unstyled
      value={value}
    />
  );
}

const selectClassNames: ClassNamesConfig<BuilderSelectorOption, true> = {
  control: () => cx("rounded", "border", "bg-white", styles.control),
  dropdownIndicator: () => "px-3",
  menu: () =>
    cx("bg-white", "rounded-bottom", "border", "shadow-sm", styles.zDropdown),
  menuList: () => "py-1",
  multiValue: () =>
    cx(
      "badge",
      "bg-light",
      "border",
      "border-secondary",
      "text-black",
      "my-1",
      "mx-1",
      "d-flex",
      "align-items-center",
      "gap-2",
      "fs-6",
      "p-1",
    ),
  multiValueLabel: () => cx("text-black", "fw-normal", "small"),
  multiValueRemove: () =>
    cx("text-secondary", "rounded-pill", "border", "border-secondary", "small"),
  option: ({ isFocused, isSelected, isDisabled }) =>
    cx(
      "px-3",
      "py-2",
      styles.option,
      isDisabled && styles.optionIsDisabled,
      isFocused && !isDisabled && styles.optionIsFocused,
      !isFocused && isSelected && !isDisabled && styles.optionIsSelected,
    ),
  placeholder: () => cx("px-2", "text-muted"),
  valueContainer: () =>
    cx("d-flex", "flex-wrap", "align-items-center", "py-1", "ps-2"),
};

const selectComponents: SelectComponentsConfig<
  BuilderSelectorOption,
  true,
  GroupBase<BuilderSelectorOption>
> = {
  DropdownIndicator: (
    props: DropdownIndicatorProps<
      BuilderSelectorOption,
      true,
      GroupBase<BuilderSelectorOption>
    >,
  ) => {
    const Icon = props.selectProps.menuIsOpen ? ChevronUp : ChevronDown;
    return (
      <components.DropdownIndicator {...props}>
        <Icon className="bi" />
      </components.DropdownIndicator>
    );
  },
  Option: (
    props: OptionProps<
      BuilderSelectorOption,
      true,
      GroupBase<BuilderSelectorOption>
    >,
  ) => {
    const { data, isSelected } = props;
    return (
      <components.Option {...props}>
        <div className={cx("d-flex", "align-items-center", "gap-2")}>
          <input
            aria-hidden
            checked={isSelected}
            className={cx(
              "form-check-input",
              "mt-0",
              "pe-none",
              "flex-shrink-0",
            )}
            readOnly
            tabIndex={-1}
            type="checkbox"
          />
          <div className="flex-grow-1">
            <div className={cx("text-black")}>{data.label}</div>
            {data.description && (
              <div className={cx("small", "text-secondary")}>
                {data.description}
              </div>
            )}
          </div>
        </div>
      </components.Option>
    );
  },
};
