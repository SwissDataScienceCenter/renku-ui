/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { usePostStoragesV2ByStorageIdSecretsMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import {
  CloudStorageGetV2Read,
  CloudStoragePatch,
  PostStoragesV2ApiArg,
  RCloneConfig,
  usePatchStoragesV2ByStorageIdMutation,
  usePostStoragesV2Mutation,
} from "../../projectsV2/api/storagesV2.api";

import AddStorageBreadcrumbNavbar from "../../project/components/cloudStorage/AddStorageBreadcrumbNavbar";
import {
  useGetCloudStorageSchemaQuery,
  useTestCloudStorageConnectionMutation,
} from "../../project/components/cloudStorage/projectCloudStorage.api";
import {
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  CLOUD_STORAGE_TOTAL_STEPS,
  EMPTY_CLOUD_STORAGE_DETAILS,
  EMPTY_CLOUD_STORAGE_STATE,
} from "../../project/components/cloudStorage/projectCloudStorage.constants";
import {
  AddCloudStorageForProjectParams,
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageDetailsOptions,
  CredentialSaveStatus,
  TestCloudStorageConnectionParams,
} from "../../project/components/cloudStorage/projectCloudStorage.types";

import {
  AddCloudStorageContinueButton,
  AddCloudStorageBackButton,
  AddCloudStorageConnectionTestResult,
  AddCloudStorageHeaderContent,
} from "../../project/components/cloudStorage/cloudStorageModalComponents";
import {
  findSensitive,
  getCurrentStorageDetails,
  getSchemaProviders,
  hasProviderShortlist,
} from "../../project/utils/projectCloudStorage.utils";

import styles from "../../project/components/cloudStorage/CloudStorage.module.scss";

import DataConnectorModalBody from "./DataConnectorModalBody";

interface DataConnectorModalProps {
  currentStorage?: CloudStorageGetV2Read | null;
  isOpen: boolean;
  toggle: () => void;
  projectId: string;
}
export default function DataConnectorModal({
  currentStorage = null,
  isOpen,
  toggle: originalToggle,
  projectId,
}: DataConnectorModalProps) {
  const storageId = currentStorage?.storage.storage_id ?? null;
  // Fetch available schema when users open the modal
  const {
    data: schema,
    error: schemaError,
    isFetching: schemaIsFetching,
  } = useGetCloudStorageSchemaQuery(isOpen ? undefined : skipToken);

  // Reset state on props change
  useEffect(() => {
    const cloudStorageDetails: CloudStorageDetails =
      currentStorage != null
        ? getCurrentStorageDetails(currentStorage)
        : EMPTY_CLOUD_STORAGE_DETAILS;
    const cloudStorageState: AddCloudStorageState =
      currentStorage != null
        ? {
            ...EMPTY_CLOUD_STORAGE_STATE,
            step: 2,
            completedSteps: CLOUD_STORAGE_TOTAL_STEPS,
          }
        : EMPTY_CLOUD_STORAGE_STATE;
    setStorageDetails(cloudStorageDetails);
    setState(cloudStorageState);
  }, [currentStorage]);

  const [success, setSuccess] = useState(false);
  const [credentialSaveStatus, setCredentialSaveStatus] =
    useState<CredentialSaveStatus>("none");
  const [validationSucceeded, setValidationSucceeded] = useState(false);
  const [state, setState] = useState<AddCloudStorageState>(
    EMPTY_CLOUD_STORAGE_STATE
  );
  const [storageDetails, setStorageDetails] = useState<CloudStorageDetails>(
    EMPTY_CLOUD_STORAGE_DETAILS
  );

  // Enhanced setters
  const setStateSafe = useCallback(
    (newState: Partial<AddCloudStorageState>) => {
      const fullNewState = {
        ...state,
        ...newState,
      };
      if (isEqual(fullNewState, state)) {
        return;
      }

      // Handle advanced mode changes
      if (
        fullNewState.advancedMode !== state.advancedMode &&
        fullNewState.step !== 3
      ) {
        if (fullNewState.advancedMode) {
          fullNewState.step = 0;
        } else {
          if (
            // schema and provider (where necessary) must also exist in the list
            !storageDetails.schema ||
            !schema?.find((s) => s.prefix === storageDetails.schema) ||
            (hasProviderShortlist(storageDetails.schema) &&
              (!storageDetails.provider ||
                !getSchemaProviders(schema, false, storageDetails.schema)?.find(
                  (p) => p.name === storageDetails.provider
                )))
          ) {
            fullNewState.step = 1;
          } else {
            fullNewState.step = 2;
          }
        }
      }
      setState(fullNewState);
    },
    [state, storageDetails, schema]
  );

  // Reset
  const [redraw, setRedraw] = useState(false);
  useEffect(() => {
    if (redraw) setRedraw(false);
  }, [redraw]);

  // Mutations
  const [addCloudStorageForProjectV2, addResultV2] =
    usePostStoragesV2Mutation();
  const [modifyCloudStorageV2ForProject, modifyResultV2] =
    usePatchStoragesV2ByStorageIdMutation();
  const [saveCredentials, saveCredentialsResult] =
    usePostStoragesV2ByStorageIdSecretsMutation();
  const [validateCloudStorageConnection, validationResult] =
    useTestCloudStorageConnectionMutation();

  const reset = useCallback(() => {
    const resetStatus = getCurrentStorageDetails(currentStorage);
    setState((prevState) =>
      currentStorage != null
        ? {
            ...EMPTY_CLOUD_STORAGE_STATE,
            step: prevState.step,
            completedSteps: prevState.completedSteps,
          }
        : {
            ...EMPTY_CLOUD_STORAGE_STATE,
          }
    );
    addResultV2.reset();
    validationResult.reset();
    setStorageDetails(resetStatus);
    setSuccess(false);
    setCredentialSaveStatus("none");
    setValidationSucceeded(false);
    setRedraw(true); // This forces re-loading the useForm fields
  }, [addResultV2, currentStorage, validationResult]);

  const setStorageDetailsSafe = useCallback(
    (newStorageDetails: Partial<CloudStorageDetails>) => {
      const fullNewDetails = {
        ...storageDetails,
        ...newStorageDetails,
      };
      if (isEqual(fullNewDetails, storageDetails)) {
        return;
      }
      // reset follow-up properties: schema > provider > options
      if (fullNewDetails.schema !== storageDetails.schema) {
        fullNewDetails.provider = undefined;
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
      } else if (fullNewDetails.provider !== storageDetails.provider) {
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
      }
      if (!validationResult.isUninitialized) validationResult.reset();
      setStorageDetails(fullNewDetails);
    },
    [storageDetails, validationResult]
  );

  const validateConnection = useCallback(() => {
    const validateParameters: TestCloudStorageConnectionParams = {
      configuration: {
        type: storageDetails.schema,
      },
      source_path: storageDetails.sourcePath ?? "/",
    };
    if (storageDetails.provider) {
      validateParameters.configuration.provider = storageDetails.provider;
    }
    if (
      storageDetails.options &&
      Object.keys(storageDetails.options).length > 0
    ) {
      const options = storageDetails.options as CloudStorageDetailsOptions;
      Object.entries(options).forEach(([key, value]) => {
        if (value != undefined && value !== "") {
          validateParameters.configuration[key] = value;
        }
      });
    }

    validateCloudStorageConnection(validateParameters);
  }, [storageDetails, validateCloudStorageConnection]);

  const addOrEditStorage = useCallback(() => {
    const storageParameters:
      | AddCloudStorageForProjectParams
      | CloudStoragePatch = {
      name: storageDetails.name as string,
      readonly: storageDetails.readOnly ?? true,
      project_id: `${projectId}`,
      source_path: storageDetails.sourcePath ?? "/",
      target_path: storageDetails.mountPoint as string,
      configuration: { type: storageDetails.schema },
      private: false,
    };
    // Add provider when required
    if (storageDetails.provider) {
      storageParameters.configuration = {
        ...storageParameters.configuration,
        provider: storageDetails.provider,
      };
    }
    // Add options if any
    if (
      storageDetails.options &&
      Object.keys(storageDetails.options).length > 0
    ) {
      const allOptions = storageDetails.options as CloudStorageDetailsOptions;
      const sensitiveFields = schema
        ? findSensitive(schema.find((s) => s.prefix === storageDetails.schema))
        : currentStorage?.sensitive_fields
        ? currentStorage.sensitive_fields.map((field) => field.name)
        : [];
      const validOptions = Object.keys(
        storageDetails.options
      ).reduce<CloudStorageDetailsOptions>((options, key) => {
        const value = allOptions[key];
        if (value != undefined && value !== "") {
          options[key] = sensitiveFields.includes(key)
            ? CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN
            : value;
        }
        return options;
      }, {});

      storageParameters.configuration = {
        ...storageParameters.configuration,
        ...validOptions,
      };
    }

    // We manually set success only when we get an ID back. That's just to show a success message
    if (storageId) {
      const cloudStoragePatch: CloudStoragePatch = {
        project_id: projectId,
        name: storageParameters.name,
        configuration: storageParameters.configuration as RCloneConfig,
        source_path: storageParameters.source_path,
        target_path: storageParameters.target_path,
        readonly: storageParameters.readonly,
      };
      modifyCloudStorageV2ForProject({
        storageId: storageId,
        cloudStoragePatch,
      }).then((result) => {
        if ("data" in result && result.data.storage.storage_id) {
          setSuccess(true);
        }
      });
    } else {
      const parameterV2 = {
        body: storageParameters,
      } as PostStoragesV2ApiArg;
      addCloudStorageForProjectV2(parameterV2).then((result) => {
        if ("data" in result && result.data.storage.storage_id) {
          setSuccess(true);
        }
      });
    }
  }, [
    addCloudStorageForProjectV2,
    currentStorage,
    modifyCloudStorageV2ForProject,
    projectId,
    schema,
    storageDetails,
    storageId,
  ]);

  const toggle = useCallback(() => {
    originalToggle();
    setCredentialSaveStatus("none");
    setValidationSucceeded(false);
    if (success) {
      setSuccess(false);
      reset();
    } else {
      addResultV2.reset();
      validationResult.reset();
    }
  }, [addResultV2, originalToggle, reset, success, validationResult]);

  // Handle unmount
  useEffect(() => {
    const cleanup = () => {
      reset();
    };

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schemaRequiresProvider = useMemo(
    () => hasProviderShortlist(storageDetails.schema),
    [storageDetails.schema]
  );

  useEffect(() => {
    const storageId = addResultV2.data?.storage?.storage_id;
    if (storageId == null) return;
    const shouldSaveCredentials = shouldSaveDataConnectorCredentials(
      storageDetails.options,
      state.saveCredentials,
      validationSucceeded
    );
    if (!shouldSaveCredentials) {
      return;
    }
    const options = storageDetails.options as CloudStorageDetailsOptions;
    if (!schema) return;
    const sensitiveFieldNames = findSensitive(
      schema.find((s) => s.prefix === storageDetails.schema)
    );
    const cloudStorageSecretPostList = sensitiveFieldNames
      .map((name) => ({
        name,
        value: options[name],
      }))
      .filter((secret) => secret.value != undefined && secret.value != "")
      .map((secret) => ({
        name: secret.name,
        value: "" + secret.value,
      }));
    saveCredentials({
      storageId,
      cloudStorageSecretPostList,
    });
  }, [
    addResultV2.data?.storage?.storage_id,
    saveCredentials,
    state.saveCredentials,
    schema,
    storageDetails.options,
    storageDetails.schema,
    validationSucceeded,
  ]);

  useEffect(() => {
    if (!validationSucceeded) {
      setCredentialSaveStatus("none");
      return;
    }
    if (
      addResultV2.data?.storage?.storage_id == null ||
      saveCredentialsResult.isUninitialized
    ) {
      setCredentialSaveStatus("none");
      return;
    }
    if (saveCredentialsResult.isLoading) {
      setCredentialSaveStatus("trying");
      return;
    }
    if (saveCredentialsResult.isSuccess) {
      setCredentialSaveStatus("success");
      return;
    }
    if (saveCredentialsResult.isError) {
      setCredentialSaveStatus("failure");
      return;
    }
    setCredentialSaveStatus("none");
  }, [addResultV2, saveCredentialsResult, validationSucceeded]);

  // Visual elements
  const disableContinueButton =
    state.step === 1 &&
    (!storageDetails.schema ||
      (schemaRequiresProvider && !storageDetails.provider));

  const isAddResultLoading = addResultV2.isLoading;
  const isModifyResultLoading = modifyResultV2.isLoading;
  const addResultError = addResultV2.error;
  const modifyResultError = modifyResultV2.error;
  const addResultStorageName = addResultV2?.data?.storage?.name;

  const disableAddButton =
    isAddResultLoading ||
    isModifyResultLoading ||
    !storageDetails.name ||
    !storageDetails.mountPoint ||
    !storageDetails.schema ||
    (hasProviderShortlist(storageDetails.schema) && !storageDetails.provider);
  const addButtonDisableReason = isAddResultLoading
    ? "Please wait, the storage is being added"
    : modifyResultV2.isLoading
    ? "Please wait, the storage is being modified"
    : !storageDetails.name
    ? "Please provide a name"
    : !storageDetails.mountPoint
    ? "Please provide a mount point"
    : !storageDetails.schema
    ? "Please go back and select a storage type"
    : "Please go back and select a provider";
  const isResultLoading = isAddResultLoading || isModifyResultLoading;

  const storageSecrets =
    currentStorage != null && "secrets" in currentStorage
      ? currentStorage.secrets ?? []
      : [];
  const hasStoredCredentialsInConfig = storageSecrets.length > 0;

  return (
    <Modal
      backdrop="static"
      centered
      className={styles.modal}
      data-cy="cloud-storage-edit-modal"
      fullscreen="lg"
      id={currentStorage?.storage.storage_id ?? "new-cloud-storage"}
      isOpen={isOpen}
      scrollable
      size="lg"
      unmountOnClose={false}
      toggle={toggle}
    >
      <ModalHeader toggle={toggle} data-cy="cloud-storage-edit-header">
        <AddCloudStorageHeaderContent isV2={true} storageId={storageId} />
      </ModalHeader>

      <ModalBody data-cy="cloud-storage-edit-body">
        <DataConnectorModalBody
          addResultStorageName={addResultStorageName}
          credentialSaveStatus={credentialSaveStatus}
          isV2={true}
          redraw={redraw}
          schema={schema}
          schemaError={schemaError}
          schemaIsFetching={schemaIsFetching}
          setStateSafe={setStateSafe}
          setStorageDetailsSafe={setStorageDetailsSafe}
          state={state}
          storageDetails={storageDetails}
          storageSecrets={storageSecrets}
          storageId={storageId}
          success={success}
          validationSucceeded={validationSucceeded}
        />
      </ModalBody>

      <ModalFooter className="border-top" data-cy="cloud-storage-edit-footer">
        <AddCloudStorageConnectionTestResult
          validationResult={validationResult}
        />
        {(addResultError || modifyResultError) && (
          <div className="w-100">
            <RtkOrNotebooksError error={addResultError || modifyResultError} />
          </div>
        )}
        <div className={cx("d-flex", "flex-grow-1")}>
          <AddStorageBreadcrumbNavbar state={state} setState={setStateSafe} />
        </div>
        {!isResultLoading && !success && (
          <Button
            color="outline-danger"
            data-cy="cloud-storage-edit-rest-button"
            disabled={validationResult.isLoading}
            onClick={() => {
              reset();
            }}
          >
            <ArrowCounterclockwise className={cx("bi", "me-1")} />
            Reset
          </Button>
        )}
        {!isResultLoading && (
          <AddCloudStorageBackButton
            setStateSafe={setStateSafe}
            state={state}
            success={success}
            toggle={toggle}
            validationResult={validationResult}
          />
        )}
        {!success && (
          <AddCloudStorageContinueButton
            addButtonDisableReason={addButtonDisableReason}
            addOrEditStorage={addOrEditStorage}
            disableAddButton={disableAddButton}
            disableContinueButton={disableContinueButton}
            hasStoredCredentialsInConfig={hasStoredCredentialsInConfig}
            isResultLoading={isResultLoading}
            setStateSafe={setStateSafe}
            setValidationSucceeded={setValidationSucceeded}
            state={state}
            storageDetails={storageDetails}
            storageId={storageId}
            validateConnection={validateConnection}
            validationResult={validationResult}
          />
        )}
      </ModalFooter>
    </Modal>
  );
}

function shouldSaveDataConnectorCredentials(
  storageDetailsOptions: CloudStorageDetailsOptions | undefined,
  stateSaveCredentials: boolean,
  validationSucceeded: boolean
) {
  return !!(
    storageDetailsOptions &&
    stateSaveCredentials &&
    validationSucceeded
  );
}
