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
import { BoxArrowUpRight, ChevronDown, ChevronUp } from "react-bootstrap-icons";
import {
  useController,
  type Control,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import Select, {
  components,
  type ClassNamesConfig,
  type DropdownIndicatorProps,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type SelectComponentsConfig,
} from "react-select";
import { Label } from "reactstrap";

import { ExternalLink } from "~/components/LegacyExternalLinks.tsx";
import { NEW_DOCS_CONFIG_AI_AGENTS } from "~/utils/constants/NewDocs.ts";
import { CODING_AGENTS, type CodingAgentOption } from "../../session.constants";

import styles from "./Select.module.scss";

interface BuilderAiAgentsSelectorProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  control: Control<T>;
}

const EMPTY_PLACEHOLDER = "None - Add an agent";

export default function BuilderAiAgentsSelector<T extends FieldValues>({
  control,
  ...controllerProps
}: BuilderAiAgentsSelectorProps<T>) {
  const {
    field: { onBlur, onChange, value, disabled },
    fieldState: { error },
  } = useController({ control, ...controllerProps });

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? (value as string[]) : []),
    [value],
  );
  const options = useMemo(
    () => codingAgentOptions(selectedValues),
    [selectedValues],
  );
  const selected = useMemo(
    () =>
      selectedValues.map(
        (agent) =>
          options.find((option) => option.value === agent) ?? {
            label: agent,
            value: agent,
          },
      ),
    [options, selectedValues],
  );

  const handleChange = useCallback(
    (next: MultiValue<CodingAgentOption>) => {
      onChange(next.map((option) => option.value));
    },
    [onChange],
  );

  return (
    <div>
      <Label for="builder-coding-agents-select-input">
        Coding agents{" "}
        <span className={cx("small", "text-muted", "fw-normal")}>
          (Optional)
        </span>
        {" - "}
        <ExternalLink role="link" url={NEW_DOCS_CONFIG_AI_AGENTS}>
          Learn more
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </ExternalLink>
      </Label>
      <div className={cx(error && "is-invalid")} data-cy="coding-agents-select">
        <Select<CodingAgentOption, true>
          classNames={selectClassNames}
          closeMenuOnSelect={false}
          components={selectComponents}
          getOptionLabel={({ label }) => label}
          getOptionValue={({ value: optionValue }) => optionValue}
          hideSelectedOptions={false}
          id="builder-coding-agents-select"
          inputId="builder-coding-agents-select-input"
          isClearable={false}
          isDisabled={disabled}
          isMulti
          isSearchable={false}
          name={controllerProps.name}
          onBlur={onBlur}
          onChange={handleChange}
          options={options}
          placeholder={EMPTY_PLACEHOLDER}
          unstyled
          value={selected}
        />
      </div>
      {error?.message && (
        <div className="invalid-feedback d-block">{error.message}</div>
      )}
    </div>
  );
}

function codingAgentOptions(selected: readonly string[]): CodingAgentOption[] {
  const known = new Set(CODING_AGENTS.map((agent) => agent.value));
  const saved = selected
    .filter((agent) => !known.has(agent))
    .map((agent) => ({ label: agent, value: agent }));
  return [...CODING_AGENTS, ...saved];
}

const selectClassNames: ClassNamesConfig<CodingAgentOption, true> = {
  control: () => cx("rounded", "border", "bg-white", styles.control),
  dropdownIndicator: () => "px-3",
  menu: () =>
    cx("bg-white", "rounded-bottom", "border", "shadow-sm", styles.zDropdown),
  menuList: () => "py-1",
  multiValue: () =>
    cx("rounded-pill", "bg-primary-subtle", "text-primary", "mx-1", "my-1"),
  multiValueLabel: () => cx("text-primary", "ps-2", "py-1"),
  multiValueRemove: () => cx("text-primary", "px-2", "rounded-pill"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "px-3",
      "py-2",
      styles.codingAgentOption,
      (isFocused || isSelected) && "bg-primary-subtle",
    ),
  placeholder: () => cx("px-2", "text-secondary"),
  valueContainer: () =>
    cx("d-flex", "flex-wrap", "align-items-center", "py-1", "ps-2"),
};

const selectComponents: SelectComponentsConfig<
  CodingAgentOption,
  true,
  GroupBase<CodingAgentOption>
> = {
  DropdownIndicator: (
    props: DropdownIndicatorProps<
      CodingAgentOption,
      true,
      GroupBase<CodingAgentOption>
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
    props: OptionProps<CodingAgentOption, true, GroupBase<CodingAgentOption>>,
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
            <div className="fw-bold">{data.label}</div>
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
