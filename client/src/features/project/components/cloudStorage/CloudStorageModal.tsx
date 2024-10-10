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

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";

import {
  findSensitive,
  getCurrentStorageDetails,
  getSchemaProviders,
  hasProviderShortlist,
} from "../../utils/projectCloudStorage.utils";
import {
  useAddCloudStorageForProjectMutation,
  useGetCloudStorageSchemaQuery,
  useTestCloudStorageConnectionMutation,
  useUpdateCloudStorageMutation,
} from "./projectCloudStorage.api";
import {
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  CLOUD_STORAGE_TOTAL_STEPS,
  EMPTY_CLOUD_STORAGE_DETAILS,
  EMPTY_CLOUD_STORAGE_STATE,
} from "./projectCloudStorage.constants";
import {
  AddCloudStorageForProjectParams,
  AddCloudStorageState,
  CloudStorage,
  CloudStorageDetails,
  CloudStorageDetailsOptions,
  AuxiliaryCommandStatus,
  TestCloudStorageConnectionParams,
  UpdateCloudStorageParams,
} from "./projectCloudStorage.types";

import {
  AddCloudStorageContinueButton,
  AddCloudStorageBackButton,
  AddCloudStorageBodyContent,
  AddCloudStorageConnectionTestResult,
  AddCloudStorageHeaderContent,
} from "./cloudStorageModalComponents.tsx";

import styles from "./CloudStorage.module.scss";

interface CloudStorageModalProps {
  currentStorage?: CloudStorage | null;
  isOpen: boolean;
  toggle: () => void;
  projectId: string;
}
export default function CloudStorageModal({
  currentStorage = null,
  isOpen,
  toggle: originalToggle,
  projectId,
}: CloudStorageModalProps) {
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
    useState<AuxiliaryCommandStatus>("none");
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
  const [addCloudStorageForProject, addResult] =
    useAddCloudStorageForProjectMutation();
  const [modifyCloudStorageForProject, modifyResult] =
    useUpdateCloudStorageMutation();
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
    validationResult.reset();
    setStorageDetails(resetStatus);
    setSuccess(false);
    setCredentialSaveStatus("none");
    setValidationSucceeded(false);
    setRedraw(true); // This forces re-loading the useForm fields
  }, [currentStorage, validationResult]);

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
    const storageParameters: AddCloudStorageForProjectParams | CloudStorage = {
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

    // We manually set success only when we get an ID back. That's just to sho a success message
    if (storageId) {
      // v1
      const storageParametersWithId: UpdateCloudStorageParams = {
        ...storageParameters,
        storage_id: storageId as string,
      };
      modifyCloudStorageForProject(storageParametersWithId).then((result) => {
        if ("data" in result && result.data.storage.storage_id) {
          setSuccess(true);
        }
      });
    } else {
      addCloudStorageForProject(storageParameters).then((result) => {
        if ("data" in result && result.data.storage.storage_id) {
          setSuccess(true);
        }
      });
    }
  }, [
    addCloudStorageForProject,
    currentStorage,
    modifyCloudStorageForProject,
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
      validationResult.reset();
    }
  }, [originalToggle, reset, success, validationResult]);

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

  // Visual elements
  const disableContinueButton =
    state.step === 1 &&
    (!storageDetails.schema ||
      (schemaRequiresProvider && !storageDetails.provider));

  const isAddResultLoading = addResult.isLoading;
  const isModifyResultLoading = modifyResult.isLoading;
  const addResultError = addResult.error;
  const modifyResultError = modifyResult.error;
  const addResultStorageName = addResult?.data?.storage?.name;

  const disableAddButton =
    isAddResultLoading ||
    isModifyResultLoading ||
    !storageDetails.name ||
    !storageDetails.mountPoint ||
    !storageDetails.schema ||
    (hasProviderShortlist(storageDetails.schema) && !storageDetails.provider);
  const addButtonDisableReason = isAddResultLoading
    ? "Please wait, the storage is being added"
    : modifyResult.isLoading
    ? "Please wait, the storage is being modified"
    : !storageDetails.name
    ? "Please provide a name"
    : !storageDetails.mountPoint
    ? "Please provide a mount point"
    : !storageDetails.schema
    ? "Please go back and select a storage type"
    : "Please go back and select a provider";
  const isResultLoading = isAddResultLoading || isModifyResultLoading;

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
        <AddCloudStorageHeaderContent isV2={false} storageId={storageId} />
      </ModalHeader>

      <ModalBody data-cy="cloud-storage-edit-body">
        <AddCloudStorageBodyContent
          addResultStorageName={addResultStorageName}
          credentialSaveStatus={credentialSaveStatus}
          isV2={false}
          redraw={redraw}
          schema={schema}
          schemaError={schemaError}
          schemaIsFetching={schemaIsFetching}
          setStateSafe={setStateSafe}
          setStorageDetailsSafe={setStorageDetailsSafe}
          state={state}
          storageDetails={storageDetails}
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
            hasStoredCredentialsInConfig={false}
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
