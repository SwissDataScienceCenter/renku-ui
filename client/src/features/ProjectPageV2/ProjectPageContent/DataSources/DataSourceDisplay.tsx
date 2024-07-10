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
import {
  InfoCircleFill,
  Pencil,
  ThreeDotsVertical,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../../../components/Loader.tsx";
import dotsDropdownStyles from "../../../../components/buttons/ThreeDots.module.scss";
import AddCloudStorageModal from "../../../project/components/cloudStorage/CloudStorageModal.tsx";
import {
  CloudStorageGetRead,
  useDeleteStoragesV2ByStorageIdMutation,
} from "../../../projectsV2/api/storagesV2.api.ts";
import { DataSourceView } from "./DataSourceView.tsx";

interface DataSourceDeleteModalProps {
  storage: CloudStorageGetRead;
  isOpen: boolean;
  toggleModal: () => void;
}
function DataSourceDeleteModal({
  storage,
  toggleModal,
  isOpen,
}: DataSourceDeleteModalProps) {
  const [updateDataSources, { isLoading, isSuccess }] =
    useDeleteStoragesV2ByStorageIdMutation();

  useEffect(() => {
    if (isSuccess) {
      toggleModal();
    }
  }, [isSuccess, toggleModal]);
  const onDeleteDataSources = () => {
    updateDataSources({
      storageId: storage.storage.storage_id,
    });
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Remove Data Source
      </ModalHeader>
      <ModalBody className="py-0">
        <Row>
          <Col>
            <p>
              Are you sure about removing this data source from the project?
            </p>
            <p>
              Data source:{" "}
              <code className="fw-bold fs-6">{storage.storage.name}</code>
            </p>
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
            data-cy="delete-data-source-modal-button"
            type="submit"
            onClick={onDeleteDataSources}
          >
            {isLoading ? (
              <>
                <Loader className="me-2" inline size={16} />
                Deleting data source
              </>
            ) : (
              <>
                <Trash className={cx("bi", "me-1")} />
                Remove data source
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
export function DataSourceActions({
  storage,
  projectId,
}: {
  storage: CloudStorageGetRead;
  projectId: string;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  return (
    <>
      <UncontrolledDropdown>
        <DropdownToggle
          className={cx(
            "m-0",
            "p-0",
            "bg-transparent",
            "d-flex",
            "border-0",
            "shadow-none",
            dotsDropdownStyles.threeDotsDark
          )}
          data-cy="data-source-action"
        >
          <ThreeDotsVertical size={24} className="fs-3" />
          <span className="visually-hidden">Actions</span>
        </DropdownToggle>
        <DropdownMenu
          className={cx("text-end", "mx-0", "mt-2")}
          end
          data-cy="data-source-menu"
        >
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-start"
            )}
            onClick={toggleDelete}
            data-cy="data-source-delete"
          >
            <Trash /> Remove data sources
          </DropdownItem>
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-start"
            )}
            onClick={toggleEdit}
            data-cy="data-source-edit"
          >
            <Pencil /> Edit data source
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
      <DataSourceDeleteModal
        storage={storage}
        isOpen={isDeleteOpen}
        toggleModal={toggleDelete}
      />
      <AddCloudStorageModal
        currentStorage={storage}
        isOpen={isEditOpen}
        toggle={toggleEdit}
        projectId={projectId}
        isV2
      />
    </>
  );
}
interface DataSourceDisplayProps {
  storage: CloudStorageGetRead;
  projectId: string;
}

export function DataSourceDisplay({
  storage,
  projectId,
}: DataSourceDisplayProps) {
  const storageSensitive = storage.storage;
  const [toggleView, setToggleView] = useState(false);
  const toggleDetails = useCallback(() => {
    setToggleView((open: boolean) => !open);
  }, []);

  const storageType = storageSensitive?.storage_type ? (
    <span className="fst-italic" data-cy="data-storage-type">
      (type: {storageSensitive?.storage_type})
    </span>
  ) : null;

  const storageName = (
    <span className="fw-bold" data-cy="data-storage-name">
      {storageSensitive.name}
    </span>
  );

  return (
    <ListGroupItem>
      <div className={cx("d-flex", "align-items-center", "gap-3")}>
        <div
          className={cx("cursor-pointer", "text-decoration-underline")}
          onClick={toggleDetails}
        >
          <InfoCircleFill className={cx("me-2", "text-icon")} />
          <span>
            {storageName} {storageType}
          </span>
        </div>
        <div className={cx("d-flex", "ms-auto", "my-auto")}>
          <DataSourceActions storage={storage} projectId={projectId} />
        </div>
      </div>
      <DataSourceView
        storage={storage}
        setToggleView={toggleDetails}
        toggleView={toggleView}
        projectId={projectId}
      />
    </ListGroupItem>
  );
}
