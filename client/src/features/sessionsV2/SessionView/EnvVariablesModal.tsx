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
  useWatch,
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
import { RemotePoolEnvVariablesInfo } from "../components/RemotePoolEnvVariables";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
  getLauncherChangeEffectMessage,
  validateEnvVariableName,
} from "../session.utils";
import type { LauncherCategory } from "../sessionsV2.types";

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
  form: EnvVariablesForm,
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
    <Button
      data-cy="add-env-variable-button"
      color="outline-primary"
      size="sm"
      className="me-2"
      onClick={onAddEnvVariable}
    >
      <Plus className="me-1" />
      Add new environment variable
    </Button>
  );
}

function RStudioInfo() {
  return (
    <p className="text-muted">
      Note: Environment Variables are not visible in RStudio-based environments.
    </p>
  );
}

interface EnvVariablesFormContentProps {
  control: Control<EnvVariablesForm, unknown>;
  errors: FieldErrors<EnvVariablesForm>;
  index: number;
  /** Called after any input in the row changes. */
  onChange?: () => void;
  register: UseFormRegister<EnvVariablesForm>;
  remove: UseFieldArrayRemove;
}

function EditEnvVariablesFormContent({
  control,
  errors,
  index,
  onChange,
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
            const { ref, onChange: onFieldChange, ...fieldProps } = field;
            return (
              <Input
                bsSize="sm"
                className={cx(error?.name && "is-invalid")}
                placeholder="MY_ENV_VAR"
                type="text"
                data-cy={`env-variables-input_${index}-name`}
                {...fieldProps}
                innerRef={ref}
                onChange={(event) => {
                  onFieldChange(event);
                  onChange?.();
                }}
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
            const { ref, onChange: onFieldChange, ...fieldProps } = field;
            return (
              <Input
                bsSize="sm"
                className={cx(error?.value && "is-invalid")}
                placeholder="value"
                type="text"
                data-cy={`env-variables-input_${index}-value`}
                {...fieldProps}
                innerRef={ref}
                onChange={(event) => {
                  onFieldChange(event);
                  onChange?.();
                }}
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
  const launcherCategory = getLauncherCategory(launcher);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);
  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();
  const defaultValues = useMemo(
    () => getLauncherDefaultValues(launcher),
    [launcher],
  );

  const {
    control,
    formState: { errors, isDirty },
    getValues,
    handleSubmit,
    register,
    reset,
    setFocus,
    setValue,
  } = useForm<EnvVariablesForm>({
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "envVariables", // unique name for your Field Array
  });

  // Clear any previous success or error message once the user edits again.
  const { isUninitialized: isResultUninitialized, reset: resetResult } = result;
  const onFormChange = useCallback(() => {
    if (!isResultUninitialized) resetResult();
  }, [isResultUninitialized, resetResult]);

  const onAddEnvVariable = useCallback(() => {
    append({ name: "", value: "" });
    onFormChange();
  }, [append, onFormChange]);

  // Add a variable required by the resource pool, reusing an empty row if any
  const envVariables = useWatch({ control, name: "envVariables" });
  const onAddRequiredEnvVariable = useCallback(
    (name: string) => {
      const current = getValues("envVariables");
      const emptyIndex = current.findIndex(
        (env) => env.name === "" && env.value === "",
      );
      if (emptyIndex >= 0) {
        setValue(`envVariables.${emptyIndex}.name`, name, {
          shouldDirty: true,
        });
        setFocus(`envVariables.${emptyIndex}.value`);
      } else {
        append(
          { name, value: "" },
          { focusName: `envVariables.${current.length}.value` },
        );
      }
      onFormChange();
    },
    [append, getValues, onFormChange, setFocus, setValue],
  );

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
    [launcher.id, updateSessionLauncher],
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
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <>
          <RemotePoolEnvVariablesInfo
            envVariables={envVariables}
            onAddEnvVariable={onAddRequiredEnvVariable}
            resourceClassId={launcher.resource_class_id}
          />
          <RStudioInfo />
          {result.isSuccess && (
            <ConfirmationUpdate launcherCategory={launcherCategory} />
          )}
          {fields.length < 1 ? (
            <>
              <p className="fst-italic">
                No environment variables have been defined.
              </p>
              <AddEnvVariableButton onAddEnvVariable={onAddEnvVariable} />
            </>
          ) : (
            <>
              <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                {result.error && (
                  <RtkOrDataServicesError error={result.error} />
                )}
                {fields.map((field, index) => (
                  <EditEnvVariablesFormContent
                    key={field.id}
                    errors={errors}
                    index={index}
                    control={control}
                    onChange={onFormChange}
                    register={register}
                    remove={remove}
                  />
                ))}
              </Form>

              <AddEnvVariableButton onAddEnvVariable={onAddEnvVariable} />
            </>
          )}
        </>
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="close-cancel-button"
          color="outline-primary"
          onClick={toggle}
        >
          <XLg className="me-1" />
          {result.isSuccess ? "Close" : "Cancel"}
        </Button>
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
            <CheckLg className="me-1" />
          )}
          Update {launcherDefinition.text.inline} launcher
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

const ConfirmationUpdate = ({
  launcherCategory,
}: {
  launcherCategory: LauncherCategory;
}) => {
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);
  return (
    <div data-cy="session-launcher-update-success">
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="fw-bold">
          {launcherDefinition.text.display} launcher updated successfully!
        </p>
        <p className="mb-0" data-cy="launcher-change-effect">
          {getLauncherChangeEffectMessage(launcherCategory)}
        </p>
      </SuccessAlert>
    </div>
  );
};
