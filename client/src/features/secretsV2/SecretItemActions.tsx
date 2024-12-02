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
import { Download, Pencil, Trash, XLg } from "react-bootstrap-icons";
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

import {
  ButtonWithMenu,
  ButtonWithMenuV2,
} from "../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import {
  usePatchUserSecretMutation,
  useDeleteUserSecretMutation,
  type SecretWithId,
} from "../usersV2/api/users.api";
import SecretValueField from "./fields/SecretValueField";
import NameField from "./fields/NameField";
import FilenameField from "./fields/FilenameField";

interface SecretItemActionsProps {
  isV2?: boolean;
  secret: SecretWithId;
}

export default function SecretItemActions({
  isV2,
  secret,
}: SecretItemActionsProps) {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const toggleReplace = useCallback(
    () => setIsReplaceOpen((isOpen) => !isOpen),
    []
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => setIsEditOpen((isOpen) => !isOpen), []);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(
    () => setIsDeleteOpen((isOpen) => !isOpen),
    []
  );

  if (!userLogged) {
    return null;
  }

  const ButtonWithMenuTag = isV2 ? ButtonWithMenuV2 : ButtonWithMenu;
  const buttonColor = isV2 ? "outline-primary" : "rk-green";

  return (
    <>
      <Col xs={12} sm="auto" className="ms-auto" data-cy="user-secret-actions">
        <ButtonWithMenuTag
          color={buttonColor as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          default={
            <Button
              color={isV2 ? "outline-primary" : "outline-rk-green"}
              onClick={toggleReplace}
              size="sm"
            >
              <Download className={cx("bi", "me-1")} />
              Replace
            </Button>
          }
          size="sm"
        >
          <DropdownItem onClick={toggleEdit}>
            <Pencil className={cx("bi", "me-1")} />
            Edit
          </DropdownItem>
          <DropdownItem onClick={toggleDelete}>
            <Trash className={cx("bi", "me-1")} />
            Delete
          </DropdownItem>
        </ButtonWithMenuTag>
      </Col>
      <ReplaceSecretValueModal
        isOpen={isReplaceOpen}
        isV2={isV2}
        secret={secret}
        toggle={toggleReplace}
      />
      <EditSecretModal
        isOpen={isEditOpen}
        isV2={isV2}
        secret={secret}
        toggle={toggleEdit}
      />
      <DeleteSecretModal
        isOpen={isDeleteOpen}
        secret={secret}
        toggle={toggleDelete}
      />
    </>
  );
}

interface ReplaceSecretValueModalProps {
  isOpen: boolean;
  isV2?: boolean;
  secret: SecretWithId;
  toggle: () => void;
}

function ReplaceSecretValueModal({
  isOpen,
  isV2,
  secret,
  toggle,
}: ReplaceSecretValueModalProps) {
  const { id: secretId } = secret;

  const [patchUserSecret, result] = usePatchUserSecretMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<ReplaceSecretValueForm>({
    defaultValues: {
      value: "",
    },
  });

  const submitHandler = useCallback(
    (data: ReplaceSecretValueForm) => {
      patchUserSecret({
        secretId,
        secretPatch: {
          value: data.value,
        },
      });
    },
    [patchUserSecret, secretId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({
      value: "",
    });
  }, [reset, secret]);

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
      <Form
        className={cx(!isV2 && "form-rk-green")}
        data-cy="replace-secret-value-form"
        noValidate
        onSubmit={onSubmit}
      >
        <ModalHeader toggle={toggle}>Replace secret value</ModalHeader>
        <ModalBody>
          <p>
            Here you can replace the value of the secret named{" "}
            <span className="fw-bold">{secret.name}</span>. The change will
            apply only to new sessions.
          </p>

          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <SecretValueField control={control} errors={errors} name="value" />
        </ModalBody>
        <ModalFooter>
          <Button
            color={isV2 ? "outline-primary" : "outline-rk-green"}
            onClick={toggle}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color={isV2 ? "primary" : "rk-green"}
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Replace value
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface ReplaceSecretValueForm {
  value: string;
}

interface EditSecretModalProps {
  isOpen: boolean;
  isV2?: boolean;
  secret: SecretWithId;
  toggle: () => void;
}

function EditSecretModal({
  isOpen,
  isV2,
  secret,
  toggle,
}: EditSecretModalProps) {
  const { id: secretId } = secret;

  const [patchUserSecret, result] = usePatchUserSecretMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<EditSecretForm>({
    defaultValues: {
      name: secret.name,
      filename: secret.default_filename,
    },
  });

  const submitHandler = useCallback(
    (data: EditSecretForm) => {
      patchUserSecret({
        secretId,
        secretPatch: {
          name: data.name,
          ...(!isV2 ? { default_filename: data.filename } : {}),
        },
      });
    },
    [isV2, patchUserSecret, secretId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({
      name: secret.name,
      filename: secret.default_filename,
    });
  }, [reset, secret]);

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
      <Form
        className={cx(!isV2 && "form-rk-green")}
        noValidate
        onSubmit={onSubmit}
      >
        <ModalHeader toggle={toggle}>Edit secret</ModalHeader>
        <ModalBody>
          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <NameField control={control} errors={errors} name="name" />
          {!isV2 && (
            <FilenameField
              control={control}
              errors={errors}
              name="filename"
              rules={{ required: "Please provide a filename" }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color={isV2 ? "outline-primary" : "outline-rk-green"}
            onClick={toggle}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color={isV2 ? "primary" : "rk-green"}
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Update
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface EditSecretForm {
  name: string;
  filename: string;
}

interface DeleteSecretModalProps {
  isOpen: boolean;
  secret: SecretWithId;
  toggle: () => void;
}

function DeleteSecretModal({ isOpen, secret, toggle }: DeleteSecretModalProps) {
  const { id: secretId } = secret;

  const [deleteUserSecret, result] = useDeleteUserSecretMutation();

  const onDelete = useCallback(() => {
    deleteUserSecret({ secretId });
  }, [deleteUserSecret, secretId]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className="text-danger" toggle={toggle}>
        Delete user secret
      </ModalHeader>
      <ModalBody>
        {result.error && (
          <RtkOrNotebooksError error={result.error} dismissible={false} />
        )}

        <p>
          Are you sure about removing the secret{" "}
          <span className="fw-bold">{secret.name}</span>?
        </p>
        <p className="mb-0">The secret value will be permanently deleted.</p>
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
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Trash className={cx("bi", "me-1")} />
          )}
          Delete secret
        </Button>
      </ModalFooter>
    </Modal>
  );
}
