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
import { ReactNode } from "react";
import {
  Control,
  Controller,
  ControllerProps,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";
import { InputType } from "reactstrap/types/lib/Input";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import { MoreInfo } from "../../../../components/MoreInfo";
import { SessionEnvironmentForm } from "../../../admin/SessionEnvironmentFormContent";
import {
  DEFAULT_URL,
  ENVIRONMENT_VALUES_DESCRIPTION,
} from "../../session.constants";
import { isValidJSONStringArray } from "../../session.utils";
import { SessionLauncherForm } from "../../sessionsV2.types";

function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  errors,
  info,
  type = "text",
  rules,
}: {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  placeholder?: string;
  errors?: FieldErrors<T>;
  info: string;
  type: InputType;
  rules?: ControllerProps<T>["rules"];
}) {
  return (
    <>
      <Label
        for={`addSessionLauncher${name}`}
        className={cx("form-label", "me-2")}
      >
        {label}
      </Label>
      <MoreInfo>
        <LazyRenkuMarkdown markdownText={info} />
      </MoreInfo>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <Input
            id={`addSessionLauncher${name}`}
            type={type}
            placeholder={placeholder}
            className={cx(errors?.[name] && "is-invalid")}
            {...field}
          />
        )}
      />
      {errors?.[name] && (
        <div className="invalid-feedback d-block">
          {errors[name]?.message
            ? errors[name]?.message?.toString()
            : `Please provide a valid value for ${name}`}
        </div>
      )}
    </>
  );
}

interface JsonFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  info: string;
  errors?: FieldErrors<T>;
  helpText: string;
}

function JsonField<T extends FieldValues>({
  control,
  name,
  label,
  info,
  errors,
  helpText,
}: JsonFieldProps<T>) {
  return (
    <>
      <Label for={`addSessionLauncher${name}`} className="form-label me-2 mb-0">
        {label}
      </Label>
      <MoreInfo>
        <LazyRenkuMarkdown markdownText={info} />
      </MoreInfo>
      <FormText tag="div">{helpText}</FormText>
      <Controller
        control={control}
        name={name}
        rules={{
          validate: (value) => isValidJSONStringArray(value?.toString()),
        }}
        render={({ field }) => (
          <textarea
            className={cx("w-100 form-control", errors?.[name] && "is-invalid")}
            id={`addSessionLauncher${name}`}
            rows={2}
            defaultValue={field.value ? JSON.stringify(field.value) : ""}
            {...field}
          />
        )}
      />
      {errors?.[name] && (
        <div className="invalid-feedback mt-0 d-block">
          {errors[name]?.message?.toString()}
        </div>
      )}
    </>
  );
}

interface AdvancedSettingsProp<T extends FieldValues> {
  control: Control<T, unknown>;
  errors?: FieldErrors<T>;
}

export function AdvancedSettingsFields<
  T extends SessionLauncherForm | SessionEnvironmentForm
>({ control, errors }: AdvancedSettingsProp<T>) {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className="row">
        <div className={cx("col-12", "col-md-9")}>
          <FormField<T>
            control={control}
            name={"default_url" as Path<T>}
            label="Default URL"
            placeholder={DEFAULT_URL}
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.urlPath}
            type="text"
          />
        </div>
        <div className={cx("col-12", "col-md-3")}>
          <FormField<T>
            control={control}
            name={"port" as Path<T>}
            label="Port (Optional)"
            placeholder="e.g. 8080"
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.port}
            type="number"
            rules={{
              min: 1,
              max: 65535,
            }}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <FormField<T>
            control={control}
            name={"mount_directory" as Path<T>}
            label="Mount Directory (Optional)"
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.mountDirectory}
            type="text"
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <Label className={cx("form-label", "me-2", "fw-bold")}>
            Docker settings
          </Label>
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <FormField<T>
            control={control}
            name={"working_directory" as Path<T>}
            label="Working Directory (Optional)"
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.workingDirectory}
            type="text"
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12", "col-md-6")}>
          <FormField<T>
            control={control}
            name={"uid" as Path<T>}
            label="UID (Optional)"
            placeholder="e.g. 1000"
            type="number"
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.uid}
            rules={{ min: 1, max: 65535 }}
          />
        </div>
        <div className={cx("col-12", "col-md-6")}>
          <FormField<T>
            control={control}
            name={"gid" as Path<T>}
            label="GID (Optional)"
            placeholder="e.g. 1000"
            type="number"
            errors={errors}
            info={ENVIRONMENT_VALUES_DESCRIPTION.gid}
            rules={{ min: 1, max: 65535 }}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <JsonField<T>
            control={control}
            name={"command" as Path<T>}
            label="Command ENTRYPOINT (Optional)"
            info={ENVIRONMENT_VALUES_DESCRIPTION.command}
            errors={errors}
            helpText='Please enter a valid JSON array format e.g. ["python3","main.py"]'
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <JsonField<T>
            control={control}
            name={"args" as Path<T>}
            label="Command Arguments CMD (Optional)"
            info={ENVIRONMENT_VALUES_DESCRIPTION.args}
            errors={errors}
            helpText='Please enter a valid JSON array format e.g. ["--arg1", "--arg2", "--pwd=/home/user"]'
          />
        </div>
      </div>
    </div>
  );
}