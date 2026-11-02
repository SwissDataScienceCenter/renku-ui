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
import { Pencil, Save, Trash, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import {
  MenuButton,
  MenuButtonItem,
} from "../../components/buttons/MenuButton";
import RtkOrDataServicesError from "../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../components/Loader";
import {
  useDeleteUserSecretMutation,
  useGetUserQueryState,
  usePatchUserSecretMutation,
  type SecretWithId,
} from "../usersV2/api/users.api";
import NameField from "./fields/NameField";
import ReplaceSecretValueModal from "./ReplaceSecretValueModal";

interface SecretItemActionsProps {
  secret: SecretWithId;
}

export default function SecretItemActions({ secret }: SecretItemActionsProps) {
  const { data: user } = useGetUserQueryState();

  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const toggleReplace = useCallback(
    () => setIsReplaceOpen((isOpen) => !isOpen),
    [],
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => setIsEditOpen((isOpen) => !isOpen), []);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(
    () => setIsDeleteOpen((isOpen) => !isOpen),
    [],
  );

  if (!user?.isLoggedIn) {
    return null;
  }
  const defaultAction = (
    <Button color={"outline-primary"} onClick={toggleReplace} size="sm">
      <Save className={cx("bi", "me-1")} />
      Replace
    </Button>
  );

  return (
    <>
      <div data-cy="user-secret-actions">
        <MenuButton
          color="outline-primary"
          default={defaultAction}
          label={`More actions for ${secret.name}`}
        >
          <MenuButtonItem onClick={toggleEdit}>
            <Pencil className={cx("bi", "me-1")} />
            Edit
          </MenuButtonItem>
          <MenuButtonItem onClick={toggleDelete}>
            <Trash className={cx("bi", "me-1")} />
            Delete
          </MenuButtonItem>
        </MenuButton>
      </div>
      <ReplaceSecretValueModal
        isOpen={isReplaceOpen}
        secret={secret}
        toggle={toggleReplace}
      />
      <EditSecretModal
        isOpen={isEditOpen}
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

interface EditSecretModalProps {
  isOpen: boolean;
  secret: SecretWithId;
  toggle: () => void;
}

function EditSecretModal({ isOpen, secret, toggle }: EditSecretModalProps) {
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
        },
      });
    },
    [patchUserSecret, secretId],
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler],
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
      <Form noValidate onSubmit={onSubmit}>
        <ModalHeader tag="h2" toggle={toggle}>
          <Pencil className={cx("bi", "me-1")} />
          Edit user secret
        </ModalHeader>
        <ModalBody>
          {result.error && (
            <RtkOrDataServicesError error={result.error} dismissible={false} />
          )}

          <NameField control={control} errors={errors} name="name" />
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
      <ModalHeader className="text-danger" tag="h2" toggle={toggle}>
        <Trash className={cx("bi", "me-1")} />
        Delete user secret
      </ModalHeader>
      <ModalBody>
        {result.error && (
          <RtkOrDataServicesError error={result.error} dismissible={false} />
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
