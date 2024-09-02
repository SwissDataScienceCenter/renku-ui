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
import { useCallback, useEffect, useMemo } from "react";
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
import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import {
  getFormattedEnvironmentValues,
  getLauncherDefaultValues,
} from "../../session.utils";
import {
  useGetSessionEnvironmentsQuery,
  useUpdateSessionLauncherMutation,
} from "../../sessionsV2.api";
import { SessionLauncher, SessionLauncherForm } from "../../sessionsV2.types";
import EditLauncherFormContent from "../SessionForm/EditLauncherFormContent";

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
  const { data: environments } = useGetSessionEnvironmentsQuery();
  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();
  const defaultValues = useMemo(
    () => getLauncherDefaultValues(launcher),
    [launcher]
  );

  const {
    control,
    formState: { errors, isDirty, touchedFields },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<SessionLauncherForm>({
    defaultValues,
  });
  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { description, name } = data;
      const environment = getFormattedEnvironmentValues(data);
      updateSessionLauncher({
        launcherId: launcher.id,
        name,
        description: description.trim() ? description : undefined,
        environment,
      });
    },
    [launcher.id, updateSessionLauncher]
  );

  useEffect(() => {
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environment_kind", "CUSTOM");
    }
  }, [environments, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  useEffect(() => {
    reset(defaultValues);
  }, [launcher, reset, defaultValues]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
      scrollable
    >
      <ModalHeader toggle={toggle}>
        Edit session launcher {launcher.name}
      </ModalHeader>
      <ModalBody>
        {result.isSuccess ? (
          <ConfirmationUpdate />
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {result.error && <RtkErrorAlert error={result.error} />}
            <EditLauncherFormContent
              control={control}
              errors={errors}
              watch={watch}
              touchedFields={touchedFields}
              environmentId={launcher.environment?.id}
              setValue={setValue}
            />
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="close-cancel-button"
          color="outline-primary"
          onClick={toggle}
        >
          <XLg className={cx("bi", "me-1")} />
          {result.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!result.isSuccess && (
          <Button
            color="primary"
            data-cy="edit-session-button"
            disabled={result.isLoading || !isDirty}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update session launcher
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

const ConfirmationUpdate = () => {
  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <p className="fw-bold">Session launcher updated successfully!</p>
      <p className="mb-0">
        The changes will take effect the next time you launch a session with
        this launcher. Current sessions will not be affected.
      </p>
    </SuccessAlert>
  );
};
