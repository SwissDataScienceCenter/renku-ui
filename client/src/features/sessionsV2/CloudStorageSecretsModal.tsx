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

import { useTestCloudStorageConnectionMutation } from "../project/components/cloudStorage/projectCloudStorage.api";
import { CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE } from "../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  CloudStorageDetailsOptions,
  TestCloudStorageConnectionParams,
} from "../project/components/cloudStorage/projectCloudStorage.types";
import { storageDefinitionFromConfig } from "../project/utils/projectCloudStorage.utils";
import type { RCloneOption } from "../projectsV2/api/storagesV2.api";
import type { SessionStartCloudStorageConfiguration } from "./startSessionOptionsV2.types";
import { storageSecretNameToFieldName } from "../secrets/secrets.utils";

const CONTEXT_STRINGS = {
  session: {
    continueButton: "Continue",
    dataCy: "session-cloud-storage-credentials-modal",
    header: "Session Storage Credentials",
    testError:
      "The data source could not be mounted. Please retry with different credentials, or skip the test. If you skip, the data source will still try to mount, using the provided credentials, at session launch time.",
  },
  storage: {
    continueButton: "Test and Save",
    dataCy: "cloud-storage-credentials-modal",
    header: "Cloud Storage Credentials",
    testError:
      "The data source could not be mounted. Please try different credentials or rely on providing credentials at session launch time.",
  },
};

export type CloudStorageConfiguration = SessionStartCloudStorageConfiguration;

function ClearCredentialsButton({
  onSkip,
  hasSavedCredentials,
}: Pick<CredentialsButtonsProps, "onSkip" | "hasSavedCredentials">) {
  const clearButtonRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <span ref={clearButtonRef}>
        <Button
          className={cx("ms-2", "btn-outline-rk-green")}
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

interface CloudStorageConfigurationSecretsProps {
  cloudStorageConfig: CloudStorageConfiguration;
  context: Required<CloudStorageSecretsModalProps["context"]>;
  control: SensitiveFieldInputProps["control"];
}

function CloudStorageConfigurationSecrets({
  cloudStorageConfig,
  context,
  control,
}: CloudStorageConfigurationSecretsProps) {
  const storage = cloudStorageConfig.cloudStorage.storage;

  const credentialFieldDict = Object.fromEntries(
    cloudStorageConfig.savedCredentialFields.map((secret) => [
      storageSecretNameToFieldName({ name: secret }),
      secret,
    ])
  );

  const savedCredentialsLength = Object.keys(credentialFieldDict).length;
  const hasIncompleteSavedCredentials =
    savedCredentialsLength > 0 &&
    savedCredentialsLength !=
      cloudStorageConfig.sensitiveFieldDefinitions.length;

  return (
    <>
      <div className={cx("d-flex", "align-items-baseline")}>
        <h4>{storage.name}</h4>
        <div className="ms-2">({storage.source_path})</div>
      </div>
      <div>
        {cloudStorageConfig.sensitiveFieldDefinitions.map((field) => {
          return (
            <SensitiveFieldWidget
              key={field.name}
              cloudStorageConfig={cloudStorageConfig}
              context={context}
              credentialFieldDict={credentialFieldDict}
              control={control}
              field={field}
              hasIncompleteSavedCredentials={hasIncompleteSavedCredentials}
            />
          );
        })}
      </div>
      {context === "session" && <SaveCredentialsInput control={control} />}
      {context === "storage" && hasIncompleteSavedCredentials && (
        <div className={cx("text-danger", "mt-3")}>
          The saved credentials for this data source are incomplete so they will
          be ignored at session launch.
        </div>
      )}
    </>
  );
}

interface CloudStorageSecretsModalProps {
  context?: "session" | "storage";
  isOpen: boolean;
  onCancel: () => void;
  onStart: (cloudStorageConfigs: CloudStorageConfiguration[]) => void;
  cloudStorageConfigs: CloudStorageConfiguration[] | undefined;
}
export default function CloudStorageSecretsModal({
  context = "session",
  isOpen,
  onCancel,
  onStart,
  cloudStorageConfigs: initialCloudStorageConfigs,
}: CloudStorageSecretsModalProps) {
  const noCredentialsConfigs = useMemo(
    () =>
      initialCloudStorageConfigs == null
        ? []
        : initialCloudStorageConfigs.filter(
            (config) => config.sensitiveFieldDefinitions.length === 0
          ),
    [initialCloudStorageConfigs]
  );
  const [cloudStorageConfigs, setCloudStorageConfigs] = useState(
    initialCloudStorageConfigs == null
      ? []
      : initialCloudStorageConfigs.filter(
          (config) => config.sensitiveFieldDefinitions.length > 0
        )
  );
  const [index, setIndex] = useState(0);
  const { control, handleSubmit, reset: resetForm } = useForm();

  const [validateCloudStorageConnection, validationResult] =
    useTestCloudStorageConnectionMutation();

  const onNext = useCallback(
    (csConfigs: CloudStorageConfiguration[]) => {
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
    if (cloudStorageConfigs.length < 1) {
      onStart([...noCredentialsConfigs]);
      return;
    }

    const newCloudStorageConfigs = [...cloudStorageConfigs];
    newCloudStorageConfigs[index] = {
      ...cloudStorageConfigs[index],
      active: false,
    };
    setCloudStorageConfigs(newCloudStorageConfigs);
    onNext(newCloudStorageConfigs);
  }, [cloudStorageConfigs, index, noCredentialsConfigs, onNext, onStart]);

  const onContinue = useCallback(
    (options: CloudStorageDetailsOptions) => {
      if (cloudStorageConfigs == null || cloudStorageConfigs.length < 1) return;

      const config = { ...cloudStorageConfigs[index] };
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
      const newStorageDetails = storageDefinitionFromConfig(config);

      const validateParameters: TestCloudStorageConnectionParams = {
        configuration: newStorageDetails.configuration,
        source_path: newStorageDetails.source_path,
      };

      validateCloudStorageConnection(validateParameters);

      const newCloudStorageConfigs = [...cloudStorageConfigs];
      newCloudStorageConfigs[index] = config;
      setCloudStorageConfigs(newCloudStorageConfigs);
    },
    [cloudStorageConfigs, index, validateCloudStorageConnection]
  );

  useEffect(() => {
    if (cloudStorageConfigs == null) return;
    if (cloudStorageConfigs[index].active && !validationResult.isSuccess)
      return;
    onNext(cloudStorageConfigs);
  }, [
    cloudStorageConfigs,
    index,
    noCredentialsConfigs,
    onNext,
    onStart,
    validationResult,
  ]);

  if (cloudStorageConfigs == null) return null;
  if (cloudStorageConfigs.length < 1) return null;
  const hasSavedCredentials = cloudStorageConfigs.some(
    (csc) => csc.savedCredentialFields.length > 0
  );

  return (
    <Modal
      centered
      data-cy={CONTEXT_STRINGS[context].dataCy}
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader className={cx("fw-bold")}>
        {CONTEXT_STRINGS[context].header}
      </ModalHeader>
      <Form
        noValidate
        className="form-rk-green"
        data-cy="cloud-storage-edit-options"
        onSubmit={handleSubmit(onContinue)}
      >
        <ModalBody className="pt-0">
          <CloudStorageConfigurationSecrets
            cloudStorageConfig={cloudStorageConfigs[index]}
            context={context}
            control={control}
          />
          <CredentialsTestError
            context={context}
            validationResult={validationResult}
          />
        </ModalBody>
        <ModalFooter className={cx("d-flex", "align-items-baseline", "pt-0")}>
          <div className="flex-grow-1">
            <ProgressBreadcrumbs
              cloudStorageConfigs={cloudStorageConfigs}
              index={index}
              setCloudStorageConfigs={setCloudStorageConfigs}
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
  extends Pick<CloudStorageSecretsModalProps, "onCancel"> {
  context: NonNullable<CloudStorageSecretsModalProps["context"]>;
  hasSavedCredentials: boolean;
  onSkip: () => void;
  validationResult: ReturnType<typeof useTestCloudStorageConnectionMutation>[1];
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
      <Button className="me-5" color="outline-danger" onClick={onCancel}>
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
        className={cx(
          "ms-2",
          validationResult.isSuccess && "btn-rk-green",
          validationResult.isError && "btn-danger"
        )}
        disabled={
          validationResult.isLoading ||
          (context === "storage" && hasSavedCredentials)
        }
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
  if (!validationResult.isError) return <div className="mt-3"></div>;
  return (
    <div className="mt-3">
      <div className="text-danger">{CONTEXT_STRINGS[context].testError}</div>
    </div>
  );
}

interface ProgressBreadcrumbsProps {
  cloudStorageConfigs: CloudStorageConfiguration[];
  index: number;
  setCloudStorageConfigs: (configs: CloudStorageConfiguration[]) => void;
  setIndex: (index: number) => void;
}
function ProgressBreadcrumbs({
  cloudStorageConfigs,
  index,
  setCloudStorageConfigs,
  setIndex,
}: ProgressBreadcrumbsProps) {
  if (cloudStorageConfigs.length < 2) return null;
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {cloudStorageConfigs.map((cloudStorageConfig, idx) => (
          <li
            className={cx("breadcrumb-item", idx === index && "active")}
            key={cloudStorageConfig.cloudStorage.storage.storage_id}
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
                const newCloudStorageConfigs = [...cloudStorageConfigs];
                newCloudStorageConfigs[idx] = {
                  ...cloudStorageConfigs[idx],
                  active: true,
                };
                setCloudStorageConfigs(newCloudStorageConfigs);
                setIndex(idx);
              }}
            >
              {cloudStorageConfig.cloudStorage.storage.name}
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
    <div className="mt-2">
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
  extends CloudStorageConfigurationSecretsProps {
  credentialFieldDict: Record<string, string>;
  field: {
    name: string;
    friendlyName: string;
  };
  hasIncompleteSavedCredentials: boolean;
}

function SensitiveFieldWidget({
  cloudStorageConfig,
  credentialFieldDict,
  context,
  control,
  field,
  hasIncompleteSavedCredentials,
}: SensitiveFieldWidgetProps) {
  const savedValue = credentialFieldDict[field.name];
  if (context === "storage") {
    if (savedValue != null) {
      return (
        <div className="mt-2">
          <Label htmlFor={field.name}>{field.friendlyName}</Label>
          <Input
            id={field.name}
            value={CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE}
            readOnly
          />
        </div>
      );
    }
    if (hasIncompleteSavedCredentials) {
      return (
        <div className="mt-2">
          <Label htmlFor={field.name}>{field.friendlyName}</Label>
          <Input
            id={field.name}
            defaultValue="<clear credentials to edit>"
            readOnly
          />
        </div>
      );
    }
  }
  const defaultValue =
    cloudStorageConfig.sensitiveFieldValues[field.name] ?? "";
  return (
    <SensitiveFieldInput
      key={field.name}
      control={control}
      defaultValue={defaultValue}
      friendlyName={field.friendlyName}
      option={field}
    />
  );
}

interface SensitiveFieldInputProps {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  friendlyName: string;
  defaultValue: string | undefined;
  option: RCloneOption;
}

function SensitiveFieldInput({
  control,
  defaultValue,
  friendlyName,
  option,
}: SensitiveFieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = useCallback(() => {
    setShowPassword((showPassword) => !showPassword);
  }, []);

  const tooltipContainerId = `option-is-secret-${option.name}`;
  return (
    <div>
      {/* {option.friendlyName ?? option.name}{" "} */}
      <Label htmlFor={option.name}>
        {friendlyName}
        <div id={tooltipContainerId} className="d-inline">
          <KeyFill className={cx("bi", "ms-1")} />
        </div>
      </Label>

      <Controller
        name={option.name ?? ""}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <>
            <InputGroup className={cx(fieldState.error && "is-invalid")}>
              <Input
                id={option.name}
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
                id={`show-password-${option.name}`}
                onClick={() => toggleShowPassword()}
              >
                {showPassword ? (
                  <EyeFill className="bi" />
                ) : (
                  <EyeSlashFill className="bi" />
                )}
                <UncontrolledTooltip
                  placement="top"
                  target={`show-password-${option.name}`}
                >
                  Hide/show sensitive data
                </UncontrolledTooltip>
              </Button>
            </InputGroup>
          </>
        )}
        rules={{ required: true }}
      />
      <div className="invalid-feedback">Please provide a {option.name}</div>
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
        <Button className={cx("ms-2", "btn-outline-rk-green")} onClick={onSkip}>
          Skip <SkipForward className={cx("bi", "me-1")} />
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
