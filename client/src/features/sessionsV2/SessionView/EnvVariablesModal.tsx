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
import { Control, Controller, FieldErrors, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { SuccessAlert } from "../../../components/Alert";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import type {
  SessionLauncher,
  SessionLauncherPatch,
} from "../api/sessionLaunchersV2.api";
import { usePatchSessionLaunchersByLauncherIdMutation as useUpdateSessionLauncherMutation } from "../api/sessionLaunchersV2.api";

import { Input, Label } from "reactstrap";

interface EnvVariablesForm {
  envVariables: string;
}

function getLauncherDefaultValues(launcher: SessionLauncher): EnvVariablesForm {
  const envVariables = JSON.stringify(launcher.env_variables, null, 2);
  return {
    envVariables,
  };
}

function getPatchFromForm(
  form: EnvVariablesForm
):
  | { error: string; env_variables: null }
  | { error: null; env_variables: SessionLauncherPatch["env_variables"] } {
  try {
    const env_variables = JSON.parse(
      form.envVariables.replace(/'/g, '"')
    ) as Record<string, string>;
    return {
      error: null,
      env_variables,
    };
  } catch (error) {
    return {
      error: "Invalid JSON",
      env_variables: null,
    };
  }
}

function validateEnvVariables(envVariables: string): string | boolean {
  const { error } = getPatchFromForm({
    envVariables,
  });
  return error ?? true;
}

interface EnvVariablesFormContentProps {
  control: Control<EnvVariablesForm, unknown>;
  errors: FieldErrors<EnvVariablesForm>;
}

function EditEnvVariablesFormContent({
  control,
  errors,
}: EnvVariablesFormContentProps) {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div>
        <Label className="form-label" for="envVariablesInput">
          Env Variables
        </Label>
        <Controller
          control={control}
          name="envVariables"
          render={({ field }) => (
            <Input
              className={cx(errors.envVariables && "is-invalid")}
              id="envVariablesInput"
              placeholder='{"MY_ENV_VAR": "my_value"}'
              type="text"
              data-cy="edit-env-variables-input"
              {...field}
            />
          )}
          rules={{ required: true, validate: validateEnvVariables }}
        />
        <div className="invalid-feedback">Please input valid JSON</div>
      </div>
    </div>
  );
}

interface EnvVariablesModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

export default function EnvVariablesModal({
  isOpen,
  launcher,
  toggle,
}: EnvVariablesModalProps) {
  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();
  const defaultValues = useMemo(
    () => getLauncherDefaultValues(launcher),
    [launcher]
  );

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<EnvVariablesForm>({
    defaultValues,
  });
  const onSubmit = useCallback(
    (data: EnvVariablesForm) => {
      const { error, env_variables } = getPatchFromForm(data);
      if (error == null)
        updateSessionLauncher({
          launcherId: launcher.id,
          sessionLauncherPatch: {
            env_variables,
          },
        });
    },
    [launcher.id, updateSessionLauncher]
  );

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
        Env variables for {launcher.name}
      </ModalHeader>
      <ModalBody>
        {result.isSuccess ? (
          <ConfirmationUpdate />
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {result.error && <RtkErrorAlert error={result.error} />}
            <EditEnvVariablesFormContent control={control} errors={errors} />
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
    <div data-cy="session-launcher-update-success">
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="fw-bold">Session launcher updated successfully!</p>
        <p className="mb-0">
          The changes will take effect the next time you launch a session with
          this launcher. Current sessions will not be affected.
        </p>
      </SuccessAlert>
    </div>
  );
};
