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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash, TrashFill, XLg } from "react-bootstrap-icons";
import { Link, To, useLocation } from "react-router";
import {
  Button,
  Col,
  DropdownItem,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import RenkuStorageIcon from "~/components/icons/RenkuStorageIcon";
import { type ProjectStorage } from "~/features/dataConnectorsV2/api/data-connectors.api";
import { useDeleteDataConnectorsStorageByStorageIdMutation } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import useLocationHash from "~/utils/customHooks/useLocationHash.hook";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectStorageForm from "./ProjectStorageForm";
import ProjectStorageView from "./ProjectStorageView";

interface ProjectStorageLinkDisplayProps {
  projectStorage: ProjectStorage;
}

export default function ProjectStorageLinkDisplay({
  projectStorage,
}: ProjectStorageLinkDisplayProps) {
  // Handle hash
  const [hash, setHash] = useLocationHash();
  const storageHash = useMemo(
    () => `project-storage-${projectStorage.id}`,
    [projectStorage.id],
  );
  const showOffCanvas = useMemo(
    () => hash === storageHash,
    [storageHash, hash],
  );
  const toggleOffCanvas = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === storageHash;
      return isOpen ? "" : storageHash;
    });
  }, [storageHash, setHash]);

  // Handle url with Hash
  const location = useLocation();
  const targetOffcanvasLocation: To = {
    pathname: location.pathname,
    search: location.search,
    hash: `#${storageHash}`,
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  return (
    <>
      <ListGroupItem
        action
        className={cx("position-relative", "p-0")}
        data-cy="project-storage-item"
      >
        <Link
          className={cx(
            "d-block",
            "link-primary",
            "py-3",
            "text-body",
            "text-decoration-none",
          )}
          to={targetOffcanvasLocation}
        >
          <Row
            className={cx("align-items-center", "flex-nowrap", "g-3", "mx-0")}
          >
            <Col className={cx("d-flex", "flex-column", "min-w-0", "px-0")}>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-wrap",
                  "gap-2",
                )}
              >
                <span className="fw-bold" data-cy="project-storage-name">
                  Project storage
                </span>
              </div>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-row",
                  "gap-1",
                )}
              >
                <RenkuStorageIcon />
                <p className={cx("mb-0", "text-break")}>Renku storage</p>
              </div>
            </Col>
            {/* This column is a placeholder to reserve the space for the action button */}
            <Col xs="auto" className="flex-shrink-0">
              <div
                aria-hidden="true"
                className={cx(
                  "btn",
                  "btn-sm",
                  "opacity-0",
                  "pe-none",
                  "text-nowrap",
                )}
              >
                FakeButton123
              </div>
            </Col>
          </Row>
        </Link>
        {/* The action button is visually positioned over the previous placeholder column */}
        <div
          className={cx("end-0", "mt-3", "position-absolute", "top-0", "z-5")}
        >
          <ProjectStorageActions
            projectStorage={projectStorage}
            toggleEdit={toggleEdit}
          />
        </div>
      </ListGroupItem>
      <ProjectStorageView
        projectStorage={projectStorage}
        showView={showOffCanvas}
        toggleView={toggleOffCanvas}
      />
      <EditProjectStorageModal
        isOpen={isEditOpen}
        toggle={toggleEdit}
        projectStorage={projectStorage}
      />
    </>
  );
}

interface ProjectStorageActionsProps {
  projectStorage: ProjectStorage;
  toggleView?: () => void;
  toggleEdit: () => void;
}

export function ProjectStorageActions({
  projectStorage,
  toggleView,
  toggleEdit,
}: ProjectStorageActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const onDeleteSuccess = useCallback(() => {
    if (toggleView) toggleView();
    setIsDeleteOpen(false);
  }, [toggleView]);

  const permissions = useProjectPermissions({
    projectId: projectStorage.project_id,
  });

  // Display actions only if user is project owner
  if (!permissions.delete) {
    return null;
  }

  const actions = [
    {
      key: "project-storage-edit",
      onClick: toggleEdit,
      content: (
        <>
          <Pencil className={cx("bi", "me-1")} />
          Edit
        </>
      ),
    },
    {
      key: "project-storage-delete",
      onClick: toggleDelete,
      content: (
        <>
          <Trash className={cx("bi", "me-1")} />
          Delete
        </>
      ),
    },
  ];

  const actionsContent =
    actions.length === 0 ? null : actions.length === 1 ? (
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
        dataCy="project-storage-menu-dropdown"
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
      <DeleteProjectStorageModal
        isOpen={isDeleteOpen}
        storageId={projectStorage.id}
        toggle={toggleDelete}
        executeOnSuccess={onDeleteSuccess}
      />
    </>
  );
}

interface DeleteProjectStorageModalProps {
  isOpen: boolean;
  storageId: string;
  toggle: () => void;
  executeOnSuccess: () => void;
}

function DeleteProjectStorageModal({
  isOpen,
  storageId,
  toggle,
  executeOnSuccess,
}: DeleteProjectStorageModalProps) {
  const [deleteStorage, result] =
    useDeleteDataConnectorsStorageByStorageIdMutation();
  const onDelete = useCallback(() => {
    deleteStorage({ storageId });
  }, [deleteStorage, storageId]);

  useEffect(() => {
    if (result.isSuccess) {
      executeOnSuccess();
    }
  }, [result.isSuccess, executeOnSuccess]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Are you sure?
      </ModalHeader>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}

        <p className="mb-0">
          Please confirm that you want to remove this project storage.
        </p>
        <WarnAlert className={cx("mt-3")} dismissible={false} color="danger">
          <p className="mb-0">
            This action cannot be undone. All data stored in this project
            storage will be permanently deleted.
          </p>
        </WarnAlert>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={result.isLoading}
          onClick={onDelete}
          type="button"
          role="button"
        >
          <TrashFill className={cx("bi", "me-1")} />
          Remove project storage
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface EditProjectStorageModalProps {
  isOpen: boolean;
  toggle: () => void;
  projectStorage: ProjectStorage;
}

export function EditProjectStorageModal({
  isOpen,
  toggle,
  projectStorage,
}: EditProjectStorageModalProps) {
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} tag="h2">
        <RenkuStorageIcon className={cx("bi", "me-1")} /> Edit Project Storage
      </ModalHeader>
      <ModalBody>
        <ProjectStorageForm
          projectId={projectStorage.project_id}
          projectStorage={projectStorage}
          toggle={toggle}
        />
      </ModalBody>
    </Modal>
  );
}
