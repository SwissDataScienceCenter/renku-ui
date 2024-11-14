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
import { Pencil, Trash, XLg } from "react-bootstrap-icons";
import {
  Button,
  Col,
  DropdownItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import { useDeleteSessionSecretSlotsBySlotIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";
import type { SessionSecretSlot } from "../../../projectsV2/api/projectV2.api";

interface SessionSecretActionsProps {
  secretSlot: SessionSecretSlotWithSecret;
}

export default function SessionSecretActions({
  secretSlot,
}: SessionSecretActionsProps) {
  const projectId = secretSlot.secretSlot.project_id;
  const permissions = useProjectPermissions({ projectId });

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const toggleRemove = useCallback(
    () => setIsRemoveOpen((isOpen) => !isOpen),
    []
  );

  const defaultAction = (
    <Button
      color="outline-primary"
      onClick={(e) => {
        e.preventDefault();
      }}
      size="sm"
    >
      <Pencil className={cx("bi", "me-1")} />
      Edit
    </Button>
  );

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <Col xs={12} sm="auto" className="ms-auto">
            <ButtonWithMenuV2
              color="outline-primary"
              default={defaultAction}
              size="sm"
            >
              <DropdownItem
                data-cy="code-repository-delete"
                onClick={toggleRemove}
              >
                <Trash className={cx("bi", "me-1")} />
                Remove
              </DropdownItem>
            </ButtonWithMenuV2>
          </Col>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
      <RemoveSessionSecretModal
        isOpen={isRemoveOpen}
        secretSlot={secretSlot.secretSlot}
        toggle={toggleRemove}
      />
    </>
  );
}

interface RemoveSessionSecretModalProps {
  isOpen: boolean;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

function RemoveSessionSecretModal({
  isOpen,
  secretSlot,
  toggle,
}: RemoveSessionSecretModalProps) {
  const { id: slotId, name } = secretSlot;

  const [deleteSessionSecretSlot, result] =
    useDeleteSessionSecretSlotsBySlotIdMutation();

  const onRemove = useCallback(() => {
    deleteSessionSecretSlot({ slotId });
  }, [deleteSessionSecretSlot, slotId]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className="text-danger" toggle={toggle}>
        Remove session secret
      </ModalHeader>
      <ModalBody>
        {result.error && (
          <RtkOrNotebooksError error={result.error} dismissible={false} />
        )}

        <p>
          Are you sure about removing the{" "}
          <span className="fw-bold">{name}</span> slot for session secrets from
          the project?
        </p>
        <p className="mb-0">
          The session secret will be removed for all members of the project.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          data-cy="delete-code-repository-modal-button"
          type="button"
          onClick={onRemove}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Trash className={cx("bi", "me-1")} />
          )}
          Remove session secret
        </Button>
      </ModalFooter>
    </Modal>
  );
}
