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
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowCounterclockwise,
  ChevronLeft,
  ChevronRight,
  CloudFill,
  PencilSquare,
  PlusLg,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { StateModelProject } from "../../project.types";
import {
  findSensitive,
  getCurrentStorageDetails,
  getSchemaProviders,
  hasProviderShortlist,
} from "../../utils/projectCloudStorage.utils";
import AddOrEditCloudStorage from "./AddOrEditCloudStorage";
import {
  useAddCloudStorageForProjectMutation,
  useGetCloudStorageSchemaQuery,
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
  UpdateCloudStorageParams,
} from "./projectCloudStorage.types";

import styles from "./CloudStorage.module.scss";

interface CloudStorageModalProps {
  currentStorage?: CloudStorage | null;
  isOpen: boolean;
  toggle: () => void;
}
export default function CloudStorageModal({
  currentStorage = null,
  isOpen,
  toggle: originalToggle,
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
      setStorageDetails(fullNewDetails);
    },
    [storageDetails]
  );

  // Reset
  const [redraw, setRedraw] = useState(false);
  useEffect(() => {
    if (redraw) setRedraw(false);
  }, [redraw]);
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
    setStorageDetails(resetStatus);
    setSuccess(false);
    setRedraw(true); // This forces re-loading the useForm fields
  }, [currentStorage]);

  // Mutations
  const projectId = useLegacySelector<StateModelProject["metadata"]["id"]>(
    (state) => state.stateModel.project.metadata.id
  );
  const [addCloudStorageForProject, addResult] =
    useAddCloudStorageForProjectMutation();
  const [modifyCloudStorageForProject, modifyResult] =
    useUpdateCloudStorageMutation();

  const addOrEditStorage = useCallback(() => {
    storageDetails.options;

    const storageParameters: AddCloudStorageForProjectParams = {
      name: storageDetails.name as string,
      private: false,
      readonly: storageDetails.readOnly ?? true,
      project_id: `${projectId}`,
      source_path: storageDetails.sourcePath ?? "/",
      target_path: storageDetails.mountPoint as string,
      configuration: { type: storageDetails.schema },
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
    projectId,
    storageDetails,
    storageId,
    schema,
    currentStorage,
    addCloudStorageForProject,
    modifyCloudStorageForProject,
  ]);

  const toggle = useCallback(() => {
    originalToggle();
    if (success) {
      setSuccess(false);
      reset();
    }
  }, [originalToggle, reset, success]);

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
  const continueButtonId = "add-cloud-storage-next";

  const disableAddButton =
    addResult.isLoading ||
    modifyResult.isLoading ||
    !storageDetails.name ||
    !storageDetails.mountPoint ||
    !storageDetails.schema ||
    (hasProviderShortlist(storageDetails.schema) && !storageDetails.provider);
  const addButtonDisableReason = addResult.isLoading
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
  const addButtonId = "add-cloud-storage-continue";

  const continueButton = success ? null : state.step === 3 &&
    state.completedSteps >= 2 ? (
    <div id={`${addButtonId}-div`} className="d-inline-block">
      <Button
        data-cy="cloud-storage-edit-update-button"
        id={`${addButtonId}-button`}
        disabled={disableAddButton}
        onClick={() => addOrEditStorage()}
      >
        {addResult.isLoading || modifyResult.isLoading ? (
          <Loader className="me-1" inline size={16} />
        ) : storageId ? (
          <PencilSquare className={cx("bi", "me-1")} />
        ) : (
          <PlusLg className={cx("bi", "me-1")} />
        )}
        {storageId ? "Update" : "Add"} storage
      </Button>
      {disableAddButton && (
        <UncontrolledTooltip placement="top" target={`${addButtonId}-div`}>
          {addButtonDisableReason}
        </UncontrolledTooltip>
      )}
    </div>
  ) : (
    <div id={`${continueButtonId}-div`} className="d-inline-block">
      <Button
        id={`${continueButtonId}-button`}
        data-cy="cloud-storage-edit-next-button"
        disabled={disableContinueButton}
        onClick={() => {
          setStateSafe({
            completedSteps:
              state.step === 0
                ? CLOUD_STORAGE_TOTAL_STEPS - 1
                : state.step > state.completedSteps
                ? state.step
                : state.completedSteps,
            step: state.step === 0 ? CLOUD_STORAGE_TOTAL_STEPS : state.step + 1,
          });
        }}
      >
        <ChevronRight className={cx("bi", "me-1")} />
        Next
      </Button>
      {disableContinueButton && (
        <UncontrolledTooltip placement="top" target={`${continueButtonId}-div`}>
          {!storageDetails.schema
            ? "Please select a storage type"
            : "Please select a provider or change storage type"}
        </UncontrolledTooltip>
      )}
    </div>
  );

  const backButton =
    addResult.isLoading || modifyResult.isLoading ? null : state.step <= 1 ||
      success ? (
      <Button
        className="btn-outline-rk-green"
        data-cy="cloud-storage-edit-close-button"
        onClick={() => toggle()}
      >
        <XLg className={cx("bi", "me-1")} />
        {success ? "Close" : "Cancel"}
      </Button>
    ) : (
      <Button
        className="btn-outline-rk-green"
        data-cy="cloud-storage-edit-back-button"
        onClick={() => {
          setStateSafe({
            step: state.advancedMode ? 0 : state.step - 1,
          });
        }}
      >
        <ChevronLeft className={cx("bi", "me-1")} />
        Back
      </Button>
    );

  const resetButton = !addResult.isLoading &&
    !modifyResult.isLoading &&
    !success && (
      <Button
        color="outline-danger"
        data-cy="cloud-storage-edit-rest-button"
        onClick={reset}
      >
        <ArrowCounterclockwise className={cx("bi", "me-1")} />
        Reset
      </Button>
    );

  const errorMessage =
    addResult.error || modifyResult.error ? (
      <div className="w-100">
        <RtkOrNotebooksError error={addResult.error || modifyResult.error} />
      </div>
    ) : null;

  const bodyContent = redraw ? (
    <Loader />
  ) : success ? (
    <SuccessAlert dismissible={false} timeout={0}>
      <p className="p-0">
        The storage {addResult?.data?.storage?.name} has been succesfully{" "}
        {storageId ? "updated" : "added"}.
      </p>
    </SuccessAlert>
  ) : schemaIsFetching || !schema ? (
    <Loader />
  ) : schemaError ? (
    <RtkOrNotebooksError error={schemaError} />
  ) : (
    <AddOrEditCloudStorage
      schema={schema}
      setState={setStateSafe}
      setStorage={setStorageDetailsSafe}
      state={state}
      storage={storageDetails}
    />
  );

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
        <CloudFill className={cx("bi", "me-2")} />
        {storageId ? "Edit" : "Add"} Cloud Storage
      </ModalHeader>

      <ModalBody data-cy="cloud-storage-edit-body">{bodyContent}</ModalBody>

      <ModalFooter data-cy="cloud-storage-edit-footer">
        {errorMessage}
        {resetButton}
        {backButton}
        {continueButton}
      </ModalFooter>
    </Modal>
  );
}
