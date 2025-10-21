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
 * limitations under the License
 */

import cx from "classnames";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRepeat,
  ChevronRight,
  Eraser,
  EyeFill,
  EyeSlashFill,
  KeyFill,
  SkipForward,
  XLg,
} from "react-bootstrap-icons";
import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { User } from "../../model/renkuModels.types";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";

import { validationParametersFromDataConnectorConfiguration } from "../dataConnectorsV2/components/dataConnector.utils";
import { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { usePostStorageSchemaTestConnectionMutation } from "../project/components/cloudStorage/api/projectCloudStorage.api";
import { CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE } from "../project/components/cloudStorage/projectCloudStorage.constants";
import type { CloudStorageDetailsOptions } from "../project/components/cloudStorage/projectCloudStorage.types";
import { storageSecretNameToFieldName } from "../secretsV2/secrets.utils";

const CONTEXT_STRINGS = {
  session: {
    continueButton: "Continue",
    dataCy: "session-data-connector-credentials-modal",
    header: "Session Storage Credentials",
    testError:
      "The data connector could not be mounted. Please retry with different credentials, or skip the test. If you skip, the data connector will still try to mount, using the provided credentials, at session launch time.",
  },
  storage: {
    continueButton: "Test and Save",
    dataCy: "data-connector-credentials-modal",
    header: "Data Connector Credentials",
    testError:
      "The data connector could not be mounted. Please try different credentials or rely on providing credentials at session launch time.",
  },
};

function ClearCredentialsButton({
  onSkip,
  hasSavedCredentials,
}: Pick<CredentialsButtonsProps, "onSkip" | "hasSavedCredentials">) {
  const clearButtonRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <span ref={clearButtonRef}>
        <Button
          color="outline-primary"
          className={cx("ms-2")}
          onClick={onSkip}
          disabled={!hasSavedCredentials}
        >
          Clear <Eraser className={cx("bi", "me-1")} />
        </Button>
      </span>
      <UncontrolledTooltip target={clearButtonRef}>
        Forget saved credentials.
      </UncontrolledTooltip>
    </>
  );
}

interface DataConnectorConfigurationSecretsProps {
  dataConnectorConfig: DataConnectorConfiguration;
  context: Required<DataConnectorSecretsModalProps["context"]>;
  control: SensitiveFieldInputProps["control"];
}

function DataConnectorSecrets({
  dataConnectorConfig,
  context,
  control,
}: DataConnectorConfigurationSecretsProps) {
  const userLogged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const dataConnector = dataConnectorConfig.dataConnector;
  const storage = dataConnector.storage;

  const credentialFieldDict = dataConnectorConfig.savedCredentialFields
    ? Object.fromEntries(
        dataConnectorConfig.savedCredentialFields.map((secret) => [
          storageSecretNameToFieldName({ name: secret }),
          secret,
        ])
      )
    : {};

  const savedCredentialsLength = Object.keys(credentialFieldDict).length;
  const hasIncompleteSavedCredentials =
    savedCredentialsLength > 0 &&
    savedCredentialsLength !=
      dataConnectorConfig.sensitiveFieldDefinitions.length;

  return (
    <>
      <div className={cx("d-flex", "align-items-baseline", "mt-1")}>
        <h3>{dataConnector.name}</h3>
        <div className="ms-2">({storage.source_path})</div>
      </div>
      <div>
        {dataConnectorConfig.sensitiveFieldDefinitions.map((field) => {
          return (
            <SensitiveFieldWidget
              key={field.name}
              dataConnectorConfig={dataConnectorConfig}
              context={context}
              credentialFieldDict={credentialFieldDict}
              control={control}
              field={field}
              hasIncompleteSavedCredentials={hasIncompleteSavedCredentials}
            />
          );
        })}
      </div>
      {context === "session" && userLogged && (
        <SaveCredentialsInput control={control} />
      )}
      {context === "storage" && hasIncompleteSavedCredentials && (
        <div className={cx("text-danger", "mb-3")}>
          The saved credentials for this data connector are incomplete so they
          will be ignored at session launch.
        </div>
      )}
    </>
  );
}

interface DataConnectorSecretsModalProps {
  context?: "session" | "storage";
  isOpen: boolean;
  onCancel: () => void;
  onStart: (dataConnectorConfigs: DataConnectorConfiguration[]) => void;
  dataConnectorConfigs: DataConnectorConfiguration[] | undefined;
}
export default function DataConnectorSecretsModal({
  context = "session",
  isOpen,
  onCancel,
  onStart,
  dataConnectorConfigs: initialDataConnectorConfigs,
}: DataConnectorSecretsModalProps) {
  const noCredentialsConfigs = useMemo(
    () =>
      initialDataConnectorConfigs == null
        ? []
        : initialDataConnectorConfigs.filter(
            (config) => config.sensitiveFieldDefinitions.length === 0
          ),
    [initialDataConnectorConfigs]
  );
  const [dataConnectorConfigs, setDataConnectorConfigs] = useState(
    initialDataConnectorConfigs == null
      ? []
      : initialDataConnectorConfigs.filter(
          (config) => config.sensitiveFieldDefinitions.length > 0
        )
  );
  const [index, setIndex] = useState(0);
  const { control, handleSubmit, reset: resetForm } = useForm();

  const [validateCloudStorageConnection, validationResult] =
    usePostStorageSchemaTestConnectionMutation();

  const onNext = useCallback(
    (csConfigs: DataConnectorConfiguration[]) => {
      if (index < csConfigs.length - 1) {
        if (!validationResult.isUninitialized) validationResult.reset();
        resetForm();
        setIndex((index) => index + 1);
      } else {
        resetForm();
        onStart([...noCredentialsConfigs, ...csConfigs]);
      }
    },
    [index, noCredentialsConfigs, onStart, resetForm, validationResult]
  );

  const onSkip = useCallback(() => {
    if (dataConnectorConfigs.length < 1) {
      onStart([...noCredentialsConfigs]);
      return;
    }

    const newCloudStorageConfigs = [...dataConnectorConfigs];
    newCloudStorageConfigs[index] = {
      ...dataConnectorConfigs[index],
      active: false,
    };
    setDataConnectorConfigs(newCloudStorageConfigs);
    onNext(newCloudStorageConfigs);
  }, [dataConnectorConfigs, index, noCredentialsConfigs, onNext, onStart]);

  const onContinue = useCallback(
    (options: CloudStorageDetailsOptions) => {
      if (dataConnectorConfigs == null || dataConnectorConfigs.length < 1)
        return;

      const config = { ...dataConnectorConfigs[index] };
      const sensitiveFieldValues = { ...config.sensitiveFieldValues };
      const { saveCredentials } = options;
      if (saveCredentials === true || saveCredentials === false) {
        config.saveCredentials = saveCredentials;
        delete options.saveCredentials;
      }
      if (options && Object.keys(options).length > 0) {
        Object.entries(options).forEach(([key, value]) => {
          if (value != undefined && value !== "") {
            sensitiveFieldValues[key] = "" + value;
          }
        });
        config.sensitiveFieldValues = sensitiveFieldValues;
      }

      const validateParameters =
        validationParametersFromDataConnectorConfiguration(config);
      validateCloudStorageConnection({ body: validateParameters });

      const newCloudStorageConfigs = [...dataConnectorConfigs];
      newCloudStorageConfigs[index] = config;
      setDataConnectorConfigs(newCloudStorageConfigs);
    },
    [dataConnectorConfigs, index, validateCloudStorageConnection]
  );

  useEffect(() => {
    if (dataConnectorConfigs == null) return;
    if (dataConnectorConfigs[index].active && !validationResult.isSuccess)
      return;
    onNext(dataConnectorConfigs);
  }, [
    dataConnectorConfigs,
    index,
    noCredentialsConfigs,
    onNext,
    onStart,
    validationResult,
  ]);

  if (dataConnectorConfigs == null) return null;
  if (dataConnectorConfigs.length < 1) return null;
  const hasSavedCredentials = dataConnectorConfigs.some(
    (csc) => csc.savedCredentialFields?.length > 0
  );

  return (
    <Modal
      centered
      data-cy={CONTEXT_STRINGS[context].dataCy}
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">{CONTEXT_STRINGS[context].header}</ModalHeader>
      <Form
        noValidate
        data-cy="data-connector-edit-options"
        onSubmit={handleSubmit(onContinue)}
      >
        <ModalBody>
          <DataConnectorSecrets
            dataConnectorConfig={dataConnectorConfigs[index]}
            context={context}
            control={control}
          />
          <CredentialsTestError
            context={context}
            validationResult={validationResult}
          />
        </ModalBody>
        <ModalFooter className="gap-2">
          <div className="flex-grow-1">
            <ProgressBreadcrumbs
              dataConnectorConfigs={dataConnectorConfigs}
              index={index}
              setDataConnectorConfigs={setDataConnectorConfigs}
              setIndex={setIndex}
            />
          </div>
          <CredentialsButtons
            context={context}
            hasSavedCredentials={hasSavedCredentials}
            onCancel={onCancel}
            onSkip={onSkip}
            validationResult={validationResult}
          />
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface CredentialsButtonsProps
  extends Pick<DataConnectorSecretsModalProps, "onCancel"> {
  context: NonNullable<DataConnectorSecretsModalProps["context"]>;
  hasSavedCredentials: boolean;
  onSkip: () => void;
  validationResult: ReturnType<
    typeof usePostStorageSchemaTestConnectionMutation
  >[1];
}

function CredentialsButtons({
  context,
  hasSavedCredentials,
  onCancel,
  onSkip,
  validationResult,
}: CredentialsButtonsProps) {
  return (
    <div>
      <Button color="outline-danger" onClick={onCancel}>
        <XLg className={cx("bi", "me-1")} />
        Cancel
      </Button>
      {context === "session" && (
        <SkipConnectionTestButton
          onSkip={onSkip}
          validationResult={validationResult}
        />
      )}
      {context === "storage" && (
        <ClearCredentialsButton
          onSkip={onSkip}
          hasSavedCredentials={hasSavedCredentials}
        />
      )}
      <Button
        color={
          validationResult == null
            ? "primary"
            : validationResult.isSuccess
            ? "primary"
            : validationResult.isError
            ? "danger"
            : "primary"
        }
        className={cx("ms-2")}
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
            {CONTEXT_STRINGS[context].continueButton}{" "}
            <ChevronRight className={cx("bi", "ms-1")} />
          </span>
        )}
      </Button>
    </div>
  );
}

function CredentialsTestError({
  context,
  validationResult,
}: Pick<CredentialsButtonsProps, "context" | "validationResult">) {
  if (!validationResult.isError) return null;
  return (
    <div className="mt-3">
      <div className="text-danger">{CONTEXT_STRINGS[context].testError}</div>
    </div>
  );
}

interface ProgressBreadcrumbsProps {
  dataConnectorConfigs: DataConnectorConfiguration[];
  index: number;
  setDataConnectorConfigs: (configs: DataConnectorConfiguration[]) => void;
  setIndex: (index: number) => void;
}
function ProgressBreadcrumbs({
  dataConnectorConfigs,
  index,
  setDataConnectorConfigs,
  setIndex,
}: ProgressBreadcrumbsProps) {
  if (dataConnectorConfigs.length < 2) return null;
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {dataConnectorConfigs.map((dataConnectorConfig, idx) => (
          <li
            className={cx("breadcrumb-item", idx === index && "active")}
            key={dataConnectorConfig.dataConnector.id}
          >
            <button
              className={cx(
                "btn",
                "btn-link",
                "p-0",
                idx === index && ["text-decoration-none", "link-rk-text"],
                idx > index && "text-decoration-none"
              )}
              disabled={idx >= index}
              onClick={() => {
                const newCloudStorageConfigs = [...dataConnectorConfigs];
                newCloudStorageConfigs[idx] = {
                  ...dataConnectorConfigs[idx],
                  active: true,
                };
                setDataConnectorConfigs(newCloudStorageConfigs);
                setIndex(idx);
              }}
            >
              {dataConnectorConfig.dataConnector.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SaveCredentialsInput({
  control,
}: Pick<SensitiveFieldWidgetProps, "control">) {
  return (
    <div className="mb-3">
      <Controller
        name="saveCredentials"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <Input
            id="saveCredentials"
            className="form-check-input"
            checked={field.value}
            innerRef={field.ref}
            onBlur={field.onBlur}
            onChange={field.onChange}
            type="checkbox"
          />
        )}
      />
      <Label
        className={cx("form-check-label", "ms-2")}
        htmlFor="saveCredentials"
      >
        Save credentials for future sessions
      </Label>
    </div>
  );
}

interface SensitiveFieldWidgetProps
  extends DataConnectorConfigurationSecretsProps {
  credentialFieldDict: Record<string, string>;
  field: {
    name: string;
    friendlyName: string;
  };
  hasIncompleteSavedCredentials: boolean;
}

function SensitiveFieldWidget({
  dataConnectorConfig,
  credentialFieldDict,
  context,
  control,
  field,
}: SensitiveFieldWidgetProps) {
  const savedValue = credentialFieldDict[field.name];
  if (context === "storage") {
    if (savedValue != null) {
      return (
        <SensitiveFieldInput
          key={field.name}
          control={control}
          defaultValue={CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE}
          friendlyName={field.friendlyName}
          name={field.name}
          showPasswordInitially={true}
        />
      );
    }
  }
  const defaultValue =
    dataConnectorConfig.sensitiveFieldValues[field.name] ?? "";
  return (
    <SensitiveFieldInput
      key={field.name}
      control={control}
      defaultValue={defaultValue}
      friendlyName={field.friendlyName}
      name={field.name}
    />
  );
}

interface SensitiveFieldInputProps {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  friendlyName: string;
  defaultValue: string | undefined;
  name: string;
  showPasswordInitially?: boolean;
}

function SensitiveFieldInput({
  control,
  defaultValue,
  friendlyName,
  name,
  showPasswordInitially = false,
}: SensitiveFieldInputProps) {
  const [showPassword, setShowPassword] = useState(showPasswordInitially);
  const toggleShowPassword = useCallback(() => {
    setShowPassword((showPassword) => !showPassword);
  }, []);

  const tooltipContainerId = `option-is-secret-${name}`;
  return (
    <div className="mb-3">
      <Label htmlFor={name}>
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
          <>
            <InputGroup className={cx(fieldState.error && "is-invalid")}>
              <Input
                id={name}
                type={showPassword ? "text" : "password"}
                className={cx(
                  "form-control",
                  "rounded-0",
                  "rounded-start",
                  fieldState.error && "is-invalid"
                )}
                placeholder={""}
                {...field}
              />
              <Button
                className="rounded-end"
                id={`show-password-${name}`}
                onClick={() => toggleShowPassword()}
              >
                {showPassword ? (
                  <EyeFill className="bi" />
                ) : (
                  <EyeSlashFill className="bi" />
                )}
                <UncontrolledTooltip
                  placement="top"
                  target={`show-password-${name}`}
                >
                  Hide/show sensitive data
                </UncontrolledTooltip>
              </Button>
            </InputGroup>
          </>
        )}
        rules={{
          required: true,
          validate: {
            nonEmpty: (v) => v.trim().length > 0,
            provided: (v) => v !== CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE,
          },
        }}
      />
      <div className="invalid-feedback">Please provide a value for {name}</div>
    </div>
  );
}

function SkipConnectionTestButton({
  onSkip,
  validationResult,
}: Pick<CredentialsButtonsProps, "onSkip" | "validationResult">) {
  const skipButtonRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <span ref={skipButtonRef}>
        <Button color="outline-primary" className={cx("ms-2")} onClick={onSkip}>
          <SkipForward className={cx("bi", "me-1")} />
          Skip
        </Button>
      </span>
      <UncontrolledTooltip target={skipButtonRef}>
        Skip the connection test. At session launch, the storage will try to
        mount
        {validationResult.isError
          ? " using the provided credentials"
          : " without any credentials"}
        .
      </UncontrolledTooltip>
    </>
  );
}
