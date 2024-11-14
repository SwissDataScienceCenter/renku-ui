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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { usePostSessionSecretSlotsMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";

export default function AddSessionSecretButton() {
  const ref = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <>
      <Button color="outline-primary" innerRef={ref} onClick={toggle} size="sm">
        <PlusLg className="bi" />
      </Button>
      <AddSessionSecretModal isOpen={isOpen} toggle={toggle} />
      <UncontrolledTooltip target={ref}>Add session secret</UncontrolledTooltip>
    </>
  );
}

interface AddSessionSecretModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionSecretModal({ isOpen, toggle }: AddSessionSecretModalProps) {
  const { project } = useProject();
  const { id: projectId } = project;

  const [postSessionSecretSlot, result] = usePostSessionSecretSlotsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddSessionSecretForm>({
    defaultValues: {
      description: "",
      filename: "",
      name: "",
    },
  });

  const submitHandler = useCallback(
    (data: AddSessionSecretForm) => {
      const description = data.description?.trim();
      const name = data.name?.trim();
      postSessionSecretSlot({
        sessionSecretSlotPost: {
          filename: data.filename,
          project_id: projectId,
          description: description ? description : undefined,
          name: name ? name : undefined,
        },
      });
    },
    [postSessionSecretSlot, projectId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

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
        <ModalHeader toggle={toggle}>Add session secret</ModalHeader>
        <ModalBody>
          <p>Add a new slot for a secret to be mounted in sessions.</p>

          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <div className="mt-3">
            <Label for="add-session-secret-name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field: { ref, ...rest } }) => (
                <Input
                  className={cx(errors.name && "is-invalid")}
                  id="add-session-secret-name"
                  innerRef={ref}
                  placeholder="API Token"
                  type="text"
                  {...rest}
                />
              )}
            />
            <div className="invalid-feedback">
              {errors.name?.message ? (
                <>{errors.name?.message}</>
              ) : (
                <>Invalid name</>
              )}
            </div>
          </div>

          <div className="mt-3">
            <Label for="add-session-secret-filename">Filename</Label>
            <Controller
              name="filename"
              control={control}
              render={({ field: { ref, ...rest } }) => (
                <Input
                  aria-describedby="add-session-secret-filename-help"
                  className={cx(errors.filename && "is-invalid")}
                  id="add-session-secret-filename"
                  innerRef={ref}
                  placeholder="api_token"
                  type="text"
                  {...rest}
                />
              )}
              rules={{ required: "Please provide a filename" }}
            />
            <div className="invalid-feedback">
              {errors.filename?.message ? (
                <>{errors.filename?.message}</>
              ) : (
                <>Invalid filename</>
              )}
            </div>
            <FormText id="add-session-secret-filename-help" tag="div">
              This is the filename which will be used when mounting the secret
              inside sessions.
            </FormText>
          </div>

          <div className="mt-3">
            <Label for="add-session-secret-description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  id="add-session-secret-description"
                  className={cx(
                    "form-control",
                    errors.description && "is-invalid"
                  )}
                  placeholder="A short description..."
                  rows={3}
                  {...field}
                />
              )}
            />
            <div className="invalid-feedback">
              {errors.description?.message ? (
                <>{errors.description?.message}</>
              ) : (
                <>Invalid description</>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button color="primary" disabled={result.isLoading} type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add session secret
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface AddSessionSecretForm {
  name: string | undefined;
  description: string | undefined;
  filename: string;
}
