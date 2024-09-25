/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { Lock, Pencil, Trash, XLg } from "react-bootstrap-icons";
import {
  Button,
  Col,
  DropdownItem,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { Loader } from "../../../components/Loader";
import DataConnectorModal from "./DataConnectorModal";
import type { DataConnectorRead } from "../../projectsV2/api/data-connectors.api";
import { useDeleteDataConnectorsByDataConnectorIdMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import DataConnectorCredentialsModal from "./DataConnectorCredentialsModal";
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";

interface DataConnectorDeleteModalProps {
  dataConnector: DataConnectorRead;
  isOpen: boolean;
  onDelete: () => void;
  toggleModal: () => void;
}
function DataConnectorDeleteModal({
  dataConnector,
  onDelete,
  toggleModal,
  isOpen,
}: DataConnectorDeleteModalProps) {
  const [deleteDataConnector, { isLoading, isSuccess }] =
    useDeleteDataConnectorsByDataConnectorIdMutation();

  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  useEffect(() => {
    if (isSuccess) {
      onDelete();
    }
  }, [isSuccess, onDelete]);
  const onDeleteDataCollector = () => {
    deleteDataConnector({
      dataConnectorId: dataConnector.id,
    });
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Delete data connector
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Are you sure you want to delete this data connector? It will
              affect all projects that use it. Please type{" "}
              <strong>{dataConnector.slug}</strong>, the slug of the data
              connector, to confirm.
            </p>
            <Input
              data-cy="delete-confirmation-input"
              value={typedName}
              onChange={onChange}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-end">
          <Button color="outline-danger" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="danger"
            className={cx("float-right", "ms-2")}
            disabled={typedName !== dataConnector.slug.trim()}
            data-cy="delete-data-connector-modal-button"
            type="submit"
            onClick={onDeleteDataCollector}
          >
            {isLoading ? (
              <>
                <Loader className="me-1" inline size={16} />
                Deleting data connector
              </>
            ) : (
              <>
                <Trash className={cx("bi", "me-1")} />
                Remove data connector
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
export default function DataConnectorActions({
  dataConnector,
  toggleView,
}: {
  dataConnector: DataConnectorRead;
  toggleView: () => void;
}) {
  const [isCredentialsOpen, setCredentialsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const onDelete = useCallback(() => {
    setIsDeleteOpen(false);
    toggleView();
  }, [toggleView]);
  const toggleCredentials = useCallback(() => {
    setCredentialsOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  const defaultAction = (
    <Button
      className="text-nowrap"
      color="outline-primary"
      data-cy="data-connector-edit"
      onClick={toggleEdit}
      size="sm"
    >
      <Pencil className={cx("bi", "me-1")} />
      Edit
    </Button>
  );

  return (
    <>
      <ButtonWithMenuV2
        color="outline-primary"
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        <DropdownItem
          data-cy="data-connector-credentials"
          onClick={toggleCredentials}
        >
          <Lock className={cx("bi", "me-1")} />
          Credentials
        </DropdownItem>
        <DropdownItem data-cy="data-connector-delete" onClick={toggleDelete}>
          <Trash className={cx("bi", "me-1")} />
          Remove
        </DropdownItem>
      </ButtonWithMenuV2>
      <DataConnectorCredentialsModal
        dataConnector={dataConnector}
        setOpen={setCredentialsOpen}
        isOpen={isCredentialsOpen}
      />
      <DataConnectorDeleteModal
        dataConnector={dataConnector}
        isOpen={isDeleteOpen}
        onDelete={onDelete}
        toggleModal={toggleDelete}
      />
      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isEditOpen}
        namespace={dataConnector.namespace}
        toggle={toggleEdit}
      />
    </>
  );
}
