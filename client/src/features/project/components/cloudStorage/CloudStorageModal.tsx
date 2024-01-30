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

import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowCounterclockwise,
  ArrowRepeat,
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
import { isEqual } from "lodash";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { StateModelProject } from "../../project.types";
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
  TestCloudStorageConnectionParams,
  UpdateCloudStorageParams,
} from "./projectCloudStorage.types";
import {
  findSensitive,
  getCurrentStorageDetails,
  getSchemaProviders,
  hasProviderShortlist,
} from "../../utils/projectCloudStorage.utils";
import { SuccessAlert } from "../../../../components/Alert";
import AddOrEditCloudStorage from "./AddOrEditCloudStorage";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";

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
  const projectId = useLegacySelector<StateModelProject["metadata"]["id"]>(
    (state) => state.stateModel.project.metadata.id
  );

  // Fetch available schema when users open the modal
  const {
    data: schema,
    error: schemaError,
    isFetching: schemaIsFetching,
  } = useGetCloudStorageSchemaQuery(undefined, { skip: !isOpen });

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

  // Mutations
  const [addCloudStorageForProject, addResult] =
    useAddCloudStorageForProjectMutation();
  const [modifyCloudStorageForProject, modifyResult] =
    useUpdateCloudStorageMutation();
  const [validateCloudStorageConnection, validateResult] =
    useTestCloudStorageConnectionMutation();

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
      if (!validateResult.isUninitialized) validateResult.reset();
      setStorageDetails(fullNewDetails);
    },
    [storageDetails, validateResult]
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

  // Helper functions
  const validateConnection = () => {
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
      Object.keys(options).forEach((key) => {
        const value = options[key];
        if (value != undefined && value !== "") {
          validateParameters.configuration[key] = value;
        }
      });
    }

    validateCloudStorageConnection(validateParameters);
  };

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

  const continueButton = success ? null : state.step === 1 ? (
    <NextButton
      action={setStateSafe}
      disabled={
        !storageDetails.schema ||
        (schemaRequiresProvider && !storageDetails.provider)
      }
      localId={"add-cloud-storage-next"}
      schemaIsSelected={!!storageDetails.schema}
      step={state.step}
    />
  ) : state.step === 3 && state.completedSteps >= 2 ? (
    <AddOrEditStorageButton
      action={addOrEditStorage}
      disabled={disableAddButton}
      disabledText={addButtonDisableReason}
      isLoading={
        addResult.isLoading ||
        modifyResult.isLoading ||
        validateResult.isLoading
      }
      localId="add-cloud-storage-continue"
      storageExists={!!storageId}
    />
  ) : (
    <TestConnectionAndContinueButtons
      actionState={setStateSafe}
      actionTest={validateConnection}
      continueId="add-cloud-storage-continue"
      resetTest={validateResult.reset}
      step={state.step}
      testId="test-cloud-storage"
      testIsFailure={validateResult.isError}
      testIsOngoing={validateResult.isLoading}
      testIsSuccess={validateResult.isSuccess}
    />
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
        disabled={validateResult.isLoading}
        onClick={() => {
          if (!validateResult.isUninitialized) validateResult.reset();
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
        disabled={validateResult.isLoading}
        onClick={() => {
          if (!validateResult.isUninitialized) validateResult.reset();
          reset();
        }}
      >
        <ArrowCounterclockwise className={cx("bi", "me-1")} />
        Reset
      </Button>
    );

  const connectionResultContent =
    validateResult.isUninitialized ||
    validateResult.isLoading ? null : validateResult.error ? (
      <RtkOrNotebooksError error={validateResult.error} />
    ) : (
      <SuccessAlert timeout={0}>
        <p className="p-0">The connection to the storage works correctly.</p>
      </SuccessAlert>
    );
  const connectionResult = connectionResultContent && (
    <div className={cx("w-100", "my-0")}>{connectionResultContent}</div>
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

      <ModalFooter className="border-top" data-cy="cloud-storage-edit-footer">
        {connectionResult}
        {errorMessage}
        {resetButton}
        {backButton}
        {continueButton}
      </ModalFooter>
    </Modal>
  );
}

interface AddOrEditStorageButtonProps {
  action: () => void;
  disabled?: boolean;
  disabledText?: string;
  isLoading?: boolean;
  localId: string;
  storageExists: boolean;
}
function AddOrEditStorageButton({
  action,
  disabled = false,
  disabledText,
  isLoading = false,
  localId,
  storageExists,
}: AddOrEditStorageButtonProps) {
  const buttonId = `${localId}-button`;
  const divId = `${localId}-div`;

  return (
    <div id={divId} className="d-inline-block">
      <Button
        data-cy="cloud-storage-edit-update-button"
        id={buttonId}
        disabled={disabled}
        onClick={() => action()}
      >
        {isLoading ? (
          <Loader className="me-1" inline size={16} />
        ) : storageExists ? (
          <PencilSquare className={cx("bi", "me-1")} />
        ) : (
          <PlusLg className={cx("bi", "me-1")} />
        )}
        {storageExists ? "Update" : "Add"} storage
      </Button>
      {disabled && (
        <UncontrolledTooltip placement="top" target={divId}>
          {disabledText}
        </UncontrolledTooltip>
      )}
    </div>
  );
}

interface NextButtonProps {
  action: (newState: Partial<AddCloudStorageState>) => void;
  disabled?: boolean;
  localId: string;
  schemaIsSelected: boolean;
  step: number;
}
function NextButton({
  action,
  disabled = false,
  localId,
  schemaIsSelected,
  step,
}: NextButtonProps) {
  const buttonId = `${localId}-button`;
  const divId = `${localId}-div`;
  return (
    <div id={divId} className="d-inline-block">
      <Button
        id={buttonId}
        data-cy="cloud-storage-next-button"
        disabled={disabled}
        onClick={() => {
          action({
            completedSteps: step,
            step: step + 1,
          });
        }}
      >
        <ChevronRight className="bi" />
        Next
      </Button>
      {disabled && (
        <UncontrolledTooltip placement="top" target={divId}>
          {!schemaIsSelected
            ? "Please select a storage type"
            : "Please select a provider or change storage type"}
        </UncontrolledTooltip>
      )}
    </div>
  );
}

interface TestConnectionAndContinueButtonsProps {
  actionState: (newState: Partial<AddCloudStorageState>) => void;
  actionTest: () => void;
  continueId: string;
  resetTest: () => void;
  step: number;
  testId: string;
  testIsFailure: boolean;
  testIsOngoing: boolean;
  testIsSuccess: boolean;
}
function TestConnectionAndContinueButtons({
  actionState,
  actionTest,
  continueId,
  resetTest,
  step,
  testId,
  testIsFailure,
  testIsOngoing,
  testIsSuccess,
}: TestConnectionAndContinueButtonsProps) {
  const buttonTestId = `${testId}-button`;
  const divTestId = `${testId}-div`;
  const testConnectionContent =
    testIsSuccess || testIsFailure ? (
      <>
        Re-test <ArrowRepeat className="bi" />
      </>
    ) : testIsOngoing ? (
      <>
        Testing connection <Loader inline size={16} />
      </>
    ) : (
      <>Test connection</>
    );
  const testConnectionColorClass = testIsSuccess
    ? "btn-outline-rk-green"
    : testIsFailure
    ? "btn-danger"
    : "btn-secondary";
  const testConnectionSection = (
    <div id={divTestId} className="d-inline-block">
      <Button
        color=""
        id={buttonTestId}
        data-cy={buttonTestId}
        className={cx(testConnectionColorClass)}
        disabled={testIsOngoing}
        onClick={() => actionTest()}
      >
        {testConnectionContent}
      </Button>
    </div>
  );

  const buttonContinueId = `${continueId}-button`;
  const divContinueId = `${continueId}-div`;
  const continueContent = testIsSuccess ? (
    <>
      Continue <ChevronRight className="bi" />
    </>
  ) : testIsFailure ? (
    <>
      Continue anyway <XLg className="bi" />
    </>
  ) : null;
  const continueColorClass = testIsSuccess
    ? "btn-secondary"
    : testIsFailure
    ? "btn-outline-danger"
    : "btn-outline-rk-green";
  const continueSection =
    !testIsFailure && !testIsSuccess ? null : (
      <div id={divContinueId} className={cx("d-inline-block", "ms-2")}>
        <Button
          color=""
          id={buttonContinueId}
          data-cy={buttonContinueId}
          className={cx(continueColorClass)}
          disabled={testIsOngoing}
          onClick={() => {
            if (testIsFailure || testIsSuccess) {
              resetTest();
            }
            actionState({
              step: step === 0 ? CLOUD_STORAGE_TOTAL_STEPS : step + 1,
              completedSteps: step === 0 ? CLOUD_STORAGE_TOTAL_STEPS - 1 : step,
            });
          }}
        >
          {continueContent}
        </Button>
        {testIsFailure && (
          <UncontrolledTooltip placement="top" target={divContinueId}>
            Current options are not working. You should fix them and test again.
          </UncontrolledTooltip>
        )}
      </div>
    );

  return (
    <div className="d-inline-block">
      {testConnectionSection}
      {continueSection}
    </div>
  );
}
