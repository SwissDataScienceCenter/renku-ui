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
import {
  EyeFill,
  EyeSlashFill,
  PencilSquare,
  XLg,
} from "react-bootstrap-icons";
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

import { useEditSecretMutation } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { EditSecretForm, SecretDetails } from "./secrets.types";
import { SECRETS_VALUE_LENGTH_LIMIT } from "./secrets.utils";

interface SecretsEditProps {
  secret: SecretDetails;
}
export default function SecretEdit({ secret }: SecretsEditProps) {
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
  } = useForm<EditSecretForm>({
    defaultValues: {
      value: "",
    },
  });

  // Handle posting data
  const [editSecretMutation, result] = useEditSecretMutation();
  const onSubmit = useCallback(
    (newSecret: EditSecretForm) => {
      editSecretMutation({ id: secret.id, ...newSecret });
    },
    [editSecretMutation, secret.id]
  );

  // Automatically close the modal when the secret is modified
  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
      setShowPlainText(false);
      reset();
    }
  }, [reset, result.isSuccess, toggleModal]);

  return (
    <>
      <Button
        className={cx("btn-outline-rk-green", "text-nowrap")}
        data-cy="secret-edit-button"
        onClick={toggleModal}
        size="sm"
      >
        <PencilSquare className={cx("bi", "me-1")} />
        Replace
      </Button>

      <Modal
        backdrop="static"
        centered
        fullscreen="md"
        isOpen={showModal}
        size="md"
        toggle={toggleModal}
      >
        <ModalHeader toggle={toggleModal}>
          Replace Secret <code>{secret.name}</code>
        </ModalHeader>
        <ModalBody>
          <p>
            Here you can replace the value. The change will apply only to new
            sessions. If you need to rename, please delete the secret and create
            a new one.
          </p>
          <p>Values are limited to 5000 characters.</p>
          <Form
            className="form-rk-green"
            data-cy="secrets-edit-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-3">
              <Label className="form-label" for="edit-secret-value">
                Value
              </Label>
              <InputGroup>
                <Controller
                  control={control}
                  name="value"
                  render={({ field }) => (
                    <Input
                      id="edit-secret-value"
                      type={showPlainText ? "textarea" : "password"}
                      {...field}
                      autoComplete="off one-time-code"
                      className={cx(
                        "rounded-0",
                        "rounded-start",
                        errors.value && "is-invalid"
                      )}
                      spellCheck="false"
                      {...(showPlainText ? { rows: 6 } : {})}
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
                  <UncontrolledTooltip
                    placement="top"
                    target="secret-new-show-value"
                  >
                    {showPlainText ? "Hide secret value" : "Show secret value"}
                  </UncontrolledTooltip>
                </Button>
                {errors.value && (
                  <div className="invalid-feedback">{errors.value.message}</div>
                )}
              </InputGroup>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          {result.isError && (
            <div className={cx("mb-2", "w-100")}>
              <RtkOrNotebooksError error={result.error} />
            </div>
          )}
          <Button
            className="btn-outline-rk-green"
            data-cy="secrets-edit-cancel-button"
            onClick={toggleModal}
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            data-cy="secrets-edit-edit-button"
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            <PencilSquare className={cx("bi", "me-1")} />
            Replace
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
