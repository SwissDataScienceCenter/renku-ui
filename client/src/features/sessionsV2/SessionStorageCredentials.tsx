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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Ban, Check, SkipForward, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import ScrollableModal from "../../components/modal/ScrollableModal";
import { usePostStorageSchemaTestConnectionMutation } from "../cloudStorage/api/projectCloudStorage.api";
import type { CloudStorageDetailsOptions } from "../cloudStorage/projectCloudStorage.types";
import { validationParametersFromDataConnectorConfiguration } from "../dataConnectorsV2/components/dataConnector.utils";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import { storageSecretNameToFieldName } from "../secretsV2/secrets.utils";
import { useGetUserQueryState } from "../usersV2/api/users.api";
import {
  ConnectionTestButton,
  credentialConfigAfterSubmit,
  CredentialsTestError,
  DATA_CONNECTOR_CREDENTIAL_STRINGS,
  SaveCredentialsInput,
  SensitiveFieldWidget,
  type DataConnectorCredentialContext,
} from "./dataConnectorCredentialFields";
import {
  applySkipUnfinishedStorageCredentials,
  applyStorageCredentialUpdate,
  isStorageCredentialResolved,
  isStorageCredentialTested,
  storageCredentialList,
} from "./sessionStorageCredentials.utils";

interface SessionStorageCredentialsProps {
  context?: Extract<DataConnectorCredentialContext, "session" | "job">;
  dataConnectorConfigs: DataConnectorConfiguration[];
  isOpen?: boolean;
  onCancel?: () => void;
  onCredentialResolved?: (configs: DataConnectorConfiguration[]) => void;
  onFinished: (configs: DataConnectorConfiguration[]) => void;
  onTestingChange?: (testing: boolean) => void;
  skipUnfinishedRef?: MutableRefObject<(() => void) | null>;
}

export default function SessionStorageCredentials({
  context = "session",
  dataConnectorConfigs,
  isOpen = true,
  onCancel,
  onCredentialResolved,
  onFinished,
  onTestingChange,
  skipUnfinishedRef,
}: SessionStorageCredentialsProps) {
  const [{ credentialConfigs, otherConfigs }] = useState(() =>
    splitCredentialConfigs(dataConnectorConfigs),
  );
  const [configs, setConfigs] = useState(credentialConfigs);
  const [openIds, setOpenIds] = useState(() =>
    credentialConfigs
      .filter((config) => !config.skip && !isStorageCredentialTested(config))
      .map((config) => storageCredentialAccordionId(config.dataConnector.id)),
  );
  const configsRef = useRef(credentialConfigs);
  const otherConfigsRef = useRef(otherConfigs);
  const onCredentialResolvedRef = useRef(onCredentialResolved);
  const onFinishedRef = useRef(onFinished);
  const finishedRef = useRef(false);
  const [runningTests, setRunningTests] = useState(0);
  const isTesting = runningTests > 0;

  const toggle = useCallback((targetId: string) => {
    setOpenIds((current) =>
      current.includes(targetId)
        ? current.filter((id) => id !== targetId)
        : [...current, targetId],
    );
  }, []);

  const finishIfReady = useCallback(() => {
    if (finishedRef.current) return;
    if (!configsRef.current.every(isStorageCredentialResolved)) {
      return;
    }
    finishedRef.current = true;
    onFinishedRef.current(
      storageCredentialList(otherConfigsRef.current, configsRef.current),
    );
  }, []);

  const commit = useCallback(
    (
      updater: (
        current: DataConnectorConfiguration[],
      ) => DataConnectorConfiguration[],
    ) => {
      const next = updater(configsRef.current);
      if (next === configsRef.current) return;
      configsRef.current = next;
      setConfigs(next);
      onCredentialResolvedRef.current?.(
        storageCredentialList(otherConfigsRef.current, next),
      );
      finishIfReady();
    },
    [finishIfReady],
  );

  const onTestStart = useCallback(() => {
    setRunningTests((n) => n + 1);
  }, []);

  const onTestEnd = useCallback(
    (
      id: string,
      outcome: "success" | "failure",
      updated?: DataConnectorConfiguration,
    ) => {
      setRunningTests((n) => n - 1);
      if (finishedRef.current) return;
      if (outcome === "success" && updated != null) {
        setOpenIds((current) =>
          current.filter((item) => item !== storageCredentialAccordionId(id)),
        );
        commit((current) => applyStorageCredentialUpdate(current, id, updated));
      }
    },
    [commit],
  );

  const skipUnfinished = useCallback(() => {
    if (finishedRef.current || isTesting) return;
    setOpenIds([]);
    const next = applySkipUnfinishedStorageCredentials(configsRef.current);
    if (next === configsRef.current) {
      finishIfReady();
      return;
    }
    commit(() => next);
  }, [commit, finishIfReady, isTesting]);

  useEffect(() => {
    onTestingChange?.(isTesting);
    return () => onTestingChange?.(false);
  }, [isTesting, onTestingChange]);

  useEffect(() => {
    onCredentialResolvedRef.current = onCredentialResolved;
    onFinishedRef.current = onFinished;
    if (skipUnfinishedRef == null) return;
    skipUnfinishedRef.current = skipUnfinished;
    return () => {
      skipUnfinishedRef.current = null;
    };
  }, [onCredentialResolved, onFinished, skipUnfinished, skipUnfinishedRef]);

  if (credentialConfigs.length < 1) {
    return null;
  }

  const list = (
    <Accordion open={openIds} toggle={toggle}>
      {configs.map((config) => (
        <SessionStorageCredentialItem
          key={config.dataConnector.id}
          config={config}
          context={context}
          onTestEnd={onTestEnd}
          onTestStart={onTestStart}
        />
      ))}
    </Accordion>
  );
  const copy = DATA_CONNECTOR_CREDENTIAL_STRINGS[context];

  if (onCancel == null) {
    return <div data-cy={copy.dataCy}>{list}</div>;
  }

  return (
    <ScrollableModal centered data-cy={copy.dataCy} isOpen={isOpen} size="lg">
      <ModalHeader tag="h2">{copy.header}</ModalHeader>
      <ModalBody>{list}</ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={onCancel}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          disabled={isTesting}
          onClick={skipUnfinished}
          title={
            isTesting ? "Wait for the connection test to finish" : undefined
          }
        >
          <SkipForward className={cx("bi", "me-1")} />
          Skip all
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

function SessionStorageCredentialItem({
  config,
  context,
  onTestEnd,
  onTestStart,
}: {
  config: DataConnectorConfiguration;
  context: "session" | "job";
  onTestEnd: (
    id: string,
    outcome: "success" | "failure",
    updated?: DataConnectorConfiguration,
  ) => void;
  onTestStart: () => void;
}) {
  const { data: user } = useGetUserQueryState();
  const { control, handleSubmit } = useForm<CloudStorageDetailsOptions>();
  const [validateConnection, validationResult] =
    usePostStorageSchemaTestConnectionMutation();
  const succeeded =
    validationResult.isSuccess || isStorageCredentialTested(config);
  const accordionId = storageCredentialAccordionId(config.dataConnector.id);
  const idPrefix = config.dataConnector.id;
  const credentialFieldDict = useMemo(
    () => savedCredentialFields(config),
    [config],
  );

  const onSubmit = useMemo(
    () =>
      handleSubmit((options) => {
        const next = credentialConfigAfterSubmit(config, options);
        const id = config.dataConnector.id;
        onTestStart();
        try {
          return validateConnection({
            body: validationParametersFromDataConnectorConfiguration(next),
          })
            .unwrap()
            .then(() => {
              onTestEnd(id, "success", next);
            })
            .catch(() => {
              onTestEnd(id, "failure");
            });
        } catch {
          onTestEnd(id, "failure");
          return undefined;
        }
      }),
    [config, handleSubmit, onTestEnd, onTestStart, validateConnection],
  );

  return (
    <AccordionItem data-cy={storageCredentialDataCy(config.skip, succeeded)}>
      <AccordionHeader targetId={accordionId}>
        <span className="fw-bold">{config.dataConnector.name}</span>
        {succeeded && <StorageCredentialBadge />}
        {!succeeded && config.skip && <StorageCredentialSkippedBadge />}
      </AccordionHeader>
      <AccordionBody accordionId={accordionId}>
        <p className="mb-2">
          Source path: {config.dataConnector.storage.source_path}
        </p>
        {!succeeded && (
          <Form noValidate onSubmit={onSubmit}>
            {config.sensitiveFieldDefinitions.map((field) => (
              <SensitiveFieldWidget
                key={field.name}
                control={control}
                credentialFieldDict={credentialFieldDict}
                dataConnectorConfig={config}
                field={field}
                idPrefix={idPrefix}
                context={context}
              />
            ))}
            {user?.isLoggedIn && (
              <SaveCredentialsInput
                context={context}
                control={control}
                idPrefix={idPrefix}
              />
            )}
            <CredentialsTestError
              context={context}
              validationResult={validationResult}
            />
            <div className={cx("d-flex", "justify-content-end")}>
              <ConnectionTestButton
                context={context}
                validationResult={validationResult}
              />
            </div>
          </Form>
        )}
      </AccordionBody>
    </AccordionItem>
  );
}

function StorageCredentialSkippedBadge() {
  return (
    <span
      className={cx(
        "ms-2",
        "border",
        "badge",
        "fw-normal",
        "border-secondary",
        "bg-secondary-subtle",
        "text-secondary-emphasis",
      )}
    >
      <Ban className="me-1" />
      Skipped
    </span>
  );
}

function StorageCredentialBadge() {
  return (
    <span
      className={cx(
        "ms-2",
        "border",
        "badge",
        "fw-normal",
        "border-success",
        "bg-success-subtle",
        "text-success-emphasis",
      )}
    >
      <Check className="me-1" />
      Test succeeded
    </span>
  );
}

function splitCredentialConfigs(configs: DataConnectorConfiguration[]) {
  const credentialConfigs: DataConnectorConfiguration[] = [];
  const otherConfigs: DataConnectorConfiguration[] = [];
  configs.forEach((config) => {
    if (config.sensitiveFieldDefinitions.length > 0) {
      credentialConfigs.push(config);
    } else {
      otherConfigs.push(config);
    }
  });
  return { credentialConfigs, otherConfigs };
}

function savedCredentialFields(config: DataConnectorConfiguration) {
  if (config.savedCredentialFields == null) {
    return {};
  }
  return Object.fromEntries(
    config.savedCredentialFields.map((secret) => [
      storageSecretNameToFieldName({ name: secret }),
      secret,
    ]),
  );
}

function storageCredentialAccordionId(dataConnectorId: string): string {
  return `storage-credential-${encodeURIComponent(dataConnectorId)}`;
}

function storageCredentialDataCy(skipped: boolean, succeeded: boolean) {
  if (succeeded) {
    return "session-wizard-resolved-item";
  }
  if (skipped) {
    return "session-wizard-skipped-item";
  }
  return undefined;
}
