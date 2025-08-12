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
import { useCallback, useEffect, useMemo } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";

import AddStorageBreadcrumbNavbar from "../../../project/components/cloudStorage/AddStorageBreadcrumbNavbar";
import {
  AddCloudStorageState,
  CloudStorageDetailsOptions,
} from "../../../project/components/cloudStorage/projectCloudStorage.types";

import {
  findSensitive,
  hasProviderShortlist,
} from "../../../project/utils/projectCloudStorage.utils";

import type { Project } from "../../../projectsV2/api/projectV2.api";

import type { DataConnectorRead } from "../../api/data-connectors.api";
import {
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsMutation,
} from "../../api/data-connectors.enhanced-api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";

import {
  dataConnectorPostFromFlattened,
  dataConnectorToFlattened,
  hasSchemaAccessMode,
} from "../dataConnector.utils";
import {
  DataConnectorConnectionTestResult,
  DataConnectorModalBackButton,
  DataConnectorModalContinueButton,
} from "./dataConnectorModalButtons";

interface DataConnectorModalFooterProps {
  dataConnector?: DataConnectorRead | null;
  isOpen: boolean;
  project?: Project;
  toggle: () => void;
  initialStep?: number;
}

function DataConnectorCreateFooter({
  dataConnector = null,
  isOpen,
  project,
  toggle,
}: DataConnectorModalFooterProps) {
  const dispatch = useAppDispatch();
  const {
    cloudStorageState,
    credentialSaveStatus,
    dataConnectorResultId,
    flatDataConnector,
    isActionOngoing,
    projectLinkStatus,
    schemata,
    success,
    validationResult,
  } = useAppSelector((state) => state.dataConnectorFormSlice);

  // Enhanced setters
  const setStateSafe = useCallback(
    (newState: Partial<AddCloudStorageState>) => {
      dispatch(
        dataConnectorFormSlice.actions.setCloudStorageState({
          cloudStorageState: newState,
        })
      );
    },
    [dispatch]
  );

  // Mutations
  const [createDataConnector, createResult] = usePostDataConnectorsMutation();
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();
  const [createProjectLink, createProjectLinkResult] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const reset = useCallback(() => {
    const resetStatus = dataConnectorToFlattened(dataConnector);
    createResult.reset();
    saveCredentialsResult.reset();
    createProjectLinkResult.reset();

    dispatch(
      dataConnectorFormSlice.actions.reset({
        flatDataConnector: resetStatus,
        hasDataConnector: dataConnector != null,
      })
    );
  }, [
    createResult,
    dataConnector,
    dispatch,
    saveCredentialsResult,
    createProjectLinkResult,
  ]);

  // Reset the state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const addStorage = useCallback(() => {
    const dataConnectorPost = dataConnectorPostFromFlattened(
      flatDataConnector,
      schemata ?? [],
      dataConnector
    );

    createDataConnector({
      dataConnectorPost,
    });
  }, [createDataConnector, dataConnector, schemata, flatDataConnector]);

  const currentSchema = useMemo(
    () => schemata?.find((s) => s.prefix === flatDataConnector.schema),
    [schemata, flatDataConnector]
  );
  const schemaHasAccessModes = currentSchema
    ? hasSchemaAccessMode(currentSchema)
    : false;

  const schemaRequiresProvider = useMemo(
    () =>
      hasProviderShortlist(flatDataConnector.schema) || schemaHasAccessModes,
    [flatDataConnector.schema, schemaHasAccessModes]
  );

  useEffect(() => {
    if (
      "data" in createResult &&
      createResult.data != null &&
      createResult.data.id
    ) {
      const dataConnectorResultNamespace = createResult.data.namespace;
      const dataConnectorResultSlug = createResult.data.slug;
      const dataConnectorResultName = `${dataConnectorResultNamespace}/${dataConnectorResultSlug}`;
      dispatch(
        dataConnectorFormSlice.actions.setSuccess({
          success: true,
          dataConnectorResultId: createResult.data.id,
          dataConnectorResultName,
        })
      );
      createResult.reset();
    }
  }, [createResult, dispatch]);

  useEffect(() => {
    const dataConnectorId = dataConnectorResultId;
    if (dataConnectorId == null) return;
    if (!schemata) return;
    const sensitiveFieldNames = findSensitive(
      schemata.find((s) => s.prefix === flatDataConnector.schema)
    );
    const options = flatDataConnector.options as CloudStorageDetailsOptions;
    if (!options) return;
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
    const shouldSaveCredentials =
      shouldSaveDataConnectorCredentials(
        dataConnectorSecretPatchList,
        cloudStorageState.saveCredentials,
        validationResult?.isSuccess ?? false
      ) && credentialSaveStatus === "none";
    if (!shouldSaveCredentials) return;

    saveCredentials({
      dataConnectorId,
      dataConnectorSecretPatchList,
    });
  }, [
    credentialSaveStatus,
    dataConnectorResultId,
    saveCredentials,
    cloudStorageState.saveCredentials,
    schemata,
    flatDataConnector.options,
    flatDataConnector.schema,
    validationResult?.isSuccess,
  ]);

  useEffect(() => {
    if (
      credentialSaveStatus === "success" ||
      credentialSaveStatus === "failure"
    ) {
      return;
    }
    const status =
      validationResult?.isSuccess != true
        ? "none"
        : dataConnectorResultId == null || saveCredentialsResult.isUninitialized
        ? "none"
        : saveCredentialsResult.isLoading
        ? "trying"
        : saveCredentialsResult.isSuccess
        ? "success"
        : saveCredentialsResult.isError
        ? "failure"
        : "none";
    dispatch(
      dataConnectorFormSlice.actions.setCredentialSaveStatus({
        credentialSaveStatus: status,
      })
    );
  }, [
    credentialSaveStatus,
    dataConnectorResultId,
    dispatch,
    saveCredentialsResult,
    validationResult,
  ]);

  useEffect(() => {
    const dataConnectorId = dataConnectorResultId;
    if (dataConnectorId == null) return;
    const shouldLinkToProject =
      project?.id != null &&
      dataConnector == null &&
      projectLinkStatus === "none";
    if (!shouldLinkToProject) return;

    createProjectLink({
      dataConnectorId,
      dataConnectorToProjectLinkPost: {
        project_id: project.id,
      },
    });
  }, [
    createProjectLink,
    dataConnectorResultId,
    dataConnector,
    project?.id,
    projectLinkStatus,
  ]);

  useEffect(() => {
    if (projectLinkStatus === "success" || projectLinkStatus === "failure") {
      return;
    }
    const status =
      project?.id == null
        ? "none"
        : dataConnectorResultId == null ||
          createProjectLinkResult.isUninitialized
        ? "none"
        : createProjectLinkResult.isLoading
        ? "trying"
        : createProjectLinkResult.isSuccess
        ? "success"
        : createProjectLinkResult.isError
        ? "failure"
        : "none";
    dispatch(
      dataConnectorFormSlice.actions.setProjectLinkStatus({
        projectLinkStatus: status,
      })
    );
  }, [
    createProjectLinkResult,
    dataConnectorResultId,
    dispatch,
    project?.id,
    projectLinkStatus,
  ]);

  // Visual elements
  const disableContinueButton =
    cloudStorageState.step === 1 &&
    (!flatDataConnector.schema ||
      (schemaRequiresProvider && !flatDataConnector.provider));

  const isAddResultLoading = createResult.isLoading;
  const actionError = createResult.error;

  const disableAddButton =
    isAddResultLoading ||
    !flatDataConnector.name ||
    !flatDataConnector.mountPoint ||
    !flatDataConnector.schema ||
    (hasProviderShortlist(flatDataConnector.schema) &&
      !flatDataConnector.provider);
  const addButtonDisableReason = isAddResultLoading
    ? "Please wait, the storage is being added"
    : !flatDataConnector.name
    ? "Please provide a name"
    : !flatDataConnector.mountPoint
    ? "Please provide a mount point"
    : !flatDataConnector.schema
    ? "Please go back and select a storage type"
    : schemaHasAccessModes
    ? "Please go back and select a mode"
    : disableContinueButton
    ? "Please go back and select a provider"
    : "";
  const isResultLoading = isAddResultLoading;

  return (
    <>
      <DataConnectorConnectionTestResult />
      {actionError && (
        <div className="w-100">
          <RtkOrNotebooksError error={actionError} />
        </div>
      )}
      <div className={cx("d-flex", "flex-grow-1")}>
        <AddStorageBreadcrumbNavbar
          state={cloudStorageState}
          setState={setStateSafe}
        />
      </div>
      <div className={cx("d-flex", "gap-2")}>
        {!isResultLoading && !success && (
          <Button
            color="outline-danger"
            data-cy="data-connector-edit-rest-button"
            disabled={isActionOngoing}
            onClick={() => {
              reset();
            }}
          >
            <ArrowCounterclockwise className={cx("bi", "me-1")} />
            Reset
          </Button>
        )}
        {!isResultLoading && (
          <DataConnectorModalBackButton success={success} toggle={toggle} />
        )}
        {!success && (
          <DataConnectorModalContinueButton
            addButtonDisableReason={addButtonDisableReason}
            addOrEditStorage={addStorage}
            disableAddButton={disableAddButton}
            disableContinueButton={!!disableContinueButton}
            hasStoredCredentialsInConfig={false}
            isResultLoading={isResultLoading}
            dataConnectorId={null}
            selectedSchemaHasAccessMode={!!schemaHasAccessModes}
          />
        )}
      </div>
    </>
  );
}

interface DataConnectorEditFooterProps
  extends Omit<DataConnectorModalFooterProps, "dataConnector"> {
  dataConnector: DataConnectorRead;
}

function DataConnectorEditFooter({
  dataConnector,
  isOpen,
  toggle,
  initialStep,
}: DataConnectorEditFooterProps) {
  const dataConnectorId = dataConnector.id;
  const dispatch = useAppDispatch();
  const { data: connectorSecrets } =
    useGetDataConnectorsByDataConnectorIdSecretsQuery(
      dataConnectorId ? { dataConnectorId } : skipToken
    );
  const {
    cloudStorageState,
    flatDataConnector,
    isActionOngoing,
    schemata,
    success,
  } = useAppSelector((state) => state.dataConnectorFormSlice);

  // Mutations
  const [updateDataConnector, updateResult] =
    usePatchDataConnectorsByDataConnectorIdMutation();

  const reset = useCallback(() => {
    const resetStatus = dataConnectorToFlattened(dataConnector);
    updateResult.reset();

    dispatch(
      dataConnectorFormSlice.actions.reset({
        flatDataConnector: resetStatus,
        hasDataConnector: dataConnector != null,
      })
    );
  }, [dataConnector, dispatch, updateResult]);

  // Reset the state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const editStorage = useCallback(() => {
    const dataConnectorPost = dataConnectorPostFromFlattened(
      flatDataConnector,
      schemata ?? [],
      dataConnector
    );

    // We manually set success only when we get an ID back. That's just to show a success message

    updateDataConnector({
      dataConnectorId,
      dataConnectorPatch: dataConnectorPost,
      "If-Match": dataConnector.etag,
    });
  }, [
    dataConnector,
    dataConnectorId,
    updateDataConnector,
    schemata,
    flatDataConnector,
  ]);

  const currentSchema = useMemo(
    () => schemata?.find((s) => s.prefix === flatDataConnector.schema),
    [schemata, flatDataConnector]
  );
  const schemaHasAccessModes = currentSchema
    ? hasSchemaAccessMode(currentSchema)
    : false;

  const schemaRequiresProvider = useMemo(
    () =>
      hasProviderShortlist(flatDataConnector.schema) || schemaHasAccessModes,
    [flatDataConnector.schema, schemaHasAccessModes]
  );

  useEffect(() => {
    if (
      "data" in updateResult &&
      updateResult.data != null &&
      updateResult.data.id
    ) {
      const dataConnectorResultNamespace = updateResult.data.namespace;
      const dataConnectorResultSlug = updateResult.data.slug;
      const dataConnectorResultName = `${dataConnectorResultNamespace}/${dataConnectorResultSlug}`;
      dispatch(
        dataConnectorFormSlice.actions.setSuccess({
          success: true,
          dataConnectorResultId: updateResult.data.id,
          dataConnectorResultName,
        })
      );
      updateResult.reset();
    }
  }, [dispatch, updateResult]);

  // Visual elements
  const disableContinueButton =
    cloudStorageState.step === 1 &&
    (!flatDataConnector.schema ||
      (schemaRequiresProvider && !flatDataConnector.provider));

  const isModifyResultLoading = updateResult.isLoading;
  const actionError = updateResult.error;

  const disableAddButton =
    isModifyResultLoading ||
    !flatDataConnector.name ||
    !flatDataConnector.mountPoint ||
    !flatDataConnector.schema ||
    (hasProviderShortlist(flatDataConnector.schema) &&
      !flatDataConnector.provider);
  const addButtonDisableReason = updateResult.isLoading
    ? "Please wait, the storage is being modified"
    : !flatDataConnector.name
    ? "Please provide a name"
    : !flatDataConnector.mountPoint
    ? "Please provide a mount point"
    : !flatDataConnector.schema
    ? "Please go back and select a storage type"
    : schemaHasAccessModes
    ? "Please go back and select a mode"
    : "Please go back and select a provider";
  const isResultLoading = isModifyResultLoading;

  const hasStoredCredentialsInConfig =
    connectorSecrets != null && connectorSecrets.length > 0;

  return (
    <>
      <DataConnectorConnectionTestResult />
      {actionError && (
        <div className="w-100">
          <RtkOrNotebooksError error={actionError} />
        </div>
      )}
      {!isResultLoading && (
        <DataConnectorModalBackButton
          success={success}
          toggle={toggle}
          initialStep={initialStep}
        />
      )}
      {!isResultLoading && !success && (
        <Button
          color="outline-danger"
          data-cy="data-connector-edit-rest-button"
          disabled={isActionOngoing}
          onClick={() => {
            reset();
          }}
        >
          <ArrowCounterclockwise className={cx("bi", "me-1")} />
          Reset
        </Button>
      )}
      {!success && (
        <DataConnectorModalContinueButton
          addButtonDisableReason={addButtonDisableReason}
          addOrEditStorage={editStorage}
          disableAddButton={disableAddButton}
          disableContinueButton={!!disableContinueButton}
          hasStoredCredentialsInConfig={hasStoredCredentialsInConfig}
          isResultLoading={isResultLoading}
          dataConnectorId={dataConnectorId}
          selectedSchemaHasAccessMode={!!schemaHasAccessModes}
        />
      )}
    </>
  );
}

export default function DataConnectorModalFooter({
  dataConnector = null,
  isOpen,
  project,
  toggle,
  initialStep,
}: DataConnectorModalFooterProps) {
  if (dataConnector) {
    return (
      <DataConnectorEditFooter
        dataConnector={dataConnector}
        isOpen={isOpen}
        project={project}
        toggle={toggle}
        initialStep={initialStep}
      />
    );
  }
  return (
    <DataConnectorCreateFooter
      dataConnector={dataConnector}
      isOpen={isOpen}
      project={project}
      toggle={toggle}
    />
  );
}

function shouldSaveDataConnectorCredentials(
  dataConnectorSecretPatchList: { name: string; value: string }[],
  stateSaveCredentials: boolean,
  validationSucceeded: boolean
) {
  return !!(
    dataConnectorSecretPatchList.length > 0 &&
    stateSaveCredentials &&
    validationSucceeded
  );
}
