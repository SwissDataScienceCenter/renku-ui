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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRepeat,
  DatabaseLock,
  FileEarmarkText,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  DropdownItem,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import DropdownButton from "~/components/buttons/DropdownButton";
import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import { Loader } from "~/components/Loader";
import {
  Deposit,
  useGetDepositByDepositIdQuery,
} from "../api/data-connectors.api";
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

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const toggleLogsModalOpen = useCallback(() => {
    setIsLogsModalOpen((open) => !open);
  }, []);

  const [isFinalizationModalOpen, setIsFinalizationModalOpen] = useState(false);
  const toggleFinalizationModalOpen = useCallback(() => {
    setIsFinalizationModalOpen((open) => !open);
  }, []);

  const actions = [
    ...(deposit.status === "complete"
      ? [
          {
            key: "deposit-finalize-button",
            onClick: () => toggleFinalizationModalOpen(),
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
        onClick: () => toggleLogsModalOpen(),
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

      <DepositLogsModal
        deposit={deposit}
        isOpen={isLogsModalOpen}
        toggleModal={toggleLogsModalOpen}
      />

      <DepositFinalizationModal
        deposit={deposit}
        isOpen={isFinalizationModalOpen}
        toggleModal={toggleFinalizationModalOpen}
      />
    </>
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
      setTypedName(e.target.value);
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
        <Trash className={cx("bi", "me-1")} />
        Delete deposit
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <p>
              Are you sure you want to delete this deposit?{" "}
              <strong>This action cannot be undone.</strong>
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
          disabled={isLoading || typedName.trim() !== deposit.name.trim()}
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

interface RefreshLogsParagraphProps {
  refetch: () => void;
}
function RefreshLogsParagraph({ refetch }: RefreshLogsParagraphProps) {
  return (
    <>
      <p>
        You can try to{" "}
        <Button color="primary" onClick={refetch} size="sm">
          Refresh logs
        </Button>{" "}
        .
      </p>
    </>
  );
}

interface DepositLogsModalProps {
  deposit: Deposit;
  isOpen: boolean;
  toggleModal: () => void;
}
function DepositLogsModal({
  deposit,
  toggleModal,
  isOpen,
}: DepositLogsModalProps) {
  const { data, error, refetch, isLoading } = useGetDepositByDepositIdQuery(
    deposit.id ? { depositId: deposit.id } : skipToken
  );

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader tag="h2" toggle={toggleModal}>
        <FileEarmarkText className={cx("bi", "me-1")} /> Deposit logs
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <>
            <p>There was an error fetching the deposit logs.</p>
            <RefreshLogsParagraph refetch={refetch} />
            <RtkOrNotebooksError error={error} />
          </>
        ) : !data ? (
          <>
            <p>No logs available for this deposit yet.</p>
            <RefreshLogsParagraph refetch={refetch} />
          </>
        ) : (
          <>
            <p>Deposit logs</p>
            <pre className="overflow-auto">{"LOGS HERE"}</pre>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button disabled={isLoading} color="outline-primary" onClick={refetch}>
          <ArrowRepeat className={cx("bi", "me-1")} />
          Refresh logs
        </Button>

        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface DepositFinalizationModalProps {
  deposit: Deposit;
  isOpen: boolean;
  toggleModal: () => void;
}
function DepositFinalizationModal({
  deposit,
  toggleModal,
  isOpen,
}: DepositFinalizationModalProps) {
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader tag="h2" toggle={toggleModal}>
        <DatabaseLock className={cx("bi", "me-1")} />
        Finalize deposit
      </ModalHeader>
      <ModalBody>
        <p>
          Finalize deposit <strong>{deposit.name}</strong>
        </p>
        <p>Deposit finalization is not implemented yet.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
