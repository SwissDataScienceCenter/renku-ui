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
    mode: "all",
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
      reset();
    }
  }, [reset, result.isSuccess, toggleModal]);

  return (
    <>
      <Button
        className="btn-outline-rk-green"
        data-cy="secret-edit-button"
        onClick={toggleModal}
      >
        <PencilSquare className={cx("bi", "me-1")} />
        Edit
      </Button>

      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Edit Secret <code>{secret.name}</code>
        </ModalHeader>
        <ModalBody>
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
                      autoComplete="new-password"
                      className={cx(
                        "form-control",
                        "rounded-0",
                        "rounded-start",
                        errors.value && "is-invalid"
                      )}
                      id="edit-secret-value"
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
                  <UncontrolledTooltip
                    placement="top"
                    target="secret-new-show-value"
                  >
                    Hide/show secret value
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
            data-cy="secrets-edit-edit-button"
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            <PencilSquare className={cx("bi", "me-1")} />
            Edit
          </Button>
          <Button
            className="btn-outline-rk-green"
            data-cy="secrets-edit-cancel-button"
            onClick={toggleModal}
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
