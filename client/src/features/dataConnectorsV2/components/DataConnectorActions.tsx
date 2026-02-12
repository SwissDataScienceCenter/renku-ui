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
import { matchPath, useLocation } from "react-router";
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

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";
import {
  useDeleteDataConnectorsByDataConnectorIdMutation,
  useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation,
  useGetDataConnectorsByDataConnectorIdProjectLinksQuery,
} from "../api/data-connectors.enhanced-api";
import useDataConnectorPermissions from "../utils/useDataConnectorPermissions.hook";
import { getDataConnectorScope } from "./dataConnector.utils";
import DataConnectorCredentialsModal from "./DataConnectorCredentialsModal";

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
  const { permissions, isLoading: isLoadingPermissions } =
    useDataConnectorPermissions({ dataConnectorId: dataConnector.id });

  const {
    data: dataConnectorLinks,
    isLoading: isLoadingLinks,
    isError: isLoadingLinksError,
  } = useGetDataConnectorsByDataConnectorIdProjectLinksQuery({
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
    if (isSuccess && isOpen) {
      onDelete();
    }
  }, [isOpen, isSuccess, onDelete]);
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
        {isLoadingLinks || isLoadingPermissions ? (
          <Loader />
        ) : (
          <PermissionsGuard
            disabled={
              <Row>
                <Col>
                  <p>
                    You do not have the required permissions to delete this data
                    connector.
                  </p>
                </Col>
              </Row>
            }
            enabled={
              dataConnectorLinks == null || isLoadingLinksError ? (
                <Row>
                  <Col>
                    <p>
                      Are you sure you want to delete this data connector? It is
                      possible that it is used in some projects.
                    </p>
                    <p>
                      Please type <strong>{dataConnector.slug}</strong>, the
                      slug of the data connector, to confirm.
                    </p>
                    <Input
                      data-cy="delete-confirmation-input"
                      value={typedName}
                      onChange={onChange}
                    />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col>
                    <p>
                      Are you sure you want to delete this data connector?{" "}
                      {dataConnectorLinks.length < 1 ? (
                        <>
                          It is not used in any projects that are visible to
                          you, but it will affect any projects where it is used.
                        </>
                      ) : dataConnectorLinks.length === 1 ? (
                        <>
                          It will affect at least <b>1 project that uses it</b>.
                        </>
                      ) : (
                        <>
                          It will affect at least{" "}
                          <b>
                            {dataConnectorLinks.length} projects that use it
                          </b>
                          .
                        </>
                      )}
                    </p>
                    <p>
                      Please type <strong>{dataConnector.slug}</strong>, the
                      slug of the data connector, to confirm.
                    </p>
                    <Input
                      data-cy="delete-confirmation-input"
                      value={typedName}
                      onChange={onChange}
                    />
                  </Col>
                </Row>
              )
            }
            requestedPermission="delete"
            userPermissions={permissions}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-end">
          <Button color="outline-danger" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <PermissionsGuard
            disabled={null}
            enabled={
              <Button
                color="danger"
                className={cx("float-right", "ms-2")}
                disabled={isLoading || typedName !== dataConnector.slug.trim()}
                data-cy="delete-data-connector-modal-button"
                type="submit"
                onClick={onDeleteDataCollector}
              >
                {isLoading ? (
                  <>
                    <Loader className="me-1" inline size={16} />
                    Remove data connector
                  </>
                ) : (
                  <>
                    <Trash className={cx("bi", "me-1")} />
                    Remove data connector
                  </>
                )}
              </Button>
            }
            requestedPermission="delete"
            userPermissions={permissions}
          />
        </div>
      </ModalFooter>
    </Modal>
  );
}

interface DataConnectorRemoveUnlinkModalProps
  extends Omit<DataConnectorRemoveModalProps, "dataConnectorLink"> {
  dataConnectorLink: DataConnectorToProjectLink;
  projectNamespace: string;
  projectSlug: string;
}

function DataConnectorRemoveUnlinkModal({
  dataConnector,
  dataConnectorLink,
  onDelete,
  projectNamespace,
  projectSlug,
  toggleModal,
  isOpen,
}: DataConnectorRemoveUnlinkModalProps) {
  const [
    unlinkDataConnector,
    { isLoading: isLoadingUnlink, isSuccess, error },
  ] = useDeleteDataConnectorsByDataConnectorIdProjectLinksAndLinkIdMutation();
  const { data: project, isLoading: isLoadingProject } =
    useGetNamespacesByNamespaceProjectsAndSlugQuery({
      namespace: projectNamespace,
      slug: projectSlug,
    });
  const permissions = useProjectPermissions({ projectId: project?.id ?? "" });

  const linkId = dataConnectorLink.id;

  useEffect(() => {
    if (isSuccess && isOpen) {
      onDelete();
    }
  }, [isOpen, isSuccess, onDelete]);

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
      {isLoadingProject ? (
        <>
          <ModalBody>
            <Loader />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </>
      ) : (
        <>
          <ModalBody>
            <Row>
              <Col>
                <PermissionsGuard
                  disabled={
                    <p className="mb-0">
                      You do not have the required permissions to unlink this
                      data connector.
                    </p>
                  }
                  enabled={
                    <>
                      <p>
                        Are you sure you want to unlink the data connector{" "}
                        <strong>{dataConnector.slug}</strong> from the project{" "}
                        <strong>
                          {projectNamespace}/{projectSlug}
                        </strong>
                        ?
                      </p>
                      <p className="mb-0">
                        The data from the data connector will no longer be
                        available in sessions.
                      </p>
                    </>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            {error && <RtkOrNotebooksError error={error} />}
            <div className="d-flex justify-content-end">
              <Button color="outline-danger" onClick={toggleModal}>
                <XLg className={cx("bi", "me-1")} />
                Cancel
              </Button>
              <PermissionsGuard
                disabled={null}
                enabled={
                  <Button
                    color="danger"
                    className={cx("float-right", "ms-2")}
                    disabled={isLoadingUnlink}
                    data-cy="delete-data-connector-modal-button"
                    type="submit"
                    onClick={onDeleteDataCollector}
                  >
                    {isLoadingUnlink ? (
                      <>
                        <Loader className="me-1" inline size={16} />
                        Unlink data connector
                      </>
                    ) : (
                      <>
                        <NodeMinus className={cx("bi", "me-1")} />
                        Unlink data connector
                      </>
                    )}
                  </Button>
                }
                requestedPermission="write"
                userPermissions={permissions}
              />
            </div>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

function DataConnectorActionsInner({
  dataConnector,
  dataConnectorLink,
  toggleView,
  toggleEdit,
}: DataConnectorActionsProps) {
  const { id: dataConnectorId } = dataConnector;
  const scope = getDataConnectorScope(dataConnector.namespace);
  const { permissions } = useDataConnectorPermissions({ dataConnectorId });

  const { project_id: projectId } = dataConnectorLink ?? {};
  const projectPermissions = useProjectPermissions({
    projectId: projectId ?? "",
  });

  const location = useLocation();
  const pathMatch = matchPath(
    ABSOLUTE_ROUTES.v2.projects.show.root,
    location.pathname
  );
  const namespace = pathMatch?.params?.namespace;
  const slug = pathMatch?.params?.slug;
  const removeMode =
    pathMatch == null ||
    namespace == null ||
    slug == null ||
    dataConnectorLink == null
      ? "delete"
      : "unlink";
  const requiresCredentials =
    dataConnector.storage.sensitive_fields?.length > 0;
  const [isCredentialsOpen, setCredentialsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);
  const onDelete = useCallback(() => {
    toggleView();
    setIsDeleteOpen(false);
  }, [toggleView]);
  const onUnlink = useCallback(() => {
    toggleView();
    setIsUnlinkOpen(false);
  }, [toggleView]);
  const toggleCredentials = useCallback(() => {
    setCredentialsOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);

  const toggleUnlink = useCallback(() => {
    setIsUnlinkOpen((open) => !open);
  }, []);

  const actions = [
    ...(permissions.write
      ? [
          {
            key: "data-connector-edit",
            onClick: () => toggleEdit(3),
            content: (
              <>
                <Pencil className={cx("bi", "me-1")} />
                Edit
              </>
            ),
          },
          {
            key: "data-connector-edit-connection",
            onClick: () => toggleEdit(2),
            content: (
              <>
                <Pencil className={cx("bi", "me-1")} />
                Edit Connection Information
              </>
            ),
          },
        ]
      : []),
    ...(requiresCredentials
      ? [
          {
            key: "data-connector-credentials",
            onClick: toggleCredentials,
            content: (
              <>
                <Lock className={cx("bi", "me-1")} />
                Credentials
              </>
            ),
          },
        ]
      : []),
    ...(permissions.delete && removeMode === "delete" && scope !== "global"
      ? [
          {
            key: "data-connector-delete",
            onClick: toggleDelete,
            content: (
              <>
                <Trash className={cx("bi", "me-1")} />
                Remove
              </>
            ),
          },
        ]
      : []),
    ...(projectPermissions.write && removeMode === "unlink"
      ? [
          {
            key: "data-connector-unlink",
            onClick: toggleUnlink,
            content: (
              <>
                <NodeMinus className={cx("bi", "me-1")} />
                Unlink
              </>
            ),
          },
        ]
      : []),
  ];

  if (actions.length < 1) {
    return null;
  }

  const actionsContent =
    actions.length == 1 ? (
      <Button
        color="outline-primary"
        data-cy={actions[0].key}
        onClick={actions[0].onClick}
        size="sm"
      >
        {actions[0].content}
      </Button>
    ) : (
      <ButtonWithMenuV2
        color="outline-primary"
        dataCy="data-connector-menu-dropdown"
        default={
          <Button
            color="outline-primary"
            data-cy={actions[0].key}
            onClick={actions[0].onClick}
            size="sm"
          >
            {actions[0].content}
          </Button>
        }
        size="sm"
      >
        {actions.slice(1).map(({ key, onClick, content }) => (
          <DropdownItem key={key} data-cy={key} onClick={onClick}>
            {content}
          </DropdownItem>
        ))}
      </ButtonWithMenuV2>
    );

  return (
    <>
      {actionsContent}
      <DataConnectorCredentialsModal
        dataConnector={dataConnector}
        setOpen={setCredentialsOpen}
        isOpen={isCredentialsOpen}
      />
      <DataConnectorRemoveDeleteModal
        dataConnector={dataConnector}
        dataConnectorLink={dataConnectorLink}
        isOpen={isDeleteOpen}
        onDelete={onDelete}
        toggleModal={toggleDelete}
      />
      {dataConnectorLink && (
        <DataConnectorRemoveUnlinkModal
          dataConnector={dataConnector}
          dataConnectorLink={dataConnectorLink}
          isOpen={isUnlinkOpen}
          onDelete={onUnlink}
          projectNamespace={namespace!}
          projectSlug={slug!}
          toggleModal={toggleUnlink}
        />
      )}
    </>
  );
}

interface DataConnectorActionsProps {
  dataConnector: DataConnectorRead;
  dataConnectorLink?: DataConnectorToProjectLink;
  toggleView: () => void;
  toggleEdit: (initialStep: number) => void;
}

export default function DataConnectorActions(props: DataConnectorActionsProps) {
  const { data: user } = useGetUserQueryState();
  const isUserLoggedIn = !!user?.isLoggedIn;

  if (!isUserLoggedIn) {
    return null;
  }

  return <DataConnectorActionsInner {...props} />;
}
