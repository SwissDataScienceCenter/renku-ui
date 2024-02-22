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
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import SessionLauncherFormContent, {
  SessionLauncherForm,
} from "./SessionLauncherFormContent";
import sessionsV2Api, {
  useUpdateSessionLauncherMutation,
} from "./sessionsV2.api";
import {
  SessionLauncher,
  SessionLauncherEnvironment,
} from "./sessionsV2.types";

interface UpdateSessionLauncherModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

export default function UpdateSessionLauncherModal({
  isOpen,
  launcher,
  toggle,
}: UpdateSessionLauncherModalProps) {
  const { data: environments } =
    sessionsV2Api.endpoints.getSessionEnvironments.useQueryState();

  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<SessionLauncherForm>({
    defaultValues: {
      name: launcher.name,
      description: launcher.description ?? "",
      environment_kind: launcher.environment_kind,
      environment_id:
        launcher.environment_kind === "global_environment"
          ? launcher.environment_id
          : "",
      container_image:
        launcher.environment_kind === "container_image"
          ? launcher.container_image
          : "",
    },
  });
  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { description, name } = data;
      const environment: SessionLauncherEnvironment =
        data.environment_kind === "global_environment"
          ? {
              environment_kind: "global_environment",
              environment_id: data.environment_id,
            }
          : {
              environment_kind: "container_image",
              container_image: data.container_image,
            };
      updateSessionLauncher({
        launcherId: launcher.id,
        name,
        description: description.trim() ? description : undefined,
        ...environment,
      });
    },
    [launcher.id, updateSessionLauncher]
  );

  useEffect(() => {
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environment_kind", "container_image");
    }
  }, [environments, setValue]);

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

  useEffect(() => {
    reset({
      name: launcher.name,
      description: launcher.description ?? "",
      environment_kind: launcher.environment_kind,
      environment_id:
        launcher.environment_kind === "global_environment"
          ? launcher.environment_id
          : "",
      container_image:
        launcher.environment_kind === "container_image"
          ? launcher.container_image
          : "",
    });
  }, [launcher, reset]);

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
        <ModalHeader toggle={toggle}>Edit session {launcher.name}</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}

          <SessionLauncherFormContent
            control={control}
            errors={errors}
            watch={watch}
          />
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
            Update session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
