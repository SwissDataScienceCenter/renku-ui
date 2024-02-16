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
import { useCallback, useEffect } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
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

import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useUpdateSessionV2Mutation } from "./sessionsV2.api";
import { SessionV2 } from "./sessionsV2.types";

interface UpdateSessionV2ModalProps {
  isOpen: boolean;
  session: SessionV2;
  toggle: () => void;
}

export default function UpdateSessionV2Modal({
  isOpen,
  session,
  toggle,
}: UpdateSessionV2ModalProps) {
  const [updateSessionV2, result] = useUpdateSessionV2Mutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<UpdateSessionV2Form>({
    defaultValues: {
      name: session.name,
      description: session.description,
      environment_id: session.environment_id,
    },
  });
  const onSubmit = useCallback(
    (data: UpdateSessionV2Form) => {
      updateSessionV2({
        session_id: session.id,
        name: data.name,
        description: data.description,
        environment_id: data.environment_id,
      });
    },
    [session.id, updateSessionV2]
  );

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader toggle={toggle}>Edit session {session.name}</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addSessionV2Name">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id="addSessionV2Name"
                  placeholder="session name"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for="addSessionV2Description">
              Description
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <textarea
                  className="form-control"
                  id="addSessionV2Description"
                  placeholder="session description"
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Label className="form-label" for="addSessionV2Environment">
              Environment
            </Label>
            <Controller
              control={control}
              name="environment_id"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.environment_id && "is-invalid"
                  )}
                  id="addSessionV2Environment"
                  placeholder="Docker image"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">
              Please provide an environment
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button disabled={result.isLoading || !isDirty} type="submit">
            <CheckLg className={cx("bi", "me-1")} />
            Update session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface UpdateSessionV2Form {
  name: string;
  description?: string;
  environment_id: string;
}
