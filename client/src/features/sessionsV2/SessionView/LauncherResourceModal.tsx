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
import { useCallback, useMemo, type ReactNode } from "react";
import { CheckLg, ChevronDown, XLg } from "react-bootstrap-icons";
import Select, {
  components,
  type ClassNamesConfig,
  type GroupBase,
  type SelectComponentsConfig,
  type SingleValue,
} from "react-select";
import { Button, ModalBody, ModalFooter, ModalHeader, Table } from "reactstrap";

import { SuccessAlert } from "../../../components/Alert";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
  getLauncherChangeEffectMessage,
} from "../session.utils";
import type { AccessPolicyOption } from "./launcherResources.constants";

import selectStyles from "../components/SessionForm/Select.module.scss";
import styles from "./LauncherResource.module.scss";

interface LauncherResourceModalProps {
  children: ReactNode;
  dataCy: string;
  description: string;
  icon: ReactNode;
  isDirty: boolean;
  isOpen: boolean;
  isSaving?: boolean;
  isSuccess?: boolean;
  onSave: () => void;
  successContent?: ReactNode;
  title: string;
  toggle: () => void;
}

export default function LauncherResourceModal({
  children,
  dataCy,
  description,
  icon,
  isDirty,
  isOpen,
  isSaving = false,
  isSuccess = false,
  onSave,
  successContent,
  title,
  toggle,
}: LauncherResourceModalProps) {
  return (
    <ScrollableModal
      backdrop="static"
      centered
      data-cy={dataCy}
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        {icon}
        {title}
      </ModalHeader>
      <ModalBody>
        {isSuccess ? (
          successContent
        ) : (
          <>
            <p className="mb-3">{description}</p>
            {children}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="close-cancel-button"
          onClick={toggle}
        >
          <XLg className={cx("bi", "me-1")} />
          {isSuccess ? "Close" : "Cancel"}
        </Button>
        {!isSuccess && (
          <Button
            color="primary"
            data-cy="save-configuration-button"
            disabled={isSaving || !isDirty}
            onClick={onSave}
            type="button"
          >
            <CheckLg className={cx("bi", "me-1")} />
            Save configuration
          </Button>
        )}
      </ModalFooter>
    </ScrollableModal>
  );
}

export function LauncherResourceUpdateConfirmation({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const launcherCategory = getLauncherCategory(launcher);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);
  return (
    <div data-cy="session-launcher-update-success">
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="fw-bold">
          {launcherDefinition.text.display} launcher updated successfully!
        </p>
        <p className="mb-0" data-cy="launcher-change-effect">
          {getLauncherChangeEffectMessage(launcherCategory)}
        </p>
      </SuccessAlert>
    </div>
  );
}

interface LauncherResourceTableProps {
  children: ReactNode;
  columnWidths?: readonly string[];
  dataCy: string;
  headers: string[];
}

export function LauncherResourceTable({
  children,
  columnWidths,
  dataCy,
  headers,
}: LauncherResourceTableProps) {
  return (
    <Table
      className={cx("mb-0", "w-100", styles.ResourceTable)}
      data-cy={dataCy}
      style={{ tableLayout: "fixed" }}
    >
      {columnWidths && (
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={headers[index] ?? index} style={{ width }} />
          ))}
        </colgroup>
      )}
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              scope="col"
              className={cx("text-muted", "fw-medium")}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  );
}

interface AccessPolicySelectProps {
  ariaLabel: string;
  dataCy?: string;
  disabled?: boolean;
  disabledValues?: readonly AccessPolicyOption["value"][];
  inputId?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (newValue?: AccessPolicyOption["value"]) => void;
  options: readonly AccessPolicyOption[];
  value: AccessPolicyOption["value"];
}

export function AccessPolicySelect({
  ariaLabel,
  dataCy,
  disabled,
  disabledValues,
  inputId,
  name,
  onBlur,
  onChange: onChange_,
  options,
  value: value_,
}: AccessPolicySelectProps) {
  const value = useMemo(
    () => options.find((option) => option.value === value_) ?? null,
    [options, value_],
  );

  const onChange = useCallback(
    (newValue: SingleValue<AccessPolicyOption>) => {
      if (newValue) {
        onChange_?.(newValue.value);
      }
    },
    [onChange_],
  );

  const isOptionDisabled = useCallback(
    (option: AccessPolicyOption) =>
      disabledValues?.includes(option.value) ?? false,
    [disabledValues],
  );

  return (
    <div data-cy={dataCy}>
      <Select
        aria-label={ariaLabel}
        classNames={selectClassNames}
        components={selectComponents}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        inputId={inputId}
        isClearable={false}
        isDisabled={disabled}
        isOptionDisabled={isOptionDisabled}
        isSearchable={false}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        options={options}
        unstyled
        value={value}
      />
    </div>
  );
}

const selectClassNames: ClassNamesConfig<AccessPolicyOption, false> = {
  control: ({ menuIsOpen }) =>
    cx(menuIsOpen ? "rounded-top" : "rounded", "border", selectStyles.control),
  dropdownIndicator: () => cx("pe-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border"),
  menuList: () => cx("d-grid"),
  menuPortal: () => styles.menuPortal,
  option: ({ isFocused, isSelected, isDisabled }) =>
    cx(
      "px-3",
      "py-2",
      isDisabled && "text-secondary",
      selectStyles.option,
      isDisabled && selectStyles.optionIsDisabled,
      isFocused && !isDisabled && selectStyles.optionIsFocused,
      !isFocused && isSelected && !isDisabled && selectStyles.optionIsSelected,
    ),
  singleValue: () => cx("px-3"),
};

const selectComponents: SelectComponentsConfig<
  AccessPolicyOption,
  false,
  GroupBase<AccessPolicyOption>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="bi" />
      </components.DropdownIndicator>
    );
  },
};
