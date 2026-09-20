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
import type { ReactNode } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import {
  Button,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  type InputProps,
} from "reactstrap";

import ScrollableModal from "../../../components/modal/ScrollableModal";
import type { AccessPolicyOption } from "./launcherResources.constants";

interface LauncherResourceModalProps {
  children: ReactNode;
  dataCy: string;
  description: string;
  icon: ReactNode;
  isDirty: boolean;
  isOpen: boolean;
  isSaving?: boolean;
  onSave: () => void;
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
  onSave,
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
        <p className="mb-3">{description}</p>
        {children}
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="close-cancel-button"
          onClick={toggle}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
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
      </ModalFooter>
    </ScrollableModal>
  );
}

interface LauncherResourceTableProps {
  children: ReactNode;
  dataCy: string;
  headers: string[];
}

export function LauncherResourceTable({
  children,
  dataCy,
  headers,
}: LauncherResourceTableProps) {
  return (
    <Table className="mb-0" data-cy={dataCy} responsive size="sm">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} scope="col">
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
