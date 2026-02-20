/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Braces, CheckLg, Plus, XLg } from "react-bootstrap-icons";
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
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { SuccessAlert } from "../../../components/Alert";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../components/Loader";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import type {
  SessionLauncher,
  SessionLauncherPatch,
} from "../api/sessionLaunchersV2.api";
import { usePatchSessionLaunchersByLauncherIdMutation as useUpdateSessionLauncherMutation } from "../api/sessionLaunchersV2.api";
import { validateEnvVariableName } from "../session.utils";

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

function AddEnvVariableButton({
  onAddEnvVariable,
}: {
  onAddEnvVariable: () => void;
}) {
  return (
    <div>
      <Button
        data-cy="add-env-variable-button"
        color="outline-secondary"
        size="sm"
        className="me-2"
        onClick={onAddEnvVariable}
      >
        <Plus className="bi" />
      </Button>
      <span className="text-secondary">Add new environment variable</span>
    </div>
  );
}

function RStudioInfo() {
  return (
    <span className="text-secondary">
      Note: Environment Variables are not visible in RStudio-based environments.
    </span>
  );
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
          name={`envVariables.${index}.name`}
          render={({ field }) => {
            const { ref, ...fieldProps } = field;
            return (
              <Input
                bsSize="sm"
                className={cx(error?.name && "is-invalid")}
                placeholder="MY_ENV_VAR"
                type="text"
                data-cy={`env-variables-input_${index}-name`}
                {...fieldProps}
                innerRef={ref}
              />
            );
          }}
          rules={{
            required: {
              message: "A name is required.",
              value: true,
            },
            maxLength: {
              message: "Name can be at most 256 characters.",
              value: 256,
            },
            pattern: {
              value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              message:
                "A variable name is made up of letters, numbers and '_'.",
            },
            validate: {
              validateEnvVariableName: (value) =>
                validateEnvVariableName(value),
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
          name={`envVariables.${index}.value`}
          render={({ field }) => {
            const { ref, ...fieldProps } = field;
            return (
              <Input
                bsSize="sm"
                className={cx(error?.value && "is-invalid")}
                placeholder="value"
                type="text"
                data-cy={`env-variables-input_${index}-value`}
                {...fieldProps}
                innerRef={ref}
              />
            );
          }}
          rules={{
            maxLength: {
              message: "Value can be at most 500 characters.",
              value: 500,
            },
          }}
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
          size="sm"
        >
          <XLg className="bi" />
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
    append({ name: "", value: "" });
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

  const [hasAddedDefaultValue, setHasAddedDefaultValue] = useState(false);
  useEffect(() => {
    if (
      !isDirty &&
      fields.length < 1 &&
      result.isUninitialized &&
      !hasAddedDefaultValue
    ) {
      append({ name: "", value: "" });
      setHasAddedDefaultValue(true);
    }
  }, [append, fields, hasAddedDefaultValue, isDirty, result]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <Braces className={cx("me-1", "bi")} />
        Environment variables for {launcher.name}
      </ModalHeader>
      <ModalBody>
        {result.isSuccess ? (
          <ConfirmationUpdate />
        ) : fields.length < 1 ? (
          <>
            <p className="fst-italic">
              No environment variables have been defined.
            </p>
            <AddEnvVariableButton onAddEnvVariable={onAddEnvVariable} />
          </>
        ) : (
          <>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              {result.error && <RtkOrDataServicesError error={result.error} />}
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
            <AddEnvVariableButton onAddEnvVariable={onAddEnvVariable} />
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="flex-shrink-1" style={{ width: "20rem" }}>
          <RStudioInfo />
        </div>
        <div className={cx("flex-grow-1", "flex-fill", "text-end")}>
          <Button
            className="me-2"
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
        </div>
      </ModalFooter>
    </ScrollableModal>
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
