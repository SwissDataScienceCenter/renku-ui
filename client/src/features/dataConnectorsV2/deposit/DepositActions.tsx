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
import { DatabaseLock, FileEarmarkText, Trash } from "react-bootstrap-icons";
import { Button, ButtonGroup, DropdownItem, DropdownMenu } from "reactstrap";

import type { Deposit } from "../api/data-connectors.api";

interface DepositActionsProps {
  deposit: Deposit;
}
export default function DepositActions({ deposit }: DepositActionsProps) {
  const actions = [
    ...(deposit.status === "complete"
      ? [
          {
            key: "deposit-finalize-button",
            onClick: () => {},
            content: (
              <>
                <DatabaseLock className={cx("me-1", "bi")} />
                Finalize
              </>
            ),
          },
        ]
      : []),
    ...[
      {
        key: "deposit-show-logs-button",
        onClick: () => {},
        content: (
          <>
            <FileEarmarkText className={cx("bi", "me-1")} />
            Show logs
          </>
        ),
      },
      {
        key: "deposit-delete-button",
        onClick: () => {},
        content: (
          <>
            <Trash className={cx("bi", "me-1")} />
            Delete
          </>
        ),
      },
    ],
  ];

  return (
    <DropdownButton
      dataCy="deposit-actions-dropdown"
      primaryButtonContent={actions[0].content}
      primaryButtonOnclick={actions[0].onClick}
      size="sm"
    >
      {actions.slice(1).map(({ key, onClick, content }) => (
        <DropdownItem key={key} data-cy={key} onClick={onClick}>
          {content}
        </DropdownItem>
      ))}
    </DropdownButton>
  );
}

interface DropdownButtonProps {
  children?: React.ReactNode;
  color?: string;
  dataCy?: string;
  primaryButtonContent: React.ReactNode;
  primaryButtonOnclick: () => void;
  size?: "sm" | "lg";
}
function DropdownButton({
  children,
  color = "outline-primary",
  dataCy = "dropdown-button",
  primaryButtonContent,
  primaryButtonOnclick,
  size,
}: DropdownButtonProps) {
  return (
    <ButtonGroup data-cy={dataCy}>
      <Button
        color={color}
        data-cy={`${dataCy}-main`}
        size={size}
        onClick={primaryButtonOnclick}
      >
        {primaryButtonContent}
      </Button>

      <Button
        aria-expanded="false"
        className={cx("dropdown-toggle", "dropdown-toggle-split")}
        color={color}
        data-bs-toggle="dropdown"
        data-cy={`${dataCy}-toggle`}
        size={size}
      >
        <span className="visually-hidden">Toggle Dropdown</span>
      </Button>

      <DropdownMenu tag="ul" data-cy={`${dataCy}-menu`}>
        {children}
      </DropdownMenu>
    </ButtonGroup>
  );
}
