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
import { projectV2Api } from "../../../projectsV2/api/projectV2.enhanced-api";

import {
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
  usePatchDataConnectorsByDataConnectorIdMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsMutation,
} from "../../api/data-connectors.enhanced-api";
import type { DataConnectorRead } from "../../api/data-connectors.api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";

import {
  DataConnectorModalBackButton,
  DataConnectorModalContinueButton,
  DataConnectorConnectionTestResult,
} from "./dataConnectorModalButtons";
import {
  dataConnectorPostFromFlattened,
  dataConnectorToFlattened,
} from "../dataConnector.utils";

interface DataConnectorModalFooterProps {
  dataConnector?: DataConnectorRead | null;
  project?: Project;
  toggle: () => void;
}

export default function DataConnectorModalFooter({
  dataConnector = null,
  project,
  toggle,
}: DataConnectorModalFooterProps) {
  const dataConnectorId = dataConnector?.id ?? null;
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
  const [updateDataConnector, updateResult] =
    usePatchDataConnectorsByDataConnectorIdMutation();
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();
  const [createProjectLink, createProjectLinkResult] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const reset = useCallback(() => {
    const resetStatus = dataConnectorToFlattened(dataConnector);
    createResult.reset();
    updateResult.reset();
    dispatch(
      dataConnectorFormSlice.actions.reset({
        flatDataConnector: resetStatus,
        hasDataConnector: dataConnector != null,
      })
    );
  }, [createResult, dataConnector, dispatch, updateResult]);

  const addOrEditStorage = useCallback(() => {
    const dataConnectorPost = dataConnectorPostFromFlattened(
      flatDataConnector,
      schemata ?? [],
      dataConnector
    );

    // We manually set success only when we get an ID back. That's just to show a success message
    if (dataConnector && dataConnectorId) {
      updateDataConnector({
        dataConnectorId,
        dataConnectorPatch: dataConnectorPost,
        "If-Match": dataConnector.etag,
      });
    } else {
      createDataConnector({
        dataConnectorPost,
      });
    }
  }, [
    createDataConnector,
    dataConnector,
    dataConnectorId,
    updateDataConnector,
    schemata,
    flatDataConnector,
  ]);

  const schemaRequiresProvider = useMemo(
    () => hasProviderShortlist(flatDataConnector.schema),
    [flatDataConnector.schema]
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
          dataConnectorResultName,
        })
      );
    }
  }, [createResult, dispatch]);

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
          dataConnectorResultName,
        })
      );
    }
  }, [dispatch, updateResult]);

  useEffect(() => {
    const dataConnectorId = createResult.data?.id;
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
    const shouldSaveCredentials = shouldSaveDataConnectorCredentials(
      dataConnectorSecretPatchList,
      cloudStorageState.saveCredentials,
      validationResult?.isSuccess ?? false
    );
    if (!shouldSaveCredentials) return;

    saveCredentials({
      dataConnectorId,
      dataConnectorSecretPatchList,
    });
  }, [
    createResult.data?.id,
    saveCredentials,
    cloudStorageState.saveCredentials,
    schemata,
    flatDataConnector.options,
    flatDataConnector.schema,
    validationResult?.isSuccess,
  ]);

  useEffect(() => {
    const status =
      validationResult?.isSuccess != true
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
    dispatch(
      dataConnectorFormSlice.actions.setCredentialSaveStatus({
        credentialSaveStatus: status,
      })
    );
  }, [createResult, dispatch, saveCredentialsResult, validationResult]);

  useEffect(() => {
    const dataConnectorId = createResult.data?.id;
    if (dataConnectorId == null) return;
    const shouldLinkToProject = project?.id != null && dataConnector == null;
    if (!shouldLinkToProject) return;

    createProjectLink({
      dataConnectorId,
      dataConnectorToProjectLinkPost: {
        project_id: project.id,
      },
    });
  }, [createResult.data?.id, createProjectLink, dataConnector, project?.id]);

  useEffect(() => {
    if (createProjectLinkResult.isSuccess) {
      dispatch(projectV2Api.util.invalidateTags(["DataConnectors"]));
    }
    const status =
      project?.id == null
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
    dispatch(
      dataConnectorFormSlice.actions.setProjectLinkStatus({
        projectLinkStatus: status,
      })
    );
  }, [createResult, createProjectLinkResult, dispatch, project?.id]);

  // Visual elements
  const disableContinueButton =
    cloudStorageState.step === 1 &&
    (!flatDataConnector.schema ||
      (schemaRequiresProvider && !flatDataConnector.provider));

  const isAddResultLoading = createResult.isLoading;
  const isModifyResultLoading = updateResult.isLoading;
  const actionError = createResult.error || updateResult.error;

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
          addOrEditStorage={addOrEditStorage}
          disableAddButton={disableAddButton}
          disableContinueButton={disableContinueButton}
          hasStoredCredentialsInConfig={hasStoredCredentialsInConfig}
          isResultLoading={isResultLoading}
          dataConnectorId={dataConnectorId}
        />
      )}
    </>
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
