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
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import secretsApi, { useAddSecretMutation } from "./secrets.api";
import { AddSecretForm } from "./secrets.types";
import { SECRETS_VALUE_LENGTH_LIMIT } from "./secrets.utils";

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
      value: "",
      kind: "general",
    },
  });

  // Handle fetching/posting data
  const [getSecrets, secrets] = secretsApi.useLazyGetSecretsQuery();
  const [addSecretMutation, result] = useAddSecretMutation();
  const onSubmit = useCallback(
    (newSecret: AddSecretForm) => {
      addSecretMutation(newSecret);
    },
    [addSecretMutation]
  );

  // Force fetching the secrets when trying to add a new one to try to prevent duplicates
  useEffect(() => {
    if (showModal) {
      getSecrets({ kind: "general" });
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
        <div className="mb-3">
          <Label className="form-label" for="new-secret-name">
            Name
          </Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                autoComplete="off"
                className={cx(errors.name && "is-invalid")}
                id="new-secret-name"
                placeholder="Unique name"
                type="text"
                {...field}
              />
            )}
            rules={{
              required: "Please provide a name.",
              validate: (value) =>
                secrets.data?.map((s) => s.name).includes(value)
                  ? "This name is already used by another secret."
                  : value && value.startsWith(".")
                  ? "Name cannot start with a dot."
                  : !/^[a-zA-Z0-9_.-]+$/.test(value)
                  ? "Only letters, numbers, dots (.), underscores (_), and dashes (-)."
                  : undefined,
            }}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-3">
          <Label className="form-label" for="new-secret-value">
            Value
          </Label>
          <Controller
            control={control}
            name="value"
            render={({ field }) => (
              <Input
                id="new-secret-value"
                type="textarea"
                {...field}
                autoComplete="off one-time-code"
                className={cx(
                  "rounded-0",
                  "rounded-start",
                  errors.value && "is-invalid"
                )}
                spellCheck="false"
                rows={6}
              />
            )}
            rules={{
              required: "Please provide a value.",
              validate: (value) =>
                value.length > SECRETS_VALUE_LENGTH_LIMIT
                  ? `Value cannot exceed ${SECRETS_VALUE_LENGTH_LIMIT} characters.`
                  : undefined,
            }}
          />
          {errors.value && (
            <div className="invalid-feedback">{errors.value.message}</div>
          )}
        </div>
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
            <PlusLg className={cx("bi", "me-1")} />
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
