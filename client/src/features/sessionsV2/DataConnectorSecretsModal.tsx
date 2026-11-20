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
import { Eraser, SkipForward, XLg } from "react-bootstrap-icons";
import { Control, FieldValues, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { usePostStorageSchemaTestConnectionMutation } from "../cloudStorage/api/projectCloudStorage.api";
import type { CloudStorageDetailsOptions } from "../cloudStorage/projectCloudStorage.types";
import { validationParametersFromDataConnectorConfiguration } from "../dataConnectorsV2/components/dataConnector.utils";
import { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { storageSecretNameToFieldName } from "../secretsV2/secrets.utils";
import { useGetUserQueryState } from "../usersV2/api/users.api";
import {
  ConnectionTestButton,
  DATA_CONNECTOR_CREDENTIAL_STRINGS as CONTEXT_STRINGS,
  credentialConfigAfterSubmit,
  CredentialsTestError,
  SaveCredentialsInput,
  SensitiveFieldWidget,
  type DataConnectorCredentialContext,
} from "./dataConnectorCredentialFields";

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
  context: DataConnectorCredentialContext;
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function DataConnectorSecrets({
  dataConnectorConfig,
  context,
  control,
}: DataConnectorConfigurationSecretsProps) {
  const { data: user } = useGetUserQueryState();

  const dataConnector = dataConnectorConfig.dataConnector;
  const storage = dataConnector.storage;

  const credentialFieldDict = dataConnectorConfig.savedCredentialFields
    ? Object.fromEntries(
        dataConnectorConfig.savedCredentialFields.map((secret) => [
          storageSecretNameToFieldName({ name: secret }),
          secret,
        ]),
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
        <h3
          data-cy={
            dataConnectorConfig.skip ? "session-wizard-skipped-item" : undefined
          }
        >
          {dataConnectorConfig.skip && <SkippedIcon />}
          {dataConnector.name}
        </h3>
        <div className="ms-2">({storage.source_path})</div>
      </div>
      {isCredentialTested(dataConnectorConfig) ? (
        <p
          className="text-body-secondary"
          data-cy="session-wizard-resolved-item"
        >
          Tested
        </p>
      ) : (
        <>
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
                />
              );
            })}
          </div>
          {(context === "session" || context === "job") && user?.isLoggedIn && (
            <SaveCredentialsInput context={context} control={control} />
          )}
          {context === "storage" && hasIncompleteSavedCredentials && (
            <div className={cx("text-danger", "mb-3")}>
              The saved credentials for this data connector are incomplete so
              they will be ignored at session launch.
            </div>
          )}
        </>
      )}
    </>
  );
}

function isCredentialTested(config: DataConnectorConfiguration): boolean {
  if (!config.touched || config.skip) {
    return false;
  }
  const values = Object.values(config.sensitiveFieldValues);
  return values.length > 0 && values.every((value) => value !== "");
}

function SkippedIcon() {
  return (
    <span className="me-1" title="Skipped">
      <SkipForward aria-hidden="true" className="bi" />
      <span className="visually-hidden">Skipped. </span>
    </span>
  );
}

interface DataConnectorSecretsModalProps {
  context?: DataConnectorCredentialContext;
  embedded?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onCredentialResolved?: (
    dataConnectorConfigs: DataConnectorConfiguration[],
  ) => void;
  onStart: (dataConnectorConfigs: DataConnectorConfiguration[]) => void;
  dataConnectorConfigs: DataConnectorConfiguration[] | undefined;
}
export default function DataConnectorSecretsModal({
  context = "session",
  embedded = false,
  isOpen,
  onCancel,
  onCredentialResolved,
  onStart,
  dataConnectorConfigs: initialDataConnectorConfigs,
}: DataConnectorSecretsModalProps) {
  const noCredentialsConfigs = useMemo(
    () =>
      initialDataConnectorConfigs == null
        ? []
        : initialDataConnectorConfigs.filter(
            (config) => config.sensitiveFieldDefinitions.length === 0,
          ),
    [initialDataConnectorConfigs],
  );
  const [dataConnectorConfigs, setDataConnectorConfigs] = useState(
    initialDataConnectorConfigs == null
      ? []
      : initialDataConnectorConfigs.filter(
          (config) => config.sensitiveFieldDefinitions.length > 0,
        ),
  );
  const [index, setIndex] = useState(0);
  const { control, handleSubmit, reset: resetForm } = useForm();

  const [validateCloudStorageConnection, validationResult] =
    usePostStorageSchemaTestConnectionMutation();

  const onNext = useCallback(
    (csConfigs: DataConnectorConfiguration[]) => {
      onCredentialResolved?.(csConfigs);
      if (index < csConfigs.length - 1) {
        if (!validationResult.isUninitialized) validationResult.reset();
        resetForm();
        setIndex((index) => index + 1);
      } else {
        resetForm();
        onStart([...noCredentialsConfigs, ...csConfigs]);
      }
    },
    [
      index,
      noCredentialsConfigs,
      onCredentialResolved,
      onStart,
      resetForm,
      validationResult,
    ],
  );

  const onSkip = useCallback(() => {
    if (dataConnectorConfigs.length < 1) {
      const configs = [...noCredentialsConfigs];
      onCredentialResolved?.(configs);
      onStart(configs);
      return;
    }

    const newCloudStorageConfigs = [...dataConnectorConfigs];
    newCloudStorageConfigs[index] = {
      ...dataConnectorConfigs[index],
      active: false,
      saveCredentials: false,
      skip: true,
    };
    setDataConnectorConfigs(newCloudStorageConfigs);
    onNext(newCloudStorageConfigs);
  }, [
    dataConnectorConfigs,
    index,
    noCredentialsConfigs,
    onCredentialResolved,
    onNext,
    onStart,
  ]);

  const onContinue = useCallback(
    (options: CloudStorageDetailsOptions) => {
      if (dataConnectorConfigs == null || dataConnectorConfigs.length < 1)
        return;

      const config = credentialConfigAfterSubmit(
        dataConnectorConfigs[index],
        options,
      );
      const validateParameters =
        validationParametersFromDataConnectorConfiguration(config);
      validateCloudStorageConnection({ body: validateParameters });

      const newCloudStorageConfigs = [...dataConnectorConfigs];
      newCloudStorageConfigs[index] = config;
      setDataConnectorConfigs(newCloudStorageConfigs);
    },
    [dataConnectorConfigs, index, validateCloudStorageConnection],
  );

  useEffect(() => {
    if (dataConnectorConfigs == null) return;
    if (dataConnectorConfigs[index].active && !validationResult.isSuccess)
      return;
    // TODO: fix react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    (csc) => csc.savedCredentialFields?.length > 0,
  );
  const total = dataConnectorConfigs.length;
  const showCredentialsCounter =
    (context === "session" || context === "job") && total > 1;
  const modalTitle = showCredentialsCounter
    ? `${CONTEXT_STRINGS[context].header} ${index + 1} of ${total}`
    : CONTEXT_STRINGS[context].header;

  const form = (
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
            onOpen={() => {
              if (!validationResult.isUninitialized) {
                validationResult.reset();
              }
            }}
            setDataConnectorConfigs={setDataConnectorConfigs}
            setIndex={setIndex}
          />
        </div>
        {!isCredentialTested(dataConnectorConfigs[index]) && (
          <CredentialsButtons
            context={context}
            embedded={embedded}
            hasSavedCredentials={hasSavedCredentials}
            onCancel={onCancel}
            onSkip={onSkip}
            validationResult={validationResult}
          />
        )}
      </ModalFooter>
    </Form>
  );

  if (embedded) {
    return <div data-cy={CONTEXT_STRINGS[context].dataCy}>{form}</div>;
  }

  return (
    <Modal
      centered
      data-cy={CONTEXT_STRINGS[context].dataCy}
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">{modalTitle}</ModalHeader>
      {form}
    </Modal>
  );
}

interface CredentialsButtonsProps extends Pick<
  DataConnectorSecretsModalProps,
  "onCancel"
> {
  context: NonNullable<DataConnectorSecretsModalProps["context"]>;
  hasSavedCredentials: boolean;
  embedded?: boolean;
  onSkip: () => void;
  validationResult: ReturnType<
    typeof usePostStorageSchemaTestConnectionMutation
  >[1];
}

function CredentialsButtons({
  context,
  embedded = false,
  hasSavedCredentials,
  onCancel,
  onSkip,
  validationResult,
}: CredentialsButtonsProps) {
  return (
    <div>
      {!embedded && (
        <Button color="outline-danger" onClick={onCancel}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
      )}
      {(context === "session" || context === "job") && (
        <SkipConnectionTestButton context={context} onSkip={onSkip} />
      )}
      {context === "storage" && (
        <ClearCredentialsButton
          onSkip={onSkip}
          hasSavedCredentials={hasSavedCredentials}
        />
      )}
      <ConnectionTestButton
        className="ms-2"
        context={context}
        validationResult={validationResult}
      />
    </div>
  );
}

interface ProgressBreadcrumbsProps {
  dataConnectorConfigs: DataConnectorConfiguration[];
  index: number;
  onOpen?: () => void;
  setDataConnectorConfigs: (configs: DataConnectorConfiguration[]) => void;
  setIndex: (index: number) => void;
}
function ProgressBreadcrumbs({
  dataConnectorConfigs,
  index,
  onOpen,
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
                idx > index && "text-decoration-none",
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
                onOpen?.();
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

function SkipConnectionTestButton({
  context,
  onSkip,
}: Pick<CredentialsButtonsProps, "context" | "onSkip">) {
  const skipButtonRef = useRef<HTMLAnchorElement>(null);
  const targetLabel = context === "job" ? "job" : "session";
  return (
    <>
      <span ref={skipButtonRef}>
        <Button color="outline-primary" className={cx("ms-2")} onClick={onSkip}>
          <SkipForward className={cx("bi", "me-1")} />
          Skip
        </Button>
      </span>
      <UncontrolledTooltip target={skipButtonRef}>
        {`Skip the data connector. It will not be mounted in the ${targetLabel}.`}
      </UncontrolledTooltip>
    </>
  );
}
