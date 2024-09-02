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
import {
  Control,
  Controller,
  FieldErrors,
  RegisterOptions,
} from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";
import { InputType } from "reactstrap/types/lib/Input";
import { MoreInfo } from "../../../../components/MoreInfo";
import { DEFAULT_URL, getFormCustomValuesDesc } from "../../session.utils";
import { SessionLauncherForm } from "../../sessionsV2.types";

type SessionLauncherFieldNames =
  | "container_image"
  | "description"
  | "default_url"
  | "port"
  | "working_directory"
  | "uid"
  | "gid"
  | "mount_directory";

function FormField({
  control,
  name,
  label,
  placeholder,
  errors,
  info,
  type = "text",
  rules,
}: {
  control: Control<SessionLauncherForm>;
  name: SessionLauncherFieldNames;
  label: string;
  placeholder?: string;
  errors?: FieldErrors<SessionLauncherForm>;
  info: string;
  type: InputType;
  rules?: Omit<
    RegisterOptions<SessionLauncherForm, SessionLauncherFieldNames>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
}) {
  return (
    <>
      <Label for={`addSessionLauncher${name}`} className="form-label me-2">
        {label}
      </Label>
      <MoreInfo help={info} />
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
          {errors[name]?.message?.toString()}
        </div>
      )}
    </>
  );
}

function JsonField({
  control,
  name,
  label,
  info,
  errors,
  helpText,
}: {
  control: Control<SessionLauncherForm>;
  name: "args" | "command";
  label: string;
  info: string;
  errors?: FieldErrors<SessionLauncherForm>;
  helpText: string;
}) {
  return (
    <>
      <Label for={`addSessionLauncher${name}`} className="form-label me-2 mb-0">
        {label}
      </Label>
      <MoreInfo help={info} />
      <FormText tag="div">{helpText}</FormText>
      <Controller
        control={control}
        name={name}
        rules={{
          validate: (value) => isValidJSONArrayString(value?.toString()),
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

interface AdvanceSettingsProp {
  control: Control<SessionLauncherForm, unknown>;
  errors?: FieldErrors<SessionLauncherForm>;
}
export function AdvanceSettingsFields({
  control,
  errors,
}: AdvanceSettingsProp) {
  const desc = getFormCustomValuesDesc();
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className="row">
        <div className={cx("col-12", "col-md-9")}>
          <FormField
            control={control}
            name="default_url"
            label="Default URL"
            placeholder={DEFAULT_URL}
            errors={errors}
            info={desc.urlPath}
            type="text"
          />
        </div>
        <div className={cx("col-12", "col-md-3")}>
          <FormField
            control={control}
            name="port"
            label="Port (Optional)"
            placeholder="e.g. 8080"
            errors={errors}
            info={desc.port}
            type="number"
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <FormField
            control={control}
            name="mount_directory"
            label="Mount Directory (Optional)"
            errors={errors}
            info={desc.mountDirectory}
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
          <FormField
            control={control}
            name="working_directory"
            label="Working Directory (Optional)"
            errors={errors}
            info={desc.workingDirectory}
            type="text"
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12", "col-md-6")}>
          <FormField
            control={control}
            name="gid"
            label="GID (Optional)"
            placeholder="e.g. 1000"
            type="number"
            errors={errors}
            info={desc.gid}
            rules={{ min: 1000 }}
          />
        </div>
        <div className={cx("col-12", "col-md-6")}>
          <FormField
            control={control}
            name="uid"
            label="UID (Optional)"
            placeholder="e.g. 1000"
            type="number"
            errors={errors}
            info={desc.uid}
            rules={{ min: 1000 }}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <JsonField
            control={control}
            name="command"
            label="Command ENTRYPOINT (Optional)"
            info={desc.command}
            errors={errors}
            helpText='Please enter a valid JSON array format e.g. ["python3","main.py"]'
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <JsonField
            control={control}
            name="args"
            label="Command Arguments CMD (Optional)"
            info={desc.args}
            errors={errors}
            helpText='Please enter a valid JSON array format e.g. ["--arg1", "--arg2", "--pwd=/home/user"]'
          />
        </div>
      </div>
    </div>
  );
}

function isValidJSONArrayString(value: string): true | string | undefined {
  if (!value?.trim()) return undefined;

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue)
      ? true
      : "Input must be a valid JSON array";
  } catch {
    return "Input must be a valid JSON format";
  }
}
