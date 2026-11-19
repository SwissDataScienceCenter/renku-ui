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
import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, XLg } from "react-bootstrap-icons";
import { Control, useForm } from "react-hook-form";
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
import {
  ConnectionTestButton,
  DATA_CONNECTOR_CREDENTIAL_STRINGS as CONTEXT_STRINGS,
  credentialConfigAfterSubmit,
  CredentialsTestError,
  SensitiveFieldWidget,
} from "./dataConnectorCredentialFields";

const STORAGE_CONTEXT = "storage";

function ClearCredentialsButton({
  onClear,
  hasSavedCredentials,
}: {
  hasSavedCredentials: boolean;
  onClear: () => void;
}) {
  const clearButtonRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <span ref={clearButtonRef}>
        <Button
          color="outline-primary"
          className={cx("ms-2")}
          onClick={onClear}
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
  control: Control<CloudStorageDetailsOptions>;
}

function DataConnectorSecrets({
  dataConnectorConfig,
  control,
}: DataConnectorConfigurationSecretsProps) {
  const dataConnector = dataConnectorConfig.dataConnector;
  const storage = dataConnector.storage;
  const credentialFieldDict = Object.fromEntries(
    dataConnectorConfig.savedCredentialFields.map((secret) => [
      storageSecretNameToFieldName({ name: secret }),
      secret,
    ]),
  );
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
            {dataConnectorConfig.sensitiveFieldDefinitions.map((field) => (
              <SensitiveFieldWidget
                key={field.name}
                dataConnectorConfig={dataConnectorConfig}
                context={STORAGE_CONTEXT}
                credentialFieldDict={credentialFieldDict}
                control={control}
                field={field}
              />
            ))}
          </div>
          {hasIncompleteSavedCredentials && (
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

interface DataConnectorSecretsModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onStart: (dataConnectorConfigs: DataConnectorConfiguration[]) => void;
  dataConnectorConfigs: DataConnectorConfiguration[] | undefined;
}

export default function DataConnectorSecretsModal({
  isOpen,
  onCancel,
  onStart,
  dataConnectorConfigs: initialDataConnectorConfigs,
}: DataConnectorSecretsModalProps) {
  const [credentialConfigs, setCredentialConfigs] = useState(() =>
    (initialDataConnectorConfigs ?? []).filter(
      (config) => config.sensitiveFieldDefinitions.length > 0,
    ),
  );
  const config = credentialConfigs[0];
  const { control, handleSubmit } = useForm<CloudStorageDetailsOptions>();
  const [validateCloudStorageConnection, validationResult] =
    usePostStorageSchemaTestConnectionMutation();

  const onClear = useCallback(() => {
    if (config == null) return;
    const next = [
      { ...config, active: false, saveCredentials: false, skip: true },
    ];
    setCredentialConfigs(next);
    onStart(next);
  }, [config, onStart]);

  const onContinue = useCallback(
    (options: CloudStorageDetailsOptions) => {
      if (config == null) return;
      const nextConfig = credentialConfigAfterSubmit(config, options);
      validateCloudStorageConnection({
        body: validationParametersFromDataConnectorConfiguration(nextConfig),
      });
      setCredentialConfigs([nextConfig]);
    },
    [config, validateCloudStorageConnection],
  );

  useEffect(() => {
    if (config == null || !validationResult.isSuccess) return;
    onStart(credentialConfigs);
  }, [config, credentialConfigs, onStart, validationResult.isSuccess]);

  if (config == null) {
    return null;
  }

  const copy = CONTEXT_STRINGS[STORAGE_CONTEXT];
  const hasSavedCredentials = config.savedCredentialFields.length > 0;

  return (
    <Modal centered data-cy={copy.dataCy} isOpen={isOpen} size="lg">
      <ModalHeader tag="h2">{copy.header}</ModalHeader>
      <Form
        noValidate
        data-cy="data-connector-edit-options"
        onSubmit={handleSubmit(onContinue)}
      >
        <ModalBody>
          <DataConnectorSecrets
            dataConnectorConfig={config}
            control={control}
          />
          <CredentialsTestError
            context={STORAGE_CONTEXT}
            validationResult={validationResult}
          />
        </ModalBody>
        {!isCredentialTested(config) && (
          <ModalFooter className="gap-2">
            <Button color="outline-danger" onClick={onCancel}>
              <XLg className={cx("bi", "me-1")} />
              Cancel
            </Button>
            <ClearCredentialsButton
              hasSavedCredentials={hasSavedCredentials}
              onClear={onClear}
            />
            <ConnectionTestButton
              className="ms-2"
              context={STORAGE_CONTEXT}
              validationResult={validationResult}
            />
          </ModalFooter>
        )}
      </Form>
    </Modal>
  );
}
