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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Pencil,
  ShieldMinus,
  ShieldPlus,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
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

import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import type { SessionSecretSlot } from "../../../projectsV2/api/projectV2.api";
import {
  useDeleteSessionSecretSlotsBySlotIdMutation,
  usePatchProjectsByProjectIdSessionSecretsMutation,
  usePatchSessionSecretSlotsBySlotIdMutation,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import ReplaceSecretValueModal from "../../../secretsV2/ReplaceSecretValueModal";
import { useGetUserSecretByIdQuery } from "../../../usersV2/api/users.api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import DescriptionField from "./fields/DescriptionField";
import FilenameField from "./fields/FilenameField";
import NameField from "./fields/NameField";
import ProvideSessionSecretModalContent from "./ProvideSessionSecretModalContent";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";

interface SessionSecretActionsProps {
  secretSlot: SessionSecretSlotWithSecret;
}

export default function SessionSecretActions({
  secretSlot,
}: SessionSecretActionsProps) {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const projectId = secretSlot.secretSlot.project_id;
  const permissions = useProjectPermissions({ projectId });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => setIsEditOpen((isOpen) => !isOpen), []);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const toggleRemove = useCallback(
    () => setIsRemoveOpen((isOpen) => !isOpen),
    []
  );

  const [isProvideOpen, setIsProvideOpen] = useState(false);
  const toggleProvide = useCallback(
    () => setIsProvideOpen((isOpen) => !isOpen),
    []
  );

  const [isClearOpen, setIsClearOpen] = useState(false);
  const toggleClear = useCallback(
    () => setIsClearOpen((isOpen) => !isOpen),
    []
  );

  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const toggleReplace = useCallback(
    () => setIsReplaceOpen((isOpen) => !isOpen),
    []
  );

  if (!userLogged) {
    return null;
  }

  const actions = [
    ...(secretSlot.secretId == null
      ? [
          {
            key: "provide-secret",
            onClick: toggleProvide,
            content: (
              <>
                <ShieldPlus className={cx("bi", "me-1")} />
                Provide secret
              </>
            ),
          },
        ]
      : []),
    ...(permissions.write
      ? [
          {
            key: "edit-secret",
            onClick: toggleEdit,
            content: (
              <>
                <Pencil className={cx("bi", "me-1")} />
                Edit
              </>
            ),
          },
        ]
      : []),
    ...(secretSlot.secretId != null
      ? [
          {
            key: "replace-secret-value",
            onClick: toggleReplace,
            content: (
              <>
                <Download className={cx("bi", "me-1")} />
                Replace secret value
              </>
            ),
          },
          {
            key: "clear-secret",
            onClick: toggleClear,
            content: (
              <>
                <ShieldMinus className={cx("bi", "me-1")} />
                Clear secret
              </>
            ),
          },
        ]
      : []),
    ...(permissions.write
      ? [
          {
            key: "remove-secret",
            onClick: toggleRemove,
            content: (
              <>
                <Trash className={cx("bi", "me-1")} />
                Remove
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
      <Col
        data-cy="session-secret-actions"
        xs={12}
        sm="auto"
        className="ms-auto"
      >
        <Button color="outline-primary" onClick={actions[0].onClick} size="sm">
          {actions[0].content}
        </Button>
      </Col>
    ) : (
      <Col
        data-cy="session-secret-actions"
        xs={12}
        sm="auto"
        className="ms-auto"
      >
        <ButtonWithMenuV2
          color="outline-primary"
          default={
            <Button
              color="outline-primary"
              onClick={actions[0].onClick}
              size="sm"
            >
              {actions[0].content}
            </Button>
          }
          size="sm"
        >
          {actions.slice(1).map(({ key, onClick, content }) => (
            <DropdownItem key={key} onClick={onClick}>
              {content}
            </DropdownItem>
          ))}
        </ButtonWithMenuV2>
      </Col>
    );

  return (
    <>
      {actionsContent}
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
      <ProvideSessionSecretModal
        isOpen={isProvideOpen}
        secretSlot={secretSlot.secretSlot}
        toggle={toggleProvide}
      />
      <ClearSessionSecretModal
        isOpen={isClearOpen}
        secretSlotWithSecret={secretSlot}
        toggle={toggleClear}
      />
      <ReplaceSecretValueModalWrapped
        isOpen={isReplaceOpen}
        secretSlotWithSecret={secretSlot}
        toggle={toggleReplace}
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

  const { project } = useProject();
  const { secrets_mount_directory: secretsMountDirectory } = project;

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
        "If-Match": secretSlot.etag,
        slotId,
        sessionSecretSlotPatch: {
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
        <ModalHeader toggle={toggle}>Edit session secret slot</ModalHeader>
        <ModalBody>
          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <NameField control={control} errors={errors} name="name" />
          <DescriptionField
            control={control}
            errors={errors}
            name="description"
          />
          <FilenameField
            control={control}
            errors={errors}
            name="filename"
            secretsMountDirectory={secretsMountDirectory}
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
            Edit session secret slot
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
        Remove session secret slot
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
          Close
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
          Remove session secret slot
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ProvideSessionSecretModalProps {
  isOpen: boolean;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

function ProvideSessionSecretModal({
  isOpen,
  secretSlot,
  toggle,
}: ProvideSessionSecretModalProps) {
  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ProvideSessionSecretModalContent
        isOpen={isOpen}
        secretSlot={secretSlot}
        toggle={toggle}
      />
    </Modal>
  );
}

interface ClearSessionSecretModalProps {
  isOpen: boolean;
  secretSlotWithSecret: SessionSecretSlotWithSecret;
  toggle: () => void;
}

function ClearSessionSecretModal({
  isOpen,
  secretSlotWithSecret,
  toggle,
}: ClearSessionSecretModalProps) {
  const {
    id: slotId,
    name,
    project_id: projectId,
  } = secretSlotWithSecret.secretSlot;

  const [patchSessionSecrets, result] =
    usePatchProjectsByProjectIdSessionSecretsMutation();

  const onClear = useCallback(() => {
    patchSessionSecrets({
      projectId,
      sessionSecretPatchList: [{ secret_slot_id: slotId, value: null }],
    });
  }, [patchSessionSecrets, projectId, slotId]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>Clear session secret</ModalHeader>
      <ModalBody>
        <p>
          This action will clear the secret value from the{" "}
          <span className="fw-bold">{name}</span> session secret slot.
        </p>
        <p className="mb-0">Your user secret will not be deleted.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button color="primary" type="button" onClick={onClear}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <ShieldMinus className={cx("bi", "me-1")} />
          )}
          Clear session secret
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ReplaceSecretValueModalWrappedProps {
  isOpen: boolean;
  secretSlotWithSecret: SessionSecretSlotWithSecret;
  toggle: () => void;
}

function ReplaceSecretValueModalWrapped({
  isOpen,
  secretSlotWithSecret,
  toggle,
}: ReplaceSecretValueModalWrappedProps) {
  const { secretId } = secretSlotWithSecret;
  const { data: userSecret, error } = useGetUserSecretByIdQuery(
    secretId
      ? {
          secretId,
        }
      : skipToken
  );

  if (error || !userSecret) {
    return null;
  }

  return (
    <ReplaceSecretValueModal
      isOpen={isOpen}
      secret={userSecret}
      toggle={toggle}
      isV2
    />
  );
}
