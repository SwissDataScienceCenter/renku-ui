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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash, XLg } from "react-bootstrap-icons";
import {
  Button,
  Col,
  DropdownItem,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { useForm } from "react-hook-form";
import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { SessionSecretSlot } from "../../../projectsV2/api/projectV2.api";
import {
  useDeleteSessionSecretSlotsBySlotIdMutation,
  usePatchSessionSecretSlotsBySlotIdMutation,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import FilenameField from "./fields/FilenameField";
import NameField from "./fields/NameField";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";
import DescriptionField from "./fields/DescriptionField";

interface SessionSecretActionsProps {
  secretSlot: SessionSecretSlotWithSecret;
}

export default function SessionSecretActions({
  secretSlot,
}: SessionSecretActionsProps) {
  const projectId = secretSlot.secretSlot.project_id;
  const permissions = useProjectPermissions({ projectId });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => setIsEditOpen((isOpen) => !isOpen), []);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const toggleRemove = useCallback(
    () => setIsRemoveOpen((isOpen) => !isOpen),
    []
  );

  const defaultAction = (
    <Button color="outline-primary" onClick={toggleEdit} size="sm">
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
      <EditSessionSecretModal
        isOpen={isEditOpen}
        secretSlot={secretSlot.secretSlot}
        toggle={toggleEdit}
      />
      <RemoveSessionSecretModal
        isOpen={isRemoveOpen}
        secretSlot={secretSlot.secretSlot}
        toggle={toggleRemove}
      />
    </>
  );
}

interface EditSessionSecretModalProps {
  isOpen: boolean;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

function EditSessionSecretModal({
  isOpen,
  secretSlot,
  toggle,
}: EditSessionSecretModalProps) {
  const { id: slotId } = secretSlot;

  const [patchSessionSecretSlot, result] =
    usePatchSessionSecretSlotsBySlotIdMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<EditSessionSecretForm>({
    defaultValues: {
      description: secretSlot.description ?? "",
      filename: secretSlot.filename,
      name: secretSlot.name,
    },
  });

  const submitHandler = useCallback(
    (data: EditSessionSecretForm) => {
      const description_ = data.description?.trim();
      const description = description_ ? description_ : "";
      const name = data.name?.trim();
      patchSessionSecretSlot({
        slotId,
        sessionSecretSlotPatch: {
          //   description,
          //   filename: data.filename,
          //   name,
          // Only update edited fields
          ...(description !== (secretSlot.description ?? "")
            ? { description }
            : {}),
          ...(data.filename !== secretSlot.filename
            ? { filename: data.filename }
            : {}),
          ...(name !== secretSlot.name ? { name } : {}),
        },
      });
    },
    [patchSessionSecretSlot, secretSlot, slotId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({
      description: secretSlot.description ?? "",
      filename: secretSlot.filename,
      name: secretSlot.name,
    });
  }, [reset, secretSlot]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <Form noValidate onSubmit={onSubmit}>
        <ModalHeader toggle={toggle}>Edit session secret</ModalHeader>
        <ModalBody>
          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <NameField control={control} errors={errors} name="name" />
          <FilenameField control={control} errors={errors} name="filename" />
          <DescriptionField
            control={control}
            errors={errors}
            name="description"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color="primary"
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Edit session secret
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface EditSessionSecretForm {
  name: string | undefined;
  description: string | undefined;
  filename: string | undefined;
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
