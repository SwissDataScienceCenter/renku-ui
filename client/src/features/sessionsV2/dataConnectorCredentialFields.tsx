/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useState } from "react";
import {
  ArrowRepeat,
  ChevronRight,
  EyeFill,
  EyeSlashFill,
  KeyFill,
} from "react-bootstrap-icons";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  Button,
  Input,
  InputGroup,
  Label,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "~/components/Loader";
import { usePostStorageSchemaTestConnectionMutation } from "../cloudStorage/api/projectCloudStorage.api";
import { CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE } from "../cloudStorage/projectCloudStorage.constants";
import type { CloudStorageDetailsOptions } from "../cloudStorage/projectCloudStorage.types";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";

export type DataConnectorCredentialContext = "session" | "job" | "storage";

export const DATA_CONNECTOR_CREDENTIAL_STRINGS = {
  session: {
    continueButton: "Test connection",
    dataCy: "session-data-connector-credentials-modal",
    header: "Session Storage Credentials",
    testError:
      "The data connector could not be mounted. Please retry with different credentials, or skip the data connector. If you skip, the data connector will not be mounted in the session.",
  },
  job: {
    continueButton: "Test connection",
    dataCy: "job-data-connector-credentials-modal",
    header: "Job Storage Credentials",
    testError:
      "The data connector could not be mounted. Please retry with different credentials, or skip the data connector. If you skip, the data connector will not be mounted in the job.",
  },
  storage: {
    continueButton: "Test and Save",
    dataCy: "data-connector-credentials-modal",
    header: "Data Connector Credentials",
    testError:
      "The data connector could not be mounted. Please try different credentials or rely on providing credentials at session launch time.",
  },
} as const;

export type ConnectionTestResult = ReturnType<
  typeof usePostStorageSchemaTestConnectionMutation
>[1];

export function credentialConfigAfterSubmit(
  config: DataConnectorConfiguration,
  options: CloudStorageDetailsOptions,
): DataConnectorConfiguration {
  const next: DataConnectorConfiguration = {
    ...config,
    active: true,
    skip: false,
    touched: true,
  };
  const sensitiveFieldValues = { ...next.sensitiveFieldValues };
  const { saveCredentials, ...fields } = options;
  if (saveCredentials === true || saveCredentials === false) {
    next.saveCredentials = saveCredentials;
  }
  Object.entries(fields).forEach(([key, value]) => {
    if (value != undefined && value !== "") {
      sensitiveFieldValues[key] = "" + value;
    }
  });
  next.sensitiveFieldValues = sensitiveFieldValues;
  return next;
}

export function CredentialsTestError({
  context,
  validationResult,
}: {
  context: DataConnectorCredentialContext;
  validationResult: ConnectionTestResult;
}) {
  if (!validationResult.isError) return null;
  return (
    <div className="mt-3">
      <div className="text-danger">
        {DATA_CONNECTOR_CREDENTIAL_STRINGS[context].testError}
      </div>
    </div>
  );
}

export function ConnectionTestButton({
  className,
  context,
  validationResult,
}: {
  className?: string;
  context: DataConnectorCredentialContext;
  validationResult: ConnectionTestResult;
}) {
  return (
    <Button
      className={className}
      color={validationResult.isError ? "danger" : "primary"}
      disabled={validationResult.isLoading}
      type="submit"
    >
      {validationResult.isLoading ? (
        <span>
          Testing <Loader inline size={16} />
        </span>
      ) : validationResult.isError ? (
        <span>
          <ArrowRepeat className="bi" /> Retry
        </span>
      ) : (
        <span>
          {DATA_CONNECTOR_CREDENTIAL_STRINGS[context].continueButton}{" "}
          <ChevronRight className={cx("bi", "ms-1")} />
        </span>
      )}
    </Button>
  );
}

interface CredentialFieldControl {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function SaveCredentialsInput({
  context,
  control,
  idPrefix,
}: CredentialFieldControl & {
  context: DataConnectorCredentialContext;
  idPrefix?: string;
}) {
  const targetLabel = context === "job" ? "jobs" : "sessions";
  const inputId = domId(idPrefix, "saveCredentials");
  return (
    <div className="mb-3">
      <Controller
        name="saveCredentials"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <Input
            id={inputId}
            className="form-check-input"
            checked={field.value}
            innerRef={field.ref}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            type="checkbox"
          />
        )}
      />
      <Label className={cx("form-check-label", "ms-2")} htmlFor={inputId}>
        Save credentials for future {targetLabel}
      </Label>
    </div>
  );
}

interface SensitiveFieldWidgetProps extends CredentialFieldControl {
  dataConnectorConfig: DataConnectorConfiguration;
  context: DataConnectorCredentialContext;
  credentialFieldDict: Record<string, string>;
  field: {
    name: string;
    friendlyName: string;
  };
  idPrefix?: string;
}

export function SensitiveFieldWidget({
  dataConnectorConfig,
  credentialFieldDict,
  context,
  control,
  field,
  idPrefix,
}: SensitiveFieldWidgetProps) {
  const savedValue = credentialFieldDict[field.name];
  if (context === "storage" && savedValue != null) {
    return (
      <SensitiveFieldInput
        key={field.name}
        control={control}
        defaultValue={CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE}
        friendlyName={field.friendlyName}
        idPrefix={idPrefix}
        name={field.name}
        showPasswordInitially={true}
      />
    );
  }
  return (
    <SensitiveFieldInput
      key={field.name}
      control={control}
      defaultValue={dataConnectorConfig.sensitiveFieldValues[field.name] ?? ""}
      friendlyName={field.friendlyName}
      idPrefix={idPrefix}
      name={field.name}
    />
  );
}

function SensitiveFieldInput({
  control,
  defaultValue,
  friendlyName,
  idPrefix,
  name,
  showPasswordInitially = false,
}: CredentialFieldControl & {
  defaultValue: string | undefined;
  friendlyName: string;
  idPrefix?: string;
  name: string;
  showPasswordInitially?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(showPasswordInitially);
  const toggleShowPassword = useCallback(() => {
    setShowPassword((current) => !current);
  }, []);
  const inputId = domId(idPrefix, name);
  const tooltipContainerId = `option-is-secret-${inputId}`;
  const toggleId = `show-password-${inputId}`;

  return (
    <div className="mb-3">
      <Label htmlFor={inputId}>
        {friendlyName ?? name}
        <div id={tooltipContainerId} className="d-inline">
          <KeyFill className={cx("bi", "ms-1")} />
        </div>
      </Label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <InputGroup className={cx(fieldState.error && "is-invalid")}>
            <Input
              {...field}
              id={inputId}
              type={showPassword ? "text" : "password"}
              className={cx(
                "form-control",
                "rounded-0",
                "rounded-start",
                fieldState.error && "is-invalid",
              )}
              placeholder={""}
            />
            <Button
              className="rounded-end"
              id={toggleId}
              onClick={toggleShowPassword}
            >
              {showPassword ? (
                <EyeFill className="bi" />
              ) : (
                <EyeSlashFill className="bi" />
              )}
              <UncontrolledTooltip placement="top" target={toggleId}>
                Hide/show sensitive data
              </UncontrolledTooltip>
            </Button>
          </InputGroup>
        )}
        rules={{
          required: true,
          validate: {
            nonEmpty: (value) => value.trim().length > 0,
            provided: (value) =>
              value !== CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE,
          },
        }}
      />
      <div className="invalid-feedback">Please provide a value for {name}</div>
    </div>
  );
}

function domId(idPrefix: string | undefined, name: string): string {
  return idPrefix ? `${idPrefix}-${name}` : name;
}
