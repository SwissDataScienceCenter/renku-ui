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
import { EyeFill, EyeSlashFill, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import secretsApi, { useAddSecretMutation } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { AddSecretForm } from "./secrets.types";

export default function SecretsNew() {
  // Set up the modal
  const [showModal, setShowModal] = useState(false);
  const toggleModal = useCallback(() => {
    setShowModal((showModal) => !showModal);
  }, []);

  // Hide/show the secret value
  const [showPlainText, setShowPlainText] = useState(false);
  const toggleShowPlainText = useCallback(() => {
    setShowPlainText((showPlainText) => !showPlainText);
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
    },
    mode: "all",
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
      getSecrets();
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
    <Form className="form-rk-green" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <Label className="form-label" for="new-secret-name">
          Name
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.name && "is-invalid")}
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
                : !/^[a-zA-Z0-9_-]+$/.test(value)
                ? "Only letters, numbers, underscores (_), and dashes (-)."
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
        <InputGroup>
          <Controller
            control={control}
            name="value"
            render={({ field }) => (
              <Input
                className={cx(
                  "form-control",
                  "rounded-0",
                  "rounded-start",
                  errors.value && "is-invalid"
                )}
                id="new-secret-value"
                placeholder="Value"
                type={showPlainText ? "text" : "password"}
                {...field}
              />
            )}
            rules={{
              required: "Please provide a value.",
            }}
          />
          <Button
            className="rounded-end"
            id="secret-new-show-value"
            onClick={() => toggleShowPlainText()}
          >
            {showPlainText ? (
              <EyeFill className="bi" />
            ) : (
              <EyeSlashFill className="bi" />
            )}
            <UncontrolledTooltip placement="top" target="secret-new-show-value">
              Hide/show secret value
            </UncontrolledTooltip>
          </Button>
        </InputGroup>
        {errors.value && (
          <div className="invalid-feedback">{errors.value.message}</div>
        )}
      </div>
    </Form>
  );

  return (
    <>
      <div className="mb-2">
        <Button
          id="new-secret-button"
          className="btn-outline-rk-green"
          onClick={toggleModal}
        >
          <PlusLg className={cx("bi", "me-1")} />
          Add New Secret
        </Button>
      </div>
      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Add New Secret</ModalHeader>
        <ModalBody>{modalBody}</ModalBody>
        <ModalFooter>
          {result.isError && (
            <div className={cx("mb-2", "w-100")}>
              <RtkOrNotebooksError error={result.error} />
            </div>
          )}
          <Button
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            <PlusLg className={cx("bi", "me-1")} />
            Add
          </Button>
          <Button className="btn-outline-rk-green" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
