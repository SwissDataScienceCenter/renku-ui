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
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
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
import DescriptionField from "./fields/DescriptionField";
import FilenameField from "./fields/FilenameField";
import NameField from "./fields/NameField";

export default function AddSessionSecretButton() {
  const ref = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <>
      <Button color="outline-primary" innerRef={ref} onClick={toggle} size="sm">
        <PlusLg className="bi" />
        <span className="visually-hidden">Add session secret slot</span>
      </Button>
      <AddSessionSecretModal isOpen={isOpen} toggle={toggle} />
      <UncontrolledTooltip target={ref}>
        Add session secret slot
      </UncontrolledTooltip>
    </>
  );
}

interface AddSessionSecretModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionSecretModal({ isOpen, toggle }: AddSessionSecretModalProps) {
  const { project } = useProject();
  const { id: projectId, secrets_mount_directory: secretsMountDirectory } =
    project;

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
        <ModalHeader toggle={toggle}>Add session secret slot</ModalHeader>
        <ModalBody>
          <p>Add a new slot for a secret to be mounted in sessions.</p>

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
          <Button color="primary" disabled={result.isLoading} type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add session secret slot
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