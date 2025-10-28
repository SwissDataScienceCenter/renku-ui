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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import FilenameField from "../secretsV2/fields/FilenameField";
import NameField from "../secretsV2/fields/NameField";
import SecretValueField from "../secretsV2/fields/SecretValueField";
import { usePostUserSecretMutation, usersApi } from "../usersV2/api/users.api";

export default function GeneralSecretNew() {
  // Set up the modal
  const [showModal, setShowModal] = useState(false);
  const toggleModal = useCallback(() => {
    setShowModal((showModal) => !showModal);
  }, []);

  // Set up the form
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddSecretForm>({
    defaultValues: {
      name: "",
      filename: "",
      value: "",
    },
  });

  // Handle fetching/posting data
  const [getSecrets, secrets] = usersApi.useLazyGetUserSecretsQuery();
  const [addSecretMutation, result] = usePostUserSecretMutation();
  const onSubmit = useCallback(
    (data: AddSecretForm) => {
      const filename = data.filename.trim();
      addSecretMutation({
        secretPost: {
          name: data.name,
          value: data.value,
          ...(filename ? { default_filename: filename } : {}),
        },
      });
    },
    [addSecretMutation]
  );

  // Force fetching the secrets when trying to add a new one to try to prevent duplicates
  useEffect(() => {
    if (showModal) {
      getSecrets({ userSecretsParams: { kind: "general" } });
    }
  }, [getSecrets, showModal]);

  // Automatically close the modal when the secret is added
  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
      reset();
    }
  }, [reset, result.isSuccess, toggleModal]);

  const modalBody = secrets.isLoading ? (
    <Loader />
  ) : (
    <>
      <p>Here you can add a new secret to use in your sessions.</p>
      <p>
        Names must be unique and can contain only letters, numbers, dots (.),
        underscores (_), and dashes (-). Values are limited to 5000 characters.
      </p>
      <Form
        className="form-rk-green"
        data-cy="secrets-new-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <NameField control={control} errors={errors} name="name" />
        <FilenameField
          control={control}
          errors={errors}
          name="filename"
          rules={{
            validate: {
              uniqueFilename: (filename: string) =>
                secrets.data?.map((s) => s.default_filename).includes(filename)
                  ? "This filename is already used by another secret"
                  : undefined,
            },
          }}
        />
        <SecretValueField control={control} errors={errors} name="value" />
      </Form>
    </>
  );

  return (
    <>
      <Modal
        backdrop="static"
        centered
        fullscreen="md"
        isOpen={showModal}
        size="md"
        toggle={toggleModal}
      >
        <ModalHeader toggle={toggleModal}>Add New Secret</ModalHeader>
        <ModalBody>{modalBody}</ModalBody>
        <ModalFooter>
          {result.isError && (
            <div className={cx("mb-2", "w-100")}>
              <RtkOrNotebooksError error={result.error} />
            </div>
          )}
          <Button
            className="btn-outline-rk-green"
            data-cy="secrets-new-cancel-button"
            onClick={toggleModal}
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            data-cy="secrets-new-add-button"
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading ? (
              <Loader inline className="me-1" size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add
          </Button>
        </ModalFooter>
      </Modal>
      <div className="mb-3">
        <Button
          id="new-secret-button"
          className="btn-outline-rk-green"
          onClick={toggleModal}
        >
          <PlusLg className={cx("bi", "me-1")} />
          Add New Secret
        </Button>
      </div>
    </>
  );
}

interface AddSecretForm {
  name: string;
  filename: string;
  value: string;
}
