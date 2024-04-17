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
import { PencilSquare, XLg } from "react-bootstrap-icons";
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

import { useEditSecretMutation } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { EditSecretForm } from "./secrets.types";
interface SecretsEditProps {
  secretId: string;
}
export default function SecretEdit({ secretId }: SecretsEditProps) {
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
      editSecretMutation({ id: secretId, ...newSecret });
    },
    [editSecretMutation, secretId]
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
      <Button className="btn-outline-rk-green" onClick={toggleModal}>
        <PencilSquare className={cx("bi", "me-1")} />
        Edit
      </Button>

      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Edit Secret <code>{secretId}</code>
        </ModalHeader>
        <ModalBody>
          <Form className="form-rk-green" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <Label className="form-label" for="editSecretValue">
                Value
              </Label>
              <Controller
                control={control}
                name="value"
                render={({ field }) => (
                  <Input
                    className={cx("form-control", errors.value && "is-invalid")}
                    id="editSecretValue"
                    placeholder="Value"
                    type="text"
                    {...field}
                  />
                )}
                rules={{
                  required: "Please provide a value.",
                }}
              />
              {errors.value && (
                <div className="invalid-feedback">{errors.value.message}</div>
              )}
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
            disabled={result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            <PencilSquare className={cx("bi", "me-1")} />
            Edit
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
