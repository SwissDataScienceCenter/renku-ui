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
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import Select, {
  components,
  type ClassNamesConfig,
  type GroupBase,
  type OptionProps,
  type SelectComponentsConfig,
  type SingleValue,
} from "react-select";

import styles from "~/features/sessionsV2/components/SessionForm/Select.module.scss";

export interface ProjectMemberRoleOption {
  label: string;
  value: string;
  description?: ReactNode;
}

export const GROUP_MEMBER_ROLE_OPTIONS = [
  {
    value: "viewer",
    label: "Viewer",
    description:
      "Can use the project, but cannot make changes to the project content.",
  },
  {
    value: "editor",
    label: "Editor",
    description:
      "Can add and remove project content. Cannot manage project membership or change visibility.",
  },
  {
    value: "owner",
    label: "Owner",
    description: "Can edit all project content and manage project membership.",
  },
] as readonly ProjectMemberRoleOption[];

interface ProjectMemberRoleProps {
  disabled?: boolean;
  id: string;
  inputId: string;
  name: string;
  value: string;
  onBlur?: () => void;
  onChange?: (newValue?: string) => void;
}

export default function ProjectMemberRoleSelect({
  disabled,
  id,
  inputId,
  name,
  value: value_,
  onBlur,
  onChange: onChange_,
}: ProjectMemberRoleProps) {
  const options = GROUP_MEMBER_ROLE_OPTIONS;
  const defaultValue = GROUP_MEMBER_ROLE_OPTIONS[0];
  const value = useMemo(
    () => options.find(({ value }) => value === value_) ?? defaultValue,
    [defaultValue, value_, options]
  );

  const onChange = useCallback(
    (newValue: SingleValue<ProjectMemberRoleOption>) => {
      onChange_?.(newValue?.value);
    },
    [onChange_]
  );

  // We need to set the default value by hand here
  useEffect(() => {
    if (onChange_ != null && defaultValue && !value_) {
      onChange_(defaultValue.value);
    }
  }, [defaultValue, onChange_, value_]);

  return (
    <Select
      id={id}
      inputId={inputId}
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

const selectClassNames: ClassNamesConfig<ProjectMemberRoleOption, false> = {
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
  ProjectMemberRoleOption,
  false,
  GroupBase<ProjectMemberRoleOption>
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
      ProjectMemberRoleOption,
      false,
      GroupBase<ProjectMemberRoleOption>
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
