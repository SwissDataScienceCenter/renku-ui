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
import { CheckLg, PlusLg, XLg } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFieldArrayRemove,
  type UseFormRegister,
} from "react-hook-form";
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

import { Input } from "reactstrap";

interface EnvVariable {
  name: string;
  value: string;
}

interface EnvVariablesForm {
  envVariables: EnvVariable[];
}

function getLauncherDefaultValues(launcher: SessionLauncher): EnvVariablesForm {
  if (launcher.env_variables == null) return { envVariables: [] };
  const envVariables = launcher.env_variables.map((env) => ({
    name: env.name,
    value: env.value ?? "",
  }));
  return { envVariables };
}

function getPatchFromForm(
  form: EnvVariablesForm
):
  | { error: string; env_variables: null }
  | { error: null; env_variables: SessionLauncherPatch["env_variables"] } {
  const env_variables = form.envVariables.map((env) => ({
    name: env.name,
    value: env.value.length < 1 ? undefined : env.value,
  }));
  return {
    error: null,
    env_variables,
  };
}

function validateEnvVariableName(name: string): string | boolean {
  if (name.toUpperCase().startsWith("RENKU")) {
    return "Variable names cannot start with 'RENKU'.";
  }
  return true;
}

interface EnvVariablesFormContentProps {
  control: Control<EnvVariablesForm, unknown>;
  errors: FieldErrors<EnvVariablesForm>;
  index: number;
  register: UseFormRegister<EnvVariablesForm>;
  remove: UseFieldArrayRemove;
}

function EditEnvVariablesFormContent({
  control,
  errors,
  index,
  register,
  remove,
}: EnvVariablesFormContentProps) {
  const onRemove = useCallback(() => {
    remove(index);
  }, [remove, index]);
  const error = errors.envVariables ? errors.envVariables[index] : undefined;
  return (
    <div className={cx("d-flex", "gap-3", "mb-3")}>
      <div className="flex-grow-1">
        <Controller
          control={control}
          {...register(`envVariables.${index}.name`)}
          render={({ field }) => (
            <Input
              className={cx(error?.name && "is-invalid")}
              placeholder="MY_ENV_VAR"
              type="text"
              data-cy={`env-variables-input_${index}-name`}
              {...field}
            />
          )}
          rules={{
            required: true,
            maxLength: 256,
            pattern: {
              value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              message:
                "A variable name is made up of letters, numbers and '_'.",
            },
            validate: {
              startWithRenku: (value) => validateEnvVariableName(value),
            },
          }}
        />
        <div className="invalid-feedback">
          {error?.name?.message ?? "Please input valid name."}
        </div>
      </div>
      <div className="flex-grow-1">
        <Controller
          control={control}
          {...register(`envVariables.${index}.value`)}
          render={({ field }) => (
            <Input
              className={cx(error?.value && "is-invalid")}
              placeholder="value"
              type="text"
              data-cy={`env-variables-input_${index}-value`}
              {...field}
              rules={{
                maxLength: 500,
              }}
            />
          )}
        />
        <div className="invalid-feedback">
          {error?.value?.message ?? "Please input valid value."}
        </div>
      </div>
      <div>
        <Button
          data-cy={`env-variables-input_${index}-remove`}
          color="outline-danger"
          onClick={onRemove}
        >
          <XLg className={cx("bi", "me-1")} />
        </Button>
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
    register,
    reset,
  } = useForm<EnvVariablesForm>({
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "envVariables", // unique name for your Field Array
  });

  const onAddEnvVariable = useCallback(() => {
    append({ name: "NAME", value: "a value" });
  }, [append]);

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
            {fields.map((field, index) => (
              <EditEnvVariablesFormContent
                key={field.id} // important to include key with field's id
                errors={errors}
                index={index}
                control={control}
                register={register}
                remove={remove}
              />
            ))}
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="add-env-variable-button"
          color="outline-primary"
          onClick={onAddEnvVariable}
        >
          <PlusLg className={cx("bi", "me-1")} />
          Add
        </Button>
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
