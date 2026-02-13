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
import { useCallback, useEffect, useState } from "react";
import {
  DatabaseLock,
  FileEarmarkText,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import { Loader } from "~/components/Loader";
import { Deposit } from "../api/data-connectors.api";
import { useDeleteDepositByDepositIdMutation } from "../api/data-connectors.enhanced-api";

interface DepositActionsProps {
  deposit: Deposit;
  toggleDepositView?: () => void;
}
export default function DepositActions({
  deposit,
  toggleDepositView,
}: DepositActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toggleDeleteModalOpen = useCallback(() => {
    setIsDeleteModalOpen((open) => !open);
  }, []);
  const onDelete = useCallback(() => {
    if (toggleDepositView) toggleDepositView();
    setIsDeleteModalOpen(false);
  }, [toggleDepositView]);

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
        onClick: () => toggleDeleteModalOpen(),
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
    <>
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

      <DepositRemovalModal
        deposit={deposit}
        isOpen={isDeleteModalOpen}
        onDelete={onDelete}
        toggleModal={toggleDeleteModalOpen}
      />
    </>
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

interface DepositRemovalModalProps {
  deposit: Deposit;
  isOpen: boolean;
  onDelete: () => void;
  toggleModal: () => void;
}

function DepositRemovalModal({
  deposit,
  onDelete,
  toggleModal,
  isOpen,
}: DepositRemovalModalProps) {
  const [deleteDeposit, { error, isLoading, isSuccess }] =
    useDeleteDepositByDepositIdMutation();

  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  useEffect(() => {
    if (isSuccess && isOpen) {
      onDelete();
    }
  }, [isOpen, isSuccess, onDelete]);

  const onDeleteDeposit = useCallback(() => {
    deleteDeposit({
      depositId: deposit.id ?? "",
    });
  }, [deleteDeposit, deposit.id]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" tag="h2" toggle={toggleModal}>
        Delete deposit
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <p>
              Are you sure you want to delete this deposit? This action cannot
              be undone.
            </p>
            <p>
              Please type the deposit name <strong>{deposit.name}</strong> to
              confirm.
            </p>
            <Input
              data-cy="delete-confirmation-input"
              value={typedName}
              onChange={onChange}
            />
            {error && (
              <RtkOrNotebooksError
                className={cx("mb-0", "mt-3")}
                error={error}
              />
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>

        <Button
          color="danger"
          disabled={isLoading || typedName !== deposit.name.trim()}
          data-cy="delete-deposit-modal-button"
          type="submit"
          onClick={onDeleteDeposit}
        >
          {isLoading ? (
            <>
              <Loader className="me-1" inline size={16} />
              Delete deposit
            </>
          ) : (
            <>
              <Trash className={cx("bi", "me-1")} />
              Delete deposit
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
