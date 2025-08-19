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
import { useCallback, useEffect, useState } from "react";
import { CheckLg, PencilSquare, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import ButtonStyles from "../../components/buttons/Buttons.module.scss";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import type { Environment as SessionEnvironment } from "../sessionsV2/api/sessionLaunchersV2.api";
import { usePatchEnvironmentsByEnvironmentIdMutation } from "../sessionsV2/api/sessionLaunchersV2.api";
import { safeParseJSONStringArray } from "../sessionsV2/session.utils";
import SessionEnvironmentFormContent, {
  SessionEnvironmentForm,
} from "./SessionEnvironmentFormContent";
// import { useUpdateSessionEnvironmentMutation } from "./adminSessions.api";
import { getSessionEnvironmentValues } from "./adminSessions.utils";

interface UpdateSessionEnvironmentButtonProps {
  environment: SessionEnvironment;
}

export default function UpdateSessionEnvironmentButton({
  environment,
}: UpdateSessionEnvironmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button
        className={cx(
          "bg-transparent",
          "shadow-none",
          "border-0",
          ButtonStyles.EditButton
        )}
        onClick={toggle}
      >
        <PencilSquare size={24} />
        <span className="visually-hidden">Edit</span>
      </Button>
      <UpdateSessionEnvironmentModal
        environment={environment}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateSessionEnvironmentModalProps {
  environment: SessionEnvironment;
  isOpen: boolean;
  toggle: () => void;
}

function UpdateSessionEnvironmentModal({
  environment,
  isOpen,
  toggle,
}: UpdateSessionEnvironmentModalProps) {
  const [updateSessionEnvironment, result] =
    usePatchEnvironmentsByEnvironmentIdMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<SessionEnvironmentForm>({
    defaultValues: getSessionEnvironmentValues(environment),
  });
  const onSubmit = useCallback(
    (data: SessionEnvironmentForm) => {
      const commandParsed = safeParseJSONStringArray(data.command);
      const argsParsed = safeParseJSONStringArray(data.args);
      if (commandParsed.parsed && argsParsed.parsed)
        updateSessionEnvironment({
          environmentId: environment.id,
          environmentPatch: {
            container_image: data.container_image,
            default_url: data.default_url?.trim() || "",
            description: data.description?.trim() || "",
            gid: data.gid ?? undefined,
            mount_directory: data.mount_directory?.trim() || undefined,
            name: data.name,
            port: data.port ?? undefined,
            uid: data.uid ?? undefined,
            working_directory: data.working_directory?.trim() || undefined,

            // ...(),

            // command: commandParsed.data,
            // args: argsParsed.data,
          },
        });
    },
    [environment.id, updateSessionEnvironment]
  );

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  useEffect(() => {
    reset(getSessionEnvironmentValues(environment));
  }, [environment, reset]);

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
        <ModalHeader toggle={toggle}>Update session environment</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}
          <SessionEnvironmentFormContent control={control} errors={errors} />
        </ModalBody>
        <ModalFooter>
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button disabled={result.isLoading || !isDirty} type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update Environment
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
