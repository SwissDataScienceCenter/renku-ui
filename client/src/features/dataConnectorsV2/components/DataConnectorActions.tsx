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
import { Lock, NodeMinus, Pencil, Trash, XLg } from "react-bootstrap-icons";
import { matchPath, useLocation } from "react-router-dom-v5-compat";
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
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";

import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";
import {
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
} from "../api/data-connectors.enhanced-api";
import { projectV2Api } from "../../projectsV2/api/projectV2.enhanced-api";

import DataConnectorCredentialsModal from "./DataConnectorCredentialsModal";
import DataConnectorModal from "./DataConnectorModal";

interface DataConnectorRemoveModalProps {
  dataConnector: DataConnectorRead;
  dataConnectorLink?: DataConnectorToProjectLink;
  isOpen: boolean;
  onDelete: () => void;
  toggleModal: () => void;
}

function DataConnectorRemoveDeleteModal({
  dataConnector,
  onDelete,
  toggleModal,
  isOpen,
}: DataConnectorRemoveModalProps) {
  const dispatch = useAppDispatch();
  const { data: dataConnectorLinks, isLoading: isLoadingLinks } =
    useGetDataConnectorsByDataConnectorIdProjectLinksQuery({
      dataConnectorId: dataConnector.id,
    });
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
      dispatch(projectV2Api.util.invalidateTags(["DataConnectors"]));
      onDelete();
    }
  }, [dispatch, isSuccess, onDelete]);
  const onDeleteDataCollector = useCallback(() => {
    deleteDataConnector({
      dataConnectorId: dataConnector.id,
    });
  }, [deleteDataConnector, dataConnector.id]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Delete data connector
      </ModalHeader>
      <ModalBody>
        {isLoadingLinks || dataConnectorLinks == null ? (
          <Loader />
        ) : (
          <Row>
            <Col>
              <p>
                Are you sure you want to delete this data connector?{" "}
                {dataConnectorLinks.length <
                1 ? null : dataConnectorLinks.length === 1 ? (
                  <>
                    It will affect <b>1 project that uses it</b>.
                  </>
                ) : (
                  <>
                    It will affect{" "}
                    <b>{dataConnectorLinks.length} projects that use it</b>.
                  </>
                )}
              </p>
              <p>
                Please type <strong>{dataConnector.slug}</strong>, the slug of
                the data connector, to confirm.
              </p>
              <Input
                data-cy="delete-confirmation-input"
                value={typedName}
                onChange={onChange}
              />
            </Col>
          </Row>
        )}
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

interface DataConnectorRemoveUnlinkModalProps
  extends Omit<DataConnectorRemoveModalProps, "dataConnectorLink"> {
  dataConnectorLink: DataConnectorToProjectLink;
  projectId: string;
}

function DataConnectorRemoveUnlinkModal({
  dataConnector,
  dataConnectorLink,
  projectId,
  onDelete,
  toggleModal,
  isOpen,
}: DataConnectorRemoveUnlinkModalProps) {
  const dispatch = useAppDispatch();
  const [unlinkDataConnector, { isLoading: isLoadingUnlink, isSuccess }] =
    useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation();

  const linkId = dataConnectorLink.id;

  useEffect(() => {
    if (isSuccess) {
      dispatch(projectV2Api.util.invalidateTags(["DataConnectors"]));
      onDelete();
    }
  }, [dispatch, isSuccess, onDelete]);

  const onDeleteDataCollector = useCallback(() => {
    if (!linkId) return;

    unlinkDataConnector({
      dataConnectorId: dataConnector.id,
      linkId,
    });
  }, [unlinkDataConnector, dataConnector.id, linkId]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Unlink data connector
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Are you sure you want to unlink the data connector{" "}
              <strong>{dataConnector.slug}</strong> from the project{" "}
              <strong>{projectId}</strong>?
            </p>
            <p>
              The data from the data connector will no longer be available in
              sessions.
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
            data-cy="delete-data-connector-modal-button"
            type="submit"
            onClick={onDeleteDataCollector}
          >
            {isLoadingUnlink ? (
              <>
                <Loader className="me-1" inline size={16} />
                Unlinking data connector
              </>
            ) : (
              <>
                <NodeMinus className={cx("bi", "me-1")} />
                Unlink data connector
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
  dataConnectorLink,
  toggleView,
}: {
  dataConnector: DataConnectorRead;
  dataConnectorLink?: DataConnectorToProjectLink;
  toggleView: () => void;
}) {
  const location = useLocation();
  const pathMatch = matchPath(
    ABSOLUTE_ROUTES.v2.projects.show.root,
    location.pathname
  );
  const namespace = pathMatch?.params?.namespace;
  const slug = pathMatch?.params?.slug;
  const projectId = `${namespace}/${slug}`;
  const removeMode =
    pathMatch === null ||
    namespace == null ||
    slug == null ||
    dataConnectorLink == null
      ? "delete"
      : "unlink";
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

  const removeModal =
    removeMode == "delete" ? (
      <DataConnectorRemoveDeleteModal
        dataConnector={dataConnector}
        dataConnectorLink={dataConnectorLink}
        isOpen={isDeleteOpen}
        onDelete={onDelete}
        toggleModal={toggleDelete}
      />
    ) : (
      <DataConnectorRemoveUnlinkModal
        dataConnector={dataConnector}
        dataConnectorLink={dataConnectorLink!}
        isOpen={isDeleteOpen}
        onDelete={onDelete}
        projectId={projectId}
        toggleModal={toggleDelete}
      />
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
          {removeMode === "delete" ? (
            <span>
              <Trash className={cx("bi", "me-1")} />
              Remove
            </span>
          ) : (
            <span>
              <NodeMinus className={cx("bi", "me-1")} />
              Unlink
            </span>
          )}
        </DropdownItem>
      </ButtonWithMenuV2>
      <DataConnectorCredentialsModal
        dataConnector={dataConnector}
        setOpen={setCredentialsOpen}
        isOpen={isCredentialsOpen}
      />
      {removeModal}
      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isEditOpen}
        namespace={dataConnector.namespace}
        toggle={toggleEdit}
      />
    </>
  );
}
