import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import {
  DatabaseLock,
  FileEarmarkText,
  Pencil,
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
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import LogsModal from "~/features/logsDisplay/LogsModal";
import {
  Deposit,
  useGetDepositsByDepositIdLogsQuery,
} from "../api/data-connectors.api";
import { useDeleteDepositsByDepositIdMutation } from "../api/data-connectors.enhanced-api";
import DepositEditModal from "./DepositEditModal";
import DepositFinalizationModal from "./DepositFinalizationModal";

interface DepositActionsProps {
  deposit: Deposit;
  toggleDepositView?: () => void;
}
export default function DepositActions({
  deposit,
  toggleDepositView,
}: DepositActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toggleEditModalOpen = useCallback(() => {
    setIsEditModalOpen((open) => !open);
  }, []);

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
    ...(deposit.status === "upload_complete"
      ? [
          {
            key: "deposit-finalize-button",
            onClick: toggleFinalizationModalOpen,
            content: (
              <>
                <DatabaseLock className={cx("me-1", "bi")} />
                Finalize
              </>
            ),
          },
        ]
      : []),
    ...(deposit.status === "failed"
      ? [
          {
            key: "deposit-edit-button",
            onClick: toggleEditModalOpen,
            content: (
              <>
                <Pencil className={cx("me-1", "bi")} />
                Edit
              </>
            ),
          },
        ]
      : []),
    ...[
      {
        key: "deposit-show-logs-button",
        onClick: toggleLogsModalOpen,
        content: (
          <>
            <FileEarmarkText className={cx("bi", "me-1")} />
            Show logs
          </>
        ),
      },
    ],
    ...(deposit.status === "in_progress"
      ? [
          {
            key: "deposit-edit-button",
            onClick: toggleEditModalOpen,
            content: (
              <>
                <Pencil className={cx("me-1", "bi")} />
                Edit
              </>
            ),
          },
        ]
      : []),
    ...[
      {
        key: "deposit-delete-button",
        onClick: toggleDeleteModalOpen,
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

      <DepositEditModal
        deposit={deposit}
        isOpen={isEditModalOpen}
        setOpen={setIsEditModalOpen}
      />

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
    useDeleteDepositsByDepositIdMutation();

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
            disabled={isLoading}
            value={typedName}
            onChange={onChange}
          />
          {error && (
            <RtkOrDataServicesError
              className={cx("mb-0", "mt-3")}
              error={error}
            />
          )}
        </>
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
              Deleting deposit...
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
  const query = useGetDepositsByDepositIdLogsQuery(
    deposit.id ? { depositId: deposit.id } : skipToken
  );

  return (
    <LogsModal
      isOpen={isOpen}
      name={deposit.id ?? "deposit-logs"}
      query={query}
      title={
        <>
          <FileEarmarkText className={cx("bi", "me-1")} /> Deposit logs
        </>
      }
      toggle={toggleModal}
    />
  );
}
