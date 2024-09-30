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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowCounterclockwise, Database } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";

import AddStorageBreadcrumbNavbar from "../../../project/components/cloudStorage/AddStorageBreadcrumbNavbar";
import {
  useGetCloudStorageSchemaQuery,
  useTestCloudStorageConnectionMutation,
} from "../../../project/components/cloudStorage/projectCloudStorage.api";
import {
  CLOUD_STORAGE_TOTAL_STEPS,
  EMPTY_CLOUD_STORAGE_STATE,
} from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageDetailsOptions,
  TestCloudStorageConnectionParams,
} from "../../../project/components/cloudStorage/projectCloudStorage.types";

import {
  findSensitive,
  getSchemaProviders,
  hasProviderShortlist,
} from "../../../project/utils/projectCloudStorage.utils";

import {
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsMutation,
} from "../../api/data-connectors.enhanced-api";
import type { DataConnectorRead } from "../../api/data-connectors.api";

import { projectV2Api } from "../../../projectsV2/api/projectV2.enhanced-api";

import styles from "./DataConnectorModal.module.scss";

import {
  DataConnectorModalBackButton,
  DataConnectorModalContinueButton,
  DataConnectorConnectionTestResult,
} from "./dataConnectorModalButtons";
import DataConnectorModalBody from "./DataConnectorModalBody";
import type { AuxiliaryCommandStatus } from "./DataConnectorModalResult";
import {
  dataConnectorPostFromFlattened,
  dataConnectorToFlattened,
  EMPTY_DATA_CONNECTOR_FLAT,
  type DataConnectorFlat,
} from "../dataConnector.utils";

export function DataConnectorModalBodyAndFooter({
  dataConnector = null,
  isOpen,
  namespace,
  projectId,
  toggle: originalToggle,
}: DataConnectorModalProps) {
  const dataConnectorId = dataConnector?.id ?? null;
  // Fetch available schema when users open the modal
  const schemaQueryResult = useGetCloudStorageSchemaQuery(
    isOpen ? undefined : skipToken
  );
  const { data: schema } = schemaQueryResult;
  const { data: connectorSecrets } =
    useGetDataConnectorsByDataConnectorIdSecretsQuery(
      dataConnectorId ? { dataConnectorId } : skipToken
    );

  // Reset state on props change
  useEffect(() => {
    const flattened = dataConnectorToFlattened(dataConnector);
    const cloudStorageState: AddCloudStorageState =
      dataConnector != null
        ? {
            ...EMPTY_CLOUD_STORAGE_STATE,
            step: 2,
            completedSteps: CLOUD_STORAGE_TOTAL_STEPS,
          }
        : EMPTY_CLOUD_STORAGE_STATE;
    setFlatDataConnector(flattened);
    setState(cloudStorageState);
  }, [dataConnector]);

  const [success, setSuccess] = useState(false);
  const [credentialSaveStatus, setCredentialSaveStatus] =
    useState<AuxiliaryCommandStatus>("none");
  const [projectLinkStatus, setProjectLinkStatus] =
    useState<AuxiliaryCommandStatus>("none");
  const [validationSucceeded, setValidationSucceeded] = useState(false);
  const [state, setState] = useState<AddCloudStorageState>(
    EMPTY_CLOUD_STORAGE_STATE
  );
  const initialFlatDataConnector = EMPTY_DATA_CONNECTOR_FLAT;
  initialFlatDataConnector.namespace = namespace;
  const [flatDataConnector, setFlatDataConnector] = useState<DataConnectorFlat>(
    initialFlatDataConnector
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
            !flatDataConnector.schema ||
            !schema?.find((s) => s.prefix === flatDataConnector.schema) ||
            (hasProviderShortlist(flatDataConnector.schema) &&
              (!flatDataConnector.provider ||
                !getSchemaProviders(
                  schema,
                  false,
                  flatDataConnector.schema
                )?.find((p) => p.name === flatDataConnector.provider)))
          ) {
            fullNewState.step = 1;
          } else {
            fullNewState.step = 2;
          }
        }
      }
      setState(fullNewState);
    },
    [state, flatDataConnector, schema]
  );

  // Reset
  const [redraw, setRedraw] = useState(false);
  useEffect(() => {
    if (redraw) setRedraw(false);
  }, [redraw]);

  // Mutations
  const [createDataConnector, createResult] = usePostDataConnectorsMutation();
  const [updateDataConnector, updateResult] =
    usePatchDataConnectorsByDataConnectorIdMutation();
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();
  const [createProjectLink, createProjectLinkResult] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();
  const [validateCloudStorageConnection, validationResult] =
    useTestCloudStorageConnectionMutation();

  const reset = useCallback(() => {
    const resetStatus = dataConnectorToFlattened(dataConnector);
    setState((prevState) =>
      dataConnector != null
        ? {
            ...EMPTY_CLOUD_STORAGE_STATE,
            step: prevState.step,
            completedSteps: prevState.completedSteps,
          }
        : {
            ...EMPTY_CLOUD_STORAGE_STATE,
          }
    );
    createResult.reset();
    validationResult.reset();
    setFlatDataConnector(resetStatus);
    setSuccess(false);
    setCredentialSaveStatus("none");
    setValidationSucceeded(false);
    setRedraw(true); // This forces re-loading the useForm fields
  }, [createResult, dataConnector, validationResult]);

  const setFlatDataConnectorSafe = useCallback(
    (newDataConnector: Partial<DataConnectorFlat>) => {
      const fullNewDetails = {
        ...flatDataConnector,
        ...newDataConnector,
      };
      if (isEqual(fullNewDetails, flatDataConnector)) {
        return;
      }
      // reset follow-up properties: schema > provider > options
      if (fullNewDetails.schema !== flatDataConnector.schema) {
        fullNewDetails.provider = undefined;
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
      } else if (fullNewDetails.provider !== flatDataConnector.provider) {
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
      }
      if (!validationResult.isUninitialized) validationResult.reset();
      setFlatDataConnector(fullNewDetails);
    },
    [flatDataConnector, validationResult]
  );

  const validateConnection = useCallback(() => {
    const validateParameters: TestCloudStorageConnectionParams = {
      configuration: {
        type: flatDataConnector.schema,
      },
      source_path: flatDataConnector.sourcePath ?? "/",
    };
    if (flatDataConnector.provider) {
      validateParameters.configuration.provider = flatDataConnector.provider;
    }
    if (
      flatDataConnector.options &&
      Object.keys(flatDataConnector.options).length > 0
    ) {
      const options = flatDataConnector.options as CloudStorageDetailsOptions;
      Object.entries(options).forEach(([key, value]) => {
        if (value != undefined && value !== "") {
          validateParameters.configuration[key] = value;
        }
      });
    }
    validateCloudStorageConnection(validateParameters);
  }, [flatDataConnector, validateCloudStorageConnection]);

  const addOrEditStorage = useCallback(() => {
    const dataConnectorPost = dataConnectorPostFromFlattened(
      flatDataConnector,
      schema ?? [],
      dataConnector
    );

    // We manually set success only when we get an ID back. That's just to show a success message
    if (dataConnector && dataConnectorId) {
      updateDataConnector({
        dataConnectorId,
        dataConnectorPatch: dataConnectorPost,
        "If-Match": dataConnector.etag,
      }).then((result) => {
        if ("data" in result && result.data.id) {
          setSuccess(true);
        }
      });
    } else {
      createDataConnector({
        dataConnectorPost,
      }).then((result) => {
        if ("data" in result && result.data.id) {
          setSuccess(true);
        }
      });
    }
  }, [
    createDataConnector,
    dataConnector,
    dataConnectorId,
    updateDataConnector,
    schema,
    flatDataConnector,
  ]);

  const toggle = useCallback(() => {
    originalToggle();
    setCredentialSaveStatus("none");
    setValidationSucceeded(false);
    if (success) {
      setSuccess(false);
      reset();
    } else {
      createResult.reset();
      validationResult.reset();
    }
  }, [createResult, originalToggle, reset, success, validationResult]);

  // Handle unmount
  useEffect(() => {
    const cleanup = () => {
      reset();
    };

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schemaRequiresProvider = useMemo(
    () => hasProviderShortlist(flatDataConnector.schema),
    [flatDataConnector.schema]
  );

  useEffect(() => {
    const dataConnectorId = createResult.data?.id;
    if (dataConnectorId == null) return;
    const shouldSaveCredentials = shouldSaveDataConnectorCredentials(
      flatDataConnector.options,
      state.saveCredentials,
      validationSucceeded
    );
    if (!shouldSaveCredentials) return;

    const options = flatDataConnector.options as CloudStorageDetailsOptions;
    if (!schema) return;
    const sensitiveFieldNames = findSensitive(
      schema.find((s) => s.prefix === flatDataConnector.schema)
    );
    const dataConnectorSecretPatchList = sensitiveFieldNames
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
      dataConnectorId,
      dataConnectorSecretPatchList,
    });
  }, [
    createResult.data?.id,
    saveCredentials,
    state.saveCredentials,
    schema,
    flatDataConnector.options,
    flatDataConnector.schema,
    validationSucceeded,
  ]);

  useEffect(() => {
    const status = !validationSucceeded
      ? "none"
      : createResult.data?.id == null || saveCredentialsResult.isUninitialized
      ? "none"
      : saveCredentialsResult.isLoading
      ? "trying"
      : saveCredentialsResult.isSuccess
      ? "success"
      : saveCredentialsResult.isError
      ? "failure"
      : "none";
    setCredentialSaveStatus(status);
  }, [createResult, saveCredentialsResult, validationSucceeded]);

  useEffect(() => {
    const dataConnectorId = createResult.data?.id;
    if (dataConnectorId == null) return;
    const shouldLinkToProject = projectId != null && dataConnector == null;
    if (!shouldLinkToProject) return;

    createProjectLink({
      dataConnectorId,
      dataConnectorToProjectLinkPost: {
        project_id: projectId,
      },
    });
  }, [createResult.data?.id, createProjectLink, dataConnector, projectId]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (createProjectLinkResult.isSuccess) {
      dispatch(projectV2Api.util.invalidateTags(["DataConnectors"]));
    }
    const status =
      projectId == null
        ? "none"
        : createResult.data?.id == null ||
          createProjectLinkResult.isUninitialized
        ? "none"
        : createProjectLinkResult.isLoading
        ? "trying"
        : createProjectLinkResult.isSuccess
        ? "success"
        : createProjectLinkResult.isError
        ? "failure"
        : "none";
    setProjectLinkStatus(status);
  }, [createResult, createProjectLinkResult, dispatch, projectId]);

  // Visual elements
  const disableContinueButton =
    state.step === 1 &&
    (!flatDataConnector.schema ||
      (schemaRequiresProvider && !flatDataConnector.provider));

  const isAddResultLoading = createResult.isLoading;
  const isModifyResultLoading = updateResult.isLoading;
  const actionError = createResult.error || updateResult.error;
  const dataConnectorResultNamespace =
    createResult?.data?.namespace || updateResult?.data?.namespace;
  const dataConnectorResultSlug =
    createResult?.data?.slug || updateResult?.data?.slug;
  const dataConnectorResultName = `${dataConnectorResultNamespace}/${dataConnectorResultSlug}`;

  const disableAddButton =
    isAddResultLoading ||
    isModifyResultLoading ||
    !flatDataConnector.name ||
    !flatDataConnector.mountPoint ||
    !flatDataConnector.schema ||
    (hasProviderShortlist(flatDataConnector.schema) &&
      !flatDataConnector.provider);
  const addButtonDisableReason = isAddResultLoading
    ? "Please wait, the storage is being added"
    : updateResult.isLoading
    ? "Please wait, the storage is being modified"
    : !flatDataConnector.name
    ? "Please provide a name"
    : !flatDataConnector.mountPoint
    ? "Please provide a mount point"
    : !flatDataConnector.schema
    ? "Please go back and select a storage type"
    : "Please go back and select a provider";
  const isResultLoading = isAddResultLoading || isModifyResultLoading;

  const hasStoredCredentialsInConfig =
    connectorSecrets != null && connectorSecrets.length > 0;

  return (
    <>
      <ModalBody data-cy="data-connector-edit-body">
        <DataConnectorModalBody
          dataConnectorResultName={dataConnectorResultName}
          flatDataConnector={flatDataConnector}
          credentialSaveStatus={credentialSaveStatus}
          projectLinkStatus={projectLinkStatus}
          redraw={redraw}
          schemaQueryResult={schemaQueryResult}
          setStateSafe={setStateSafe}
          setFlatDataConnectorSafe={setFlatDataConnectorSafe}
          state={state}
          storageSecrets={connectorSecrets ?? []}
          success={success}
          validationSucceeded={validationSucceeded}
        />
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <DataConnectorConnectionTestResult
          validationResult={validationResult}
        />
        {actionError && (
          <div className="w-100">
            <RtkOrNotebooksError error={actionError} />
          </div>
        )}
        <div className={cx("d-flex", "flex-grow-1")}>
          <AddStorageBreadcrumbNavbar state={state} setState={setStateSafe} />
        </div>
        {!isResultLoading && !success && (
          <Button
            color="outline-danger"
            data-cy="data-connector-edit-rest-button"
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
          <DataConnectorModalBackButton
            setStateSafe={setStateSafe}
            state={state}
            success={success}
            toggle={toggle}
            validationResult={validationResult}
          />
        )}
        {!success && (
          <DataConnectorModalContinueButton
            addButtonDisableReason={addButtonDisableReason}
            addOrEditStorage={addOrEditStorage}
            disableAddButton={disableAddButton}
            disableContinueButton={disableContinueButton}
            hasStoredCredentialsInConfig={hasStoredCredentialsInConfig}
            isResultLoading={isResultLoading}
            setStateSafe={setStateSafe}
            setValidationSucceeded={setValidationSucceeded}
            state={state}
            storageDetails={flatDataConnector}
            storageId={dataConnectorId}
            validateConnection={validateConnection}
            validationResult={validationResult}
          />
        )}
      </ModalFooter>
    </>
  );
}

interface DataConnectorModalProps {
  dataConnector?: DataConnectorRead | null;
  isOpen: boolean;
  namespace: string;
  projectId?: string;
  toggle: () => void;
}
export default function DataConnectorModal({
  dataConnector = null,
  isOpen,
  namespace,
  projectId,
  toggle,
}: DataConnectorModalProps) {
  const dataConnectorId = dataConnector?.id ?? null;
  return (
    <Modal
      backdrop="static"
      centered
      className={styles.modal}
      data-cy="data-connector-edit-modal"
      fullscreen="lg"
      id={dataConnector?.id ?? "new-data-connector"}
      isOpen={isOpen}
      scrollable
      size="lg"
      unmountOnClose={false}
      toggle={toggle}
    >
      <ModalHeader toggle={toggle} data-cy="data-connector-edit-header">
        <DataConnectorModalHeader dataConnectorId={dataConnectorId} />
      </ModalHeader>
      <DataConnectorModalBodyAndFooter
        {...{
          dataConnector,
          isOpen,
          namespace,
          projectId,
          toggle,
        }}
      />
    </Modal>
  );
}

interface DataConnectorModalHeaderProps {
  dataConnectorId: string | null;
}
export function DataConnectorModalHeader({
  dataConnectorId,
}: DataConnectorModalHeaderProps) {
  return (
    <>
      <Database className={cx("bi", "me-1")} />{" "}
      {dataConnectorId ? "Edit" : "Add"} data connector
    </>
  );
}

function shouldSaveDataConnectorCredentials(
  flatDataConnectorOptions: CloudStorageDetailsOptions | undefined,
  stateSaveCredentials: boolean,
  validationSucceeded: boolean
) {
  return !!(
    flatDataConnectorOptions &&
    stateSaveCredentials &&
    validationSucceeded
  );
}
