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
import { Fragment, type ReactNode } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import {
  Button,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  type InputProps, Label, ButtonGroup,
} from "reactstrap";

import { SuccessAlert } from "../../../components/Alert";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
  getLauncherChangeEffectMessage,
} from "../session.utils";
import type { AccessPolicyOption } from "./launcherResources.constants";

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
      className={cx("mb-0", "w-100")}
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

type AccessPolicySelectProps<T extends string> = Omit<
  InputProps,
  "children" | "options" | "type"
> & {
  ariaLabel: string;
  disabledValues?: readonly T[];
  options: AccessPolicyOption<T>[];
};

export function AccessPolicySelect<T extends string>({
  ariaLabel,
  disabledValues,
  options,
  ...inputProps
}: AccessPolicySelectProps<T>) {
  return (
    <Input aria-label={ariaLabel} bsSize="sm" type="select" {...inputProps}>
      {options.map(({ label, value }) => (
        <option
          disabled={disabledValues?.includes(value)}
          key={value}
          value={value}
        >
          {label}
        </option>
      ))}
    </Input>
  );
}

interface AccessPolicyToggleProps<T extends string> {
  ariaLabel: string;
  dataCy: string;
  name: string;
  onBlur: InputProps["onBlur"];
  onChange: InputProps["onChange"];
  options: AccessPolicyOption<T>[];
  value: T;
}

export function AccessPolicyToggle<T extends string>({
                                                       ariaLabel,
                                                       dataCy,
                                                       name,
                                                       onBlur,
                                                       onChange,
                                                       options,
                                                       value,
                                                     }: AccessPolicyToggleProps<T>) {
  return (
    <ButtonGroup aria-label={ariaLabel} data-cy={dataCy} size="sm">
      {options.map((option) => {
        const id = `${dataCy}-${option.value}`;
        return (
          <Fragment key={option.value}>
            <Input
              checked={value === option.value}
              className="btn-check"
              id={id}
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              type="radio"
              value={option.value}
            />
            <Label
              className={cx("btn", "btn-outline-primary", "mb-0")}
              data-cy={id}
              for={id}
            >
              {option.label}
            </Label>
          </Fragment>
        );
      })}
    </ButtonGroup>
  );
}

